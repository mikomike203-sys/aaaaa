'use client';

import TicketList from '@/components/support/TicketList';

export default function ClientSupportPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <TicketList role="Client" />
        </div>
    );
}
