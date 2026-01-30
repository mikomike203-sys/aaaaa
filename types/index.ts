// TypeScript Type Definitions for Tech Developers Platform

export type UserRole = 'admin' | 'commissioner' | 'developer' | 'client' | 'support';
export type CommissionerTier = 'tier1' | 'tier2' | 'tier3';
export type ProjectStatus = 'lead' | 'scoped' | 'deposit_pending' | 'deposit_pending_verification' | 'active' | 'in_review' | 'completed' | 'disputed' | 'cancelled';
export type EscrowStatus = 'no_deposit' | 'pending_verification' | 'deposit_verified' | 'held_for_dispute' | 'released';
export type MilestoneStatus = 'pending' | 'in_progress' | 'delivered' | 'approved' | 'rejected';
export type PaymentMethod = 'card' | 'mpesa' | 'crypto' | 'bank' | 'paypal';
export type PaymentStatus = 'pending_verification' | 'verified' | 'released' | 'refunded' | 'failed';
export type EscrowAction = 'hold' | 'release' | 'refund' | 'adjust';
export type CommissionStatus = 'pending' | 'released' | 'paid';
export type PayoutStatus = 'scheduled' | 'processing' | 'completed' | 'failed';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type NotificationChannel = 'email' | 'sms' | 'in_app' | 'push';
export type KycDocType = 'id' | 'selfie' | 'proof_of_address' | 'tax_cert' | 'other';
export type KycDocStatus = 'pending' | 'approved' | 'rejected';
export type LeadStatus = 'created' | 'sent' | 'viewed' | 'meeting_scheduled' | 'deposit_paid' | 'active' | 'closed';

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    password_hash?: string;
    avatar_url?: string;
    verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Company {
    id: string;
    name: string;
    type?: string;
    tax_id?: string;
    address?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Commissioner {
    id: string;
    user_id: string;
    tier: CommissionerTier;
    rate_percent: number;
    referral_code: string;
    parent_commissioner_id?: string;
    total_revenue: number;
    kyc_status: string;
    created_at: Date;
    updated_at: Date;
    user?: User;
}

export interface Developer {
    id: string;
    user_id: string;
    company_id?: string;
    roles: string[]; // Array of skill tags
    hourly_rate?: number;
    portfolio_links: string[];
    verified: boolean;
    kyc_status: string;
    created_at: Date;
    updated_at: Date;
    user?: User;
    company?: Company;
}

export interface Client {
    id: string;
    user_id: string;
    company_name?: string;
    contact_person?: string;
    created_at: Date;
    updated_at: Date;
    user?: User;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    client_id: string;
    commissioner_id?: string;
    developer_id?: string;
    company_id?: string;
    total_value: number;
    currency: string;
    status: ProjectStatus;
    escrow_status: EscrowStatus;
    escrow_balance: number;
    created_at: Date;
    updated_at: Date;
    client?: Client;
    commissioner?: Commissioner;
    developer?: Developer;
    milestones?: Milestone[];
}

export interface Milestone {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    percent_amount: number;
    due_date?: Date;
    status: MilestoneStatus;
    deliverable_links: string[];
    approved_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Payment {
    id: string;
    project_id: string;
    payer_id?: string;
    method: PaymentMethod;
    gateway?: string;
    currency: string;
    amount: number;
    fiat_equivalent?: number;
    exchange_rate?: number;
    status: PaymentStatus;
    tx_hash?: string;
    raw_payload?: any;
    verified_by_admin_id?: string;
    verified_at?: Date;
    created_at: Date;
}

export interface EscrowLedgerEntry {
    id: string;
    project_id: string;
    payment_id?: string;
    action: EscrowAction;
    amount: number;
    balance_before: number;
    balance_after: number;
    note?: string;
    created_at: Date;
}

export interface Commission {
    id: string;
    project_id: string;
    commissioner_id: string;
    percent: number;
    amount: number;
    status: CommissionStatus;
    released_at?: Date;
    created_at: Date;
}

export interface Referral {
    id: string;
    referrer_id: string;
    referee_id: string;
    override_percent: number;
    created_at: Date;
}

export interface Payout {
    id: string;
    recipient_id: string;
    project_id?: string;
    amount: number;
    method?: string;
    details?: any;
    scheduled_at?: Date;
    executed_at?: Date;
    status: PayoutStatus;
    created_at: Date;
}

export interface Dispute {
    id: string;
    project_id: string;
    raised_by: string;
    reason: string;
    evidence_links: string[];
    status: DisputeStatus;
    investigator_notes?: string;
    resolution?: string;
    created_at: Date;
    resolved_at?: Date;
}

export interface AuditLog {
    id: string;
    actor_id?: string;
    actor_role?: UserRole;
    action: string;
    details?: any;
    created_at: Date;
}

export interface FileRecord {
    id: string;
    project_id?: string;
    uploader_id: string;
    url: string;
    filename?: string;
    file_type?: string;
    metadata?: any;
    created_at: Date;
}

export interface Notification {
    id: string;
    user_id: string;
    channel: NotificationChannel;
    title?: string;
    body: string;
    metadata?: any;
    read_at?: Date;
    created_at: Date;
}

export interface KycDocument {
    id: string;
    user_id: string;
    doc_type: KycDocType;
    url: string;
    status: KycDocStatus;
    verified_at?: Date;
    verified_by?: string;
    notes?: string;
    created_at: Date;
}

export interface Lead {
    id: string;
    commissioner_id: string;
    client_name: string;
    client_phone?: string;
    client_email?: string;
    project_summary?: string;
    budget?: number;
    status: LeadStatus;
    intake_token: string;
    intake_link?: string;
    viewed_at?: Date;
    created_at: Date;
    updated_at: Date;
    commissioner?: Commissioner;
}

// Commission Calculation Result
export interface CommissionCalculation {
    platformFee: number;
    reserveCut: number;
    commissionerAmount: number;
    referralAmount: number;
    developerNet: number;
}

// Developer Role Types (13+)
export const DEVELOPER_ROLES = [
    'frontend',
    'backend',
    'fullstack',
    'mobile',
    'ui_ux',
    'devops',
    'database_architect',
    'crm_builder',
    'school_portal',
    'payment_integration',
    'erp_admin',
    'api_automation',
    'qa_testing',
    'security_engineer',
    'data_bi'
] as const;

export type DeveloperRole = typeof DEVELOPER_ROLES[number];

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Intake Page Data
export interface IntakePageData {
    lead: Lead;
    commissioner: Commissioner & { user: User };
    projectSummary: string;
    estimatedTotal: number;
    milestones: Array<{
        title: string;
        description: string;
        percent: number;
    }>;
}
