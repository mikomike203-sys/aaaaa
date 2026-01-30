// Flutterwave Integration (Mpesa + cards)
import axios from 'axios';
import crypto from 'crypto';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const FLW_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY!;

export const flutterwavePayments = {
    /**
     * Initialize payment (cards or Mpesa)
     */
    async initializePayment(
        amount: number,
        currency: string = 'KES',
        email: string,
        phone: string,
        projectId: string,
        redirectUrl: string
    ) {
        const payload = {
            tx_ref: `PROJ-${projectId}-${Date.now()}`,
            amount,
            currency,
            redirect_url: redirectUrl,
            customer: {
                email,
                phone_number: phone
            },
            customizations: {
                title: 'Tech Developers KE & EA',
                description: `Deposit for project ${projectId}`
            },
            payment_options: 'card,mpesa,mobilemoneykenya',
            meta: {
                project_id: projectId,
                payment_type: 'deposit'
            }
        };

        const response = await axios.post(
            `${FLUTTERWAVE_BASE_URL}/payments`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    },

    /**
     * Verify payment
     */
    async verifyPayment(transactionId: string) {
        const response = await axios.get(
            `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
            {
                headers: {
                    Authorization: `Bearer ${FLW_SECRET_KEY}`
                }
            }
        );

        return response.data;
    },

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(signature: string, payload: any): boolean {
        const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET!;
        const hash = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return hash === signature;
    }
};
