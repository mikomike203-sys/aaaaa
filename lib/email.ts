// Email Sending via Resend
import { Resend } from 'resend';

let resendInstance: Resend | null = null;

const getResend = () => {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY is not set');
            return null;
        }
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
};

export const emailService = {
    /**
     * Send payment receipt email
     */
    async sendPaymentReceipt(
        to: string,
        projectTitle: string,
        amount: number,
        currency: string,
        txId: string
    ) {
        const resend = getResend();
        if (!resend) return;
        return await resend.emails.send({
            from: 'Tech Developers <noreply@techdev.ke>',
            to,
            subject: `Receipt: ${currency} ${amount} received - ${projectTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f7a5a; margin: 0;">Tech Developers</h1>
                <p style="color: #666; font-size: 14px;">Official Payment Receipt</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <h2 style="margin-top: 0; color: #333; font-size: 18px;">Payment Received</h2>
                <p style="font-size: 15px; color: #555;">We have successfully received your deposit for your project.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #777;">Amount:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${currency} ${amount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #777;">Project:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${projectTitle}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #777;">Ref ID:</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${txId}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 25px;">
                <p style="color: #555; line-height: 1.5;">This deposit is now held in our secure <strong>Escrow System</strong>. It will be verified by our finance team, and your project will move to <strong>Active</strong> status within 2 hours.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/client" style="display: inline-block; padding: 12px 24px; background-color: #1f7a5a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Project</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">You are protected by our 110% refund guarantee if milestones are not met. Questions? Reply to this email or contact support@techdev.ke</p>
        </div>
      `
        });
    },

    /**
     * Send deposit verified email
     */
    async sendDepositVerified(
        to: string,
        projectTitle: string,
        firstMilestoneDate?: string
    ) {
        const resend = getResend();
        if (!resend) return;
        return await resend.emails.send({
            from: 'Tech Developers <noreply@techdev.ke>',
            to,
            subject: `Work Approved: ${projectTitle} is now Active!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #1f7a5a; padding: 20px; border-radius: 6px 6px 0 0;">
                <h1 style="color: white; margin: 0;">Work Started!</h1>
            </div>
            
            <p style="font-size: 16px; color: #333;">Great news! Your deposit has been verified and work has officially commenced on <strong>${projectTitle}</strong>.</p>
            
            <div style="background-color: #e6f4ea; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1f7a5a;">
                <p style="margin: 0; color: #1f7a5a; font-weight: bold;">Status: ACTIVE</p>
                ${firstMilestoneDate ? `<p style="margin: 5px 0 0; color: #555;">Next Milestone Expected: <strong>${firstMilestoneDate}</strong></p>` : ''}
            </div>
            
            <p style="color: #555; line-height: 1.5;">You can now communicate with your development team directly through the project workspace.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/client" style="display: inline-block; padding: 12px 24px; background-color: #1f7a5a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Workspace</a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">Tech Developers Kenya & East Africa</p>
        </div>
      `
        });
    },

    /**
     * Send intake link to client
     */
    async sendIntakeLink(
        to: string,
        commissionerName: string,
        intakeLink: string
    ) {
        const resend = getResend();
        if (!resend) return;
        return await resend.emails.send({
            from: 'Tech Developers <noreply@techdev.ke>',
            to,
            subject: `Review your new project from ${commissionerName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="margin-bottom: 25px;">
                <h2 style="color: #333;">Hello from Tech Developers!</h2>
                <p style="font-size: 15px; color: #555;"><strong>${commissionerName}</strong> has prepared a dedicated project page for you at Tech Developers Kenya & East Africa.</p>
            </div>
            
            <div style="background-color: #f0f7f4; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">You can use this page to review your project scope, budget, and <strong>refund guarantees</strong>. To proceed, you can either:</p>
                <ul style="color: #555; margin-top: 10px;">
                    <li>Book a 15-minute consultation call</li>
                    <li>Pay the 43% starter deposit to lock in your timeline immediately</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${intakeLink}" style="display: inline-block; padding: 14px 28px; background-color: #1f7a5a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Open Project Page</a>
            </div>
            
            <div style="margin-top: 30px; font-size: 14px; color: #777;">
                <p><strong>Note:</strong> All payments are secured via Paystack and held in our Escrow system until you approve final delivery.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Tech Developers Kenya - Empowering East African Innovation.</p>
        </div>
      `
        });
    },

    /**
     * Send client invitation email
     */
    async sendClientInvite(
        to: string,
        clientName: string,
        commissionerName: string,
        tempPassword: string
    ) {
        const resend = getResend();
        if (!resend) return;
        return await resend.emails.send({
            from: 'Tech Developers <noreply@techdev.ke>',
            to,
            subject: `Invitation to Tech Developers from ${commissionerName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f7a5a; margin: 0;">Welcome, ${clientName}!</h1>
            </div>
            
            <p style="font-size: 16px; color: #333;"><strong>${commissionerName}</strong> has invited you to join their private workspace on Tech Developers Kenya.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <p style="margin: 0 0 10px; color: #555;">Use these credentials to log in:</p>
                <div style="background-color: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
                    <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
                </div>
            </div>
            
            <p style="color: #555;">Please log in and change your password immediately.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #1f7a5a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In Now</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Tech Developers Kenya & East Africa</p>
        </div>
      `
        });
    },

    /**
     * Send Invoice Email
     */
    async sendInvoice(
        to: string,
        clientName: string,
        amount: number,
        description: string,
        invoiceNumber: string,
        paymentUrl: string
    ) {
        const resend = getResend();
        if (!resend) return;
        return await resend.emails.send({
            from: 'Tech Developers <billing@techdev.ke>',
            to,
            subject: `Invoice #${invoiceNumber} from Tech Developers`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f7a5a; margin: 0;">Tech Developers</h1>
                <p style="color: #666; font-size: 14px;">Invoice Due</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <h2 style="margin-top: 0; color: #333; font-size: 18px;">Invoice #${invoiceNumber}</h2>
                <p style="font-size: 15px; color: #555;">Dear ${clientName}, a new invoice has been generated for your project.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #777;">Description:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${description}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #777;">Amount:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right; font-size: 18px;">KES ${amount.toLocaleString()}</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="${paymentUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1f7a5a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Pay Invoice Now</a>
            </div>
            
            <p style="color: #777; font-size: 14px; text-align: center;">Click the button above to pay securely via Card or M-Pesa.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Tech Developers Kenya & East Africa</p>
        </div>
      `
        });
    }
};
