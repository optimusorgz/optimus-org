'use client';

import React, { useRef, useEffect, useState } from 'react';
import QRCodeWrapper from './QRCodeWrapper';
import createClientComponentClient from '@/api/client';

interface EventDetails {
  id: string;
  title: string | null;
  location: string | null;
  organizer_name: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  ticket_price: number | null;
  max_participants: number | null;
  banner_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface TicketModalProps {
  ticketId: string;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticketId, eventId, isOpen, onClose }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const supabase = createClientComponentClient;

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        location,
        organizer_name,
        start_date,
        end_date,
        status,
        ticket_price,
        max_participants,
        banner_url,
        contact_email,
        contact_phone
      `)
      .eq('id', eventId)
      .single();

      if (!error && data) setEventDetails(data as EventDetails);
    };

    fetchData();
  }, [eventId, supabase]);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticketId}.svg`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-300 bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-2xl max-w-sm w-full m-4 transform transition-all flex flex-col items-center border-white border-3"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Event Title */}
        {eventDetails && (
          <>
            <p className="text-white-400 text-xl uppercase">{eventDetails.organizer_name}</p>
            <h2 className="text-lg font-bold text-center text-green-400">{eventDetails.title}</h2>

            <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
              <div>
                <p className="uppercase text-white">Date</p>
                <p>{eventDetails.start_date ? new Date(eventDetails.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}</p>
              </div>
              <div>
                <p className="uppercase text-white">Time</p>
                <p>{eventDetails.start_date ? new Date(eventDetails.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>


            {/* QR Code */}
            <div ref={qrRef} className="mt-4 p-1 bg-white rounded">
              <QRCodeWrapper value={ticketId} size={200} />
            </div>

            {/* Location */}
            {eventDetails.location && (
              <p className="text-center text-sm text-gray-400 mt-4">
                Location: {eventDetails.location}
              </p>
            )}

            {/* Checked-in Status */}
            <p className="text-center text-sm mt-1">
              Checked IN: <span className="text-red-500">No</span>
            </p>

            {/* Ticket ID */}
            <p className="text-center text-xs mt-1 text-gray-500">Ticket ID: {ticketId}</p>
          </>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-between w-full">
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition"
          >
            Download QR
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
