// components/ParticipatedEventsList.tsx
'use client';

import React, { useState } from 'react';
import TicketModal from './TicketModal';

interface Event {
  id: string;
  name: string;
  date: string;
  ticket_uid: string;
  status: string;
  is_paid: string;
}

interface EventListProps {
  events: Event[];
  title: string;
}

const ParticipatedEventsList: React.FC<EventListProps> = ({ events, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicketUid, setCurrentTicketUid] = useState('');

  const handleViewTicket = (ticketUid: string) => {
    setCurrentTicketUid(ticketUid);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTicketUid('');
  };

  return (
    <>
      <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-sm h-full overflow-y-scroll scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-900">
        <h2 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 mb-4">{title}</h2>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {events.length > 0 ? (
            events
              .filter(event => event.is_paid === 'PAID' || event.is_paid === 'free')
              .map(event => (
                <div
                  key={event.id}
                  className="flex space-x-3 items-center justify-between border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex space-x-3 items-start flex-1 min-w-0">
                    <div className="w-1 h-10 mt-1 rounded-full bg-green-400 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white leading-snug truncate">{event.name}</p>
                      <p className="mt-1 text-xs text-gray-300">Date: {event.date}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewTicket(event.ticket_uid)}
                    className="ml-4 px-3 py-1 text-xs font-medium text-gray-900 bg-green-400 rounded hover:bg-green-500 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 flex-shrink-0"
                  >
                    View Ticket
                  </button>
                </div>
              ))
          ) : (
            <p className="text-gray-300">No events found in this category.</p>
          )}
        </div>
      </div>

      <TicketModal ticketId={currentTicketUid} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default ParticipatedEventsList;
