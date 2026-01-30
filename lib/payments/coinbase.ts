// Coinbase Commerce Integration (Crypto)
import axios from 'axios';
import crypto from 'crypto';

const COINBASE_BASE_URL = 'https://api.commerce.coinbase.com';
const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY!;

export const coinbasePayments = {
    /**
     * Create charge for crypto payment
     */
    async createCharge(
        amount: number,
        currency: string = 'USD',
        projectId: string,
        redirectUrl: string,
        cancelUrl: string
    ) {
        const payload = {
            name: 'Project Deposit',
            description: `43% deposit for project ${projectId}`,
            local_price: {
                amount: amount.toString(),
                currency
            },
            pricing_type: 'fixed_price',
            redirect_url: redirectUrl,
            cancel_url: cancelUrl,
            metadata: {
                project_id: projectId,
                payment_type: 'deposit'
            }
        };

        const response = await axios.post(
            `${COINBASE_BASE_URL}/charges`,
            payload,
            {
                headers: {
                    'X-CC-Api-Key': COINBASE_API_KEY,
                    'X-CC-Version': '2018-03-22',
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.data;
    },

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(signature: string, payload: string): boolean {
        const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET!;
        const hash = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');
        return hash === signature;
    },

    /**
     * Get charge details
     */
    async getCharge(chargeId: string) {
        const response = await axios.get(
            `${COINBASE_BASE_URL}/charges/${chargeId}`,
            {
                headers: {
                    'X-CC-Api-Key': COINBASE_API_KEY,
                    'X-CC-Version': '2018-03-22'
                }
            }
        );

        return response.data.data;
    }
};
