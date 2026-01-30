// Escrow and Commission Calculation Logic
import { CommissionCalculation } from '@/types';
import { supabaseAdmin } from './db';

// Configuration (can be moved to env or database)
export const PLATFORM_CONFIG = {
    DEPOSIT_PERCENT: 43,
    PLATFORM_FEE_PERCENT: 10,
    RESERVE_PERCENT: 1.5,
    DEFAULT_COMMISSION_PERCENT: 25,
    REFERRAL_OVERRIDE_PERCENT: 5,
    REFUND_MULTIPLIER: 1.10, // 110% refund
    TIER_RATES: {
        tier1: 25,
        tier2: 27,
        tier3: 30
    }
};

/**
 * Calculate commission splits for a project
 */
export function calculateCommission(
    totalValue: number,
    commissionerRate: number,
    hasReferral: boolean = false
): CommissionCalculation {
    const platformFee = (totalValue * PLATFORM_CONFIG.PLATFORM_FEE_PERCENT) / 100;
    const reserveCut = (totalValue * PLATFORM_CONFIG.RESERVE_PERCENT) / 100;
    const commissionerAmount = (totalValue * commissionerRate) / 100;
    const referralAmount = hasReferral ? (totalValue * PLATFORM_CONFIG.REFERRAL_OVERRIDE_PERCENT) / 100 : 0;
    const developerNet = totalValue - platformFee - reserveCut - commissionerAmount - referralAmount;

    return {
        platformFee: Number(platformFee.toFixed(2)),
        reserveCut: Number(reserveCut.toFixed(2)),
        commissionerAmount: Number(commissionerAmount.toFixed(2)),
        referralAmount: Number(referralAmount.toFixed(2)),
        developerNet: Number(developerNet.toFixed(2))
    };
}

/**
 * Create escrow hold entry when payment is verified
 */
export async function createEscrowHold(
    projectId: string,
    paymentId: string,
    amount: number,
    currentBalance: number = 0
): Promise<any> {
    const newBalance = currentBalance + amount;

    const { data: ledgerEntry, error: ledgerError } = await supabaseAdmin
        .from('escrow_ledger')
        .insert({
            project_id: projectId,
            payment_id: paymentId,
            action: 'hold',
            amount: amount,
            balance_before: currentBalance,
            balance_after: newBalance,
            note: 'Deposit verified and held in escrow'
        })
        .select()
        .single();

    if (ledgerError) throw ledgerError;

    // Update project escrow balance
    const { error: projectError } = await supabaseAdmin
        .from('projects')
        .update({
            escrow_balance: newBalance,
            escrow_status: 'deposit_verified',
            status: 'active'
        })
        .eq('id', projectId);

    if (projectError) throw projectError;

    return ledgerEntry;
}

/**
 * Release escrow funds and create payout records
 */
export async function releaseEscrow(
    projectId: string,
    amount: number,
    currentBalance: number,
    developerId: string,
    commissionerId: string,
    commissionerRate: number,
    referrerId?: string
): Promise<any> {
    const hasReferral = !!referrerId;
    const calculation = calculateCommission(amount, commissionerRate, hasReferral);
    const newBalance = currentBalance - amount;

    // Create escrow release entry
    const { data: ledgerEntry, error: ledgerError } = await supabaseAdmin
        .from('escrow_ledger')
        .insert({
            project_id: projectId,
            action: 'release',
            amount: amount,
            balance_before: currentBalance,
            balance_after: newBalance,
            note: 'Funds released for milestone completion'
        })
        .select()
        .single();

    if (ledgerError) throw ledgerError;

    // Update project escrow balance
    const { error: projectError } = await supabaseAdmin
        .from('projects')
        .update({ escrow_balance: newBalance })
        .eq('id', projectId);

    if (projectError) throw projectError;

    // Create payout records
    const payouts = [
        {
            recipient_id: developerId,
            project_id: projectId,
            amount: calculation.developerNet,
            method: 'pending',
            status: 'scheduled'
        },
        {
            recipient_id: commissionerId,
            project_id: projectId,
            amount: calculation.commissionerAmount,
            method: 'pending',
            status: 'scheduled'
        }
    ];

    if (hasReferral && referrerId) {
        payouts.push({
            recipient_id: referrerId,
            project_id: projectId,
            amount: calculation.referralAmount,
            method: 'pending',
            status: 'scheduled'
        });
    }

    const { data: payoutRecords, error: payoutError } = await supabaseAdmin
        .from('payouts')
        .insert(payouts)
        .select();

    if (payoutError) throw payoutError;

    // Create commission record
    const { data: commissionRecord, error: commissionError } = await supabaseAdmin
        .from('commissions')
        .insert({
            project_id: projectId,
            commissioner_id: commissionerId,
            percent: commissionerRate,
            amount: calculation.commissionerAmount,
            status: 'released'
        })
        .select()
        .single();

    if (commissionError) throw commissionError;

    return {
        ledgerEntry,
        payouts: payoutRecords,
        commission: commissionRecord,
        calculation
    };
}

/**
 * Issue 110% refund
 */
export async function issueRefund(
    projectId: string,
    paymentId: string,
    paidAmount: number,
    currentBalance: number,
    reason: string
): Promise<any> {
    const refundAmount = paidAmount * PLATFORM_CONFIG.REFUND_MULTIPLIER;
    const newBalance = currentBalance - paidAmount;

    // Create escrow refund entry
    const { data: ledgerEntry, error: ledgerError } = await supabaseAdmin
        .from('escrow_ledger')
        .insert({
            project_id: projectId,
            payment_id: paymentId,
            action: 'refund',
            amount: paidAmount,
            balance_before: currentBalance,
            balance_after: newBalance,
            note: `110% refund issued: ${reason}`
        })
        .select()
        .single();

    if (ledgerError) throw ledgerError;

    // Update project
    const { error: projectError } = await supabaseAdmin
        .from('projects')
        .update({
            escrow_balance: newBalance,
            escrow_status: 'released',
            status: 'cancelled'
        })
        .eq('id', projectId);

    if (projectError) throw projectError;

    // Update payment status
    const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', paymentId);

    if (paymentError) throw paymentError;

    return {
        ledgerEntry,
        refundAmount,
        extraAmount: refundAmount - paidAmount
    };
}
