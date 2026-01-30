// Paystack Integration (Cards, Bank Transfer, Mobile Money)
import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export const paystackPayments = {
    /**
     * Initialize payment transaction
     */
    async initializeTransaction(
        email: string,
        amount: number,
        callbackUrl?: string,
        metadata: any = {}
    ) {
        const payload = {
            amount: Math.round(amount * 100), // Convert to kobo/cents
            email,
            currency: 'KES',
            callback_url: callbackUrl || `${process.env.NEXTAUTH_URL}/payment/verify`,
            metadata: {
                payment_type: 'invoice', // Default
                ...metadata
            },
            channels: ['card', 'bank', 'mobile_money', 'bank_transfer']
        };

        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    },

    /**
     * Verify payment transaction
     */
    async verifyTransaction(reference: string) {
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        return response.data;
    },

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(signature: string, payload: string): boolean {
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(payload)
            .digest('hex');
        return hash === signature;
    },

    /**
     * Initialize refund
     */
    async createRefund(transactionReference: string, amount?: number) {
        const payload = amount
            ? { transaction: transactionReference, amount: Math.round(amount * 100) }
            : { transaction: transactionReference };

        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/refund`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    }
};
