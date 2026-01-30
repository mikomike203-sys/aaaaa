// Database connection and query helper using Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Client for browser (with anon key)
export const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database query helpers
export const db = {
    // Users
    async getUserById(id: string) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async getUserByEmail(email: string) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error) throw error;
        return data;
    },

    // Projects
    async getProjectById(id: string) {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select(`
        *,
        client:clients(*,user:users(*)),
        commissioner:commissioners(*,user:users(*)),
        developer:developers(*,user:users(*)),
        milestones:project_milestones(*)
      `)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async getProjectsByClient(clientId: string) {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*, milestones:project_milestones(*)')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getProjectsByCommissioner(commissionerId: string) {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*, client:clients(*,user:users(*)), milestones:project_milestones(*)')
            .eq('commissioner_id', commissionerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getProjectsByDeveloper(developerId: string) {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*, client:clients(*,user:users(*)), milestones:project_milestones(*)')
            .eq('developer_id', developerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Leads
    async getLeadByToken(token: string) {
        const { data, error } = await supabaseAdmin
            .from('leads')
            .select('*, commissioner:commissioners(*,user:users(*))')
            .eq('intake_token', token)
            .single();
        if (error) throw error;
        return data;
    },

    async getLeadsByCommissioner(commissionerId: string) {
        const { data, error } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('commissioner_id', commissionerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Payments
    async getPaymentsPendingVerification() {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select('*, project:projects(*)')
            .eq('status', 'pending_verification')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getPaymentById(id: string) {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // Escrow Ledger
    async getEscrowLedgerByProject(projectId: string) {
        const { data, error } = await supabaseAdmin
            .from('escrow_ledger')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Commissions
    async getCommissionsByCommissioner(commissionerId: string) {
        const { data, error } = await supabaseAdmin
            .from('commissions')
            .select('*, project:projects(*)')
            .eq('commissioner_id', commissionerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Audit Logs
    async createAuditLog(actorId: string, actorRole: string, action: string, details: any) {
        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                actor_id: actorId,
                actor_role: actorRole,
                action,
                details
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Notifications
    async createNotification(userId: string, channel: string, title: string, body: string, metadata?: any) {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                channel,
                title,
                body,
                metadata
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
