// Commission Calculation Service
import { supabaseAdmin } from '@/lib/db';

export type CommissionerTier = 'bronze' | 'silver' | 'gold';
export type CommissionerLevel = CommissionerTier;

export function getLevelBadgeRaw(level: CommissionerTier) {
    switch (level) {
        case 'gold':
            return { label: 'Gold', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
        case 'silver':
            return { label: 'Silver', color: 'bg-gray-100 text-gray-800 border border-gray-200' };
        default:
            return { label: 'Bronze', color: 'bg-orange-100 text-orange-800 border border-orange-200' };
    }
}

export interface CommissionBreakdown {
    direct: number;
    parent: number;
    agency: number;
    total_to_commissioners: number;
}

/**
 * Calculate commission payouts for a completed project
 * 
 * Rules:
 * - Bronze: 25% direct
 * - Silver: 27% direct
 * - Gold: 30% direct
 * - Parent Override: 5% (from agency share, NOT from direct)
 * - Hard Cap: 35% total (direct + parent combined)
 * 
 * @param projectValue Total project value in KES
 * @param commissionerTier Tier of the direct commissioner
 * @param hasParent Whether the commissioner has a parent/referrer
 * @returns Commission breakdown
 */
export function calculatePayouts(
    projectValue: number,
    commissionerTier: CommissionerTier,
    hasParent: boolean = false
): CommissionBreakdown {
    // Direct commission percentages by tier
    const directRates: Record<CommissionerTier, number> = {
        bronze: 0.25, // 25%
        silver: 0.27, // 27%
        gold: 0.30,   // 30%
    };

    const PARENT_OVERRIDE_RATE = 0.05; // 5%
    const HARD_CAP = 0.35; // 35% maximum total

    // Calculate direct commission
    let direct = projectValue * directRates[commissionerTier];

    // Calculate parent override (if applicable)
    let parent = hasParent ? projectValue * PARENT_OVERRIDE_RATE : 0;

    // Apply hard cap
    const totalCommission = direct + parent;
    if (totalCommission > projectValue * HARD_CAP) {
        // Scale down proportionally if over cap
        const cappedTotal = projectValue * HARD_CAP;
        const ratio = cappedTotal / totalCommission;
        direct = direct * ratio;
        parent = parent * ratio;
    }

    // Agency gets the remainder
    const agency = projectValue - direct - parent;

    return {
        direct: Math.round(direct),
        parent: Math.round(parent),
        agency: Math.round(agency),
        total_to_commissioners: Math.round(direct + parent),
    };
}

/**
 * Create commission transaction records for a project
 * 
 * @param projectId The project ID
 * @param commissionerId The direct commissioner ID
 * @param projectValue Total project value
 */
export async function createCommissionRecords(
    projectId: string,
    commissionerId: string,
    projectValue: number
) {
    try {
        // Get commissioner details including tier and parent
        const { data: commissioner, error: commError } = await supabaseAdmin
            .from('commissioners')
            .select('tier, user:users(referrer_id)')
            .eq('id', commissionerId)
            .single();

        if (commError || !commissioner) {
            throw new Error('Commissioner not found');
        }

        const tier = commissioner.tier as CommissionerTier;
        const referrerId = commissioner.user?.referrer_id;

        // Calculate payouts
        const breakdown = calculatePayouts(projectValue, tier, !!referrerId);

        // Create transactions array
        const transactions = [];

        // Direct commission transaction
        transactions.push({
            project_id: projectId,
            commissioner_id: commissionerId,
            amount: breakdown.direct,
            commission_type: 'direct',
            status: 'pending',
        });

        // Parent override transaction (if applicable)
        if (referrerId && breakdown.parent > 0) {
            // Get parent commissioner ID
            const { data: parentComm } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', referrerId)
                .single();

            if (parentComm) {
                transactions.push({
                    project_id: projectId,
                    commissioner_id: parentComm.id,
                    amount: breakdown.parent,
                    commission_type: 'override',
                    status: 'pending',
                });
            }
        }

        // Anti-duplication: Check if commissions already exist for this project
        const { data: existingComms } = await supabaseAdmin
            .from('commissions')
            .select('id')
            .eq('project_id', projectId)
            .limit(1);

        if (existingComms && existingComms.length > 0) {
            return {
                success: true,
                message: 'Commissions already calculated for this project',
                breakdown,
            };
        }

        // Insert commission transactions
        const { data, error } = await supabaseAdmin
            .from('commissions')
            .insert(transactions)
            .select();

        if (error) throw error;

        // Update project commission status
        await supabaseAdmin
            .from('projects')
            .update({ commission_status: 'calculated' })
            .eq('id', projectId);

        return {
            success: true,
            breakdown,
            transactions: data,
        };
    } catch (error: any) {
        console.error('Error creating commission records:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}
