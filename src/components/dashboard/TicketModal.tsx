// components/TicketModal.tsx
'use client';

import React, { useRef } from 'react';
import QRCodeWrapper from './QRCodeWrapper';

interface TicketModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticketId, isOpen, onClose }) => {
  const qrRef = useRef<HTMLDivElement>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
          Ticket Information
        </h3>

        <div className="space-y-4 flex flex-col items-center">
          <p className="text-gray-300 text-sm text-center">Your Ticket ID:</p>
          

          <div ref={qrRef} className="mt-4">
            <QRCodeWrapper value={ticketId} size={200} />
          </div>

          <p className="text-xs text-gray-500 text-center">
            Keep this ticket safe for event check-in.
          </p>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium text-white bg-green-400 rounded hover:bg-green-500 transition duration-150"
          >
            Download QR
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
