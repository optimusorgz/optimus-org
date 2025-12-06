'use client';

import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import CRUDForm from '@/components/admin-dashboard/CRUDForm';
import Modal from '@/components/ui/Modal';
import { Event } from '@/lib/types/supabase';
import { FormField } from '@/lib/types/form';
import { Plus, Eye, Edit } from 'lucide-react';

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

            {/* Desktop Table */}
            <div className="hidden md:block">
                <DataTable
                    data={events}
                    columns={columns}
                    tableName="events"
                    onViewRegistrations={handleViewRegistrations}
                    onDelete={handleDelete}
                    onEdit={handleOpenEdit}
                />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
  {events.map((event) => (
    <div
      key={event.id}
      className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{event.title}</h2>
        <div className="flex justify-end mt-2 space-x-2 text-white">
            <span title="Edit" className="cursor-pointer">
                <Edit onClick={(e) => { e.stopPropagation(); handleOpenEdit(event); }} />
            </span>
            
            <span title="Registrations" className="cursor-pointer">
                <Eye onClick={(e) => { e.stopPropagation(); handleViewRegistrations(event); }} />
            </span>
        </div>
      </div>
        <span
          className={`px-2 py-1 rounded-md text-sm font-semibold ${
            event.status.toLowerCase() === 'approved'
              ? 'bg-green-500 text-white'
              : event.status.toLowerCase() === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {event.status}
        </span>

      {/* Optional: small icons for actions (Edit/Delete/Registrations) like your previous DataTable */}
    </div>
  ))}
</div>

            {/* Event Details Modal for Mobile */}
            {selectedEvent && (
                <Modal onClose={() => setSelectedEvent(null)}>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                        <span className="font-semibold">Status:</span> {selectedEvent.status}
                        
                        <p>
                            <span className="font-semibold">Location:</span> {selectedEvent.location}
                        </p>
                        <p>
                            <span className="font-semibold">Start Date:</span>{' '}
                            {new Date(selectedEvent.start_date).toLocaleDateString()}
                        </p>
                        <p>
                            <span className="font-semibold">Ticket Price:</span> {selectedEvent.ticket_price || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Max Participants:</span> {selectedEvent.max_participants || 'N/A'}
                        </p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => handleOpenEdit(selectedEvent)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Edit
                            </button>
                            
                            <button
                                onClick={() => handleViewRegistrations(selectedEvent)}
                                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                            >
                                Registrations
                            </button>
                        </div>
                    </div>
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

            {/* Registration View Modal */}
            {isRegistrationViewOpen && selectedEvent && (
                <Modal onClose={() => setIsRegistrationViewOpen(false)}>
                    <EventRegistrationsView
                        eventId={selectedEvent.id}
                        onBack={() => setIsRegistrationViewOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
