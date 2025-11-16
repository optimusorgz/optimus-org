// /src/app/dashboard/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import CRUDForm from '@/components/admin-dashboard/CRUDForm';
import Modal from '@/components/ui/Modal';
import { Event } from '@/lib/types/supabase';
import { FormField } from '@/lib/types/form';
import { Plus } from 'lucide-react';

// Import EventRegistrationsView
import EventRegistrationsView from '@/components/dashboard/hostevent/EventRegistrationsView';

const EVENT_FIELDS: FormField[] = [
    { name: 'title', label: 'Event Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'], required: true },
    { name: 'ticket_price', label: 'Ticket Price', type: 'number', required: false },
    { name: 'max_participants', label: 'Max Participants', type: 'number', required: false },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // State for registrations view modal
    const [isRegistrationViewOpen, setIsRegistrationViewOpen] = useState(false);

    const supabase = createClient;

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) console.error('Error fetching events:', error);
        if (data) setEvents(data as Event[]);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleOpenInsert = () => {
        setSelectedEvent(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (event: Event) => {
        setSelectedEvent(event);
        setIsFormOpen(true);
    };

    const handleFormSuccess = (action: 'inserted' | 'updated') => {
        alert(`Event successfully ${action}.`);
        setIsFormOpen(false);
        fetchEvents();
    };

    // Open registrations
    const handleViewRegistrations = (event: Event) => {
        setSelectedEvent(event);
        setIsRegistrationViewOpen(true);
    };

    const handleDelete = async (eventId: string | number) => {
        const idToDelete = String(eventId);
        if (!confirm('Are you sure you want to DELETE this event?')) return;

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', idToDelete);

        if (error) {
            console.error('Delete error:', error);
            alert(`Error deleting event: ${error.message}`);
        } else {
            fetchEvents();
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id', render: (id: string) => `${id.substring(0, 6)}...` },
        { header: 'Title', accessorKey: 'title' },
        { header: 'Status', accessorKey: 'status' },
        {
            header: 'Start Date',
            accessorKey: 'start_date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">
                🗓️ Event Management
            </h1>

            <div className="flex justify-between items-center">
                <ExportButton data={events} filename="events_data" />
                <button
                    onClick={handleOpenInsert}
                    className="flex items-center bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add New Event
                </button>
            </div>

            <DataTable
                data={events}
                columns={columns}
                tableName="events"
                onViewRegistrations={handleViewRegistrations}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
            />

            {/* Registration View Modal */}
            {isRegistrationViewOpen && selectedEvent && (
                <Modal onClose={() => setIsRegistrationViewOpen(false)}>
                    <EventRegistrationsView
                        eventId={selectedEvent.id}
                        onBack={() => setIsRegistrationViewOpen(false)} // FIXED
                    />
                </Modal>
            )}

            {/* CRUD Form Modal */}
            {isFormOpen && (
                <Modal onClose={() => setIsFormOpen(false)}>
                    <CRUDForm
                        table="events"
                        initialData={selectedEvent}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsFormOpen(false)}
                        fields={EVENT_FIELDS}
                    />
                </Modal>
            )}
        </div>
    );
}
