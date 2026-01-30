'use client';
import TicketDetailView from '@/components/support/TicketDetailView';
export default function DeveloperTicketDetail({ params }: { params: { id: string } }) { return <TicketDetailView id={params.id} role="developer" />; }
