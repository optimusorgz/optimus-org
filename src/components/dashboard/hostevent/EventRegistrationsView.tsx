// components/dashboard/hostevent/EventRegistrationsView.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import createClient from '@/api/client';
import { CheckCircle2, XCircle, Clock, Loader2, ArrowUpDown, Download } from 'lucide-react'; // Added Download icon

interface Registration {
  id: string;
  registration_date: string;
  is_paid: string;
  status: 'paid' | 'free';
  form_data: { [key: string]: any };
  check_in: string;
}

interface EventRegistrationsViewProps {
  eventId: string;
  onBack: () => void;
}

const EventRegistrationsView: React.FC<EventRegistrationsViewProps> = ({ eventId, onBack }) => {
  const supabase = createClient;
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filtered, setFiltered] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortPaid, setSortPaid] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError(null);

      // Assuming 'id' is necessary for the Registration interface, even if not explicitly selected
     const { data, error } = await supabase
       .from('event_registrations')
      .select('id, form_data, is_paid, registration_date, status, check_in')
      .eq('event_id', eventId)   // Fetch only rows for the current event
      .order('registration_date', { ascending: false });


      if (error) {
        setError('Could not load registrations: ' + error.message);
        setRegistrations([]);
        setFiltered([]);
      } else {
        // Type assertion is safe here as data structure matches the select
        setRegistrations(data as Registration[]); 
        setFiltered(data as Registration[]);
      }
      setLoading(false);
    };

    if (eventId) fetchRegistrations();
  }, [eventId]);

  // Filtering Logic (Search + Paid/Unpaid Sort)
  useEffect(() => {
    let data = [...registrations];

    // Search filter
    if (searchQuery.trim() !== '') {
      data = data.filter((reg) =>
        Object.values(reg.form_data).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort filter (Paid / Unpaid)
    if (sortPaid !== 'all') {
      data = data.filter((reg) =>
        sortPaid === 'paid' ? reg.is_paid.toLowerCase() === 'paid' : reg.is_paid.toLowerCase() !== 'paid'
      );
    }

    setFiltered(data);
  }, [searchQuery, sortPaid, registrations]);

  const formHeaders = filtered.length > 0 ? Object.keys(filtered[0].form_data) : [];

  const StatusBadge = ({ status }: { status: Registration['status'] }) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 whitespace-nowrap";
    if (status === 'free') return <span className={`${base} bg-yellow-900 text-yellow-400`}><Clock className="w-3 h-3" /> Free</span>;
    return <span className={`${base} bg-green-900 text-green-400`}><CheckCircle2 className="w-3 h-3" /> Paid</span>;
    // Assuming any other case is an 'unpaid' status for payment_status check in table
    
  };
  
  // ✅ New Function for CSV Download
  const handleDownloadCSV = () => {
    if (filtered.length === 0) return;

    // Define all headers, including form data and fixed fields
    const allHeaders = [...formHeaders, 'status', 'is_paid', 'registration_date'];
    
    // CSV Header row
    const csvHeader = allHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(',');

    // CSV Data rows
    const csvRows = filtered.map(reg => {
      const rowData = allHeaders.map(header => {
        let value: any;
        
        if (header in reg.form_data) {
          value = reg.form_data[header];
        } else if (header === 'status') {
          value = reg.status;
        } else if (header === 'is_paid') {
          value = reg.is_paid;
        } else if (header === 'registration_date') {
          value = new Date(reg.registration_date).toLocaleDateString();
        } else {
          value = ''; // Should not happen if allHeaders is correctly defined
        }

        // Handle null/undefined and ensure proper CSV quoting
        const stringValue = String(value ?? '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',');
      
      return rowData;
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create a Blob and a link to download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `event_registrations_${eventId}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const RegistrationCard = ({ reg, formHeaders, idx }: { reg: Registration, formHeaders: string[], idx: number }) => (
    <div key={idx} className="bg-gray-700/70 p-4 rounded-lg shadow-md mb-3 border border-gray-600">
      <div className="flex justify-between items-start mb-2 border-b border-gray-600 pb-2">
        <span className="text-lg font-semibold text-green-400">Registration #{idx + 1}</span>
        <StatusBadge status={reg.status} />
      </div>
      <div className="space-y-2">
        {formHeaders.map((field) => (
          <div key={field} className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">{field.replace(/_/g, ' ')}:</span>
            <span className="text-white text-right">{reg.form_data[field] || 'N/A'}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 border-t border-gray-600 mt-2">
          <span className="text-gray-400 font-medium">Payment Status:</span>
          {reg.is_paid.toLowerCase() === 'paid' ? 
            <span className="flex items-center text-green-500"><CheckCircle2 className="w-4 h-4 mr-1" /> Paid</span> : 
            <span className="flex items-center text-red-500"><XCircle className="w-4 h-4 mr-1" /> Unpaid</span>}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-medium">Date:</span>
          <span className="text-gray-400">{new Date(reg.registration_date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/90 border border-gray-700 p-4 md:p-6 rounded-xl shadow-2xl min-h-[500px]">
      
      {/* ✅ Header & Count Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 border-b border-gray-700 pb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-2 sm:mb-0">
          📝 Event Registrations ({filtered.length}) ({eventId})
        </h2>
        <div className="flex gap-2">
            <Button 
                onClick={handleDownloadCSV} 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
                disabled={filtered.length === 0}
            >
                <Download className="w-4 h-4" /> <span>Download CSV</span>
            </Button>
            
        </div>
      </div>

      {/* ✅ Search + Filter Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search by Name, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 text-white pl-10 pr-3 py-2 rounded-md w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div className="flex flex-wrap gap-2">
            <Button
                variant="secondary"
                onClick={() => setSortPaid(sortPaid === 'paid' ? 'unpaid' : 'paid')}
                className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2"
            >
                <ArrowUpDown className="w-4 h-4" />
                {sortPaid === 'paid' ? 'Show Unpaid' : 'Show Paid'}
            </Button>

            <Button
                variant="secondary"
                onClick={() => setSortPaid('all')}
                className="bg-gray-600 hover:bg-gray-700 text-white"
            >
                Reset Filter
            </Button>
        </div>
      </div>

      {/* ✅ Table Rendering */}
      {loading ? (
        <div className="text-white flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Registrations...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 py-10 text-center">No matching results for this event.</p>
      ) : (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700 max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 sticky top-0 z-10">
                    <tr>
                        {formHeaders.map((header, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase whitespace-nowrap">
                            {header.replace(/_/g, ' ')}
                        </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Checked in</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase whitespace-nowrap">Reg. Date</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-800 text-white">
                    {filtered.map((reg, idx) => (
                        <tr key={reg.id || idx} className="hover:bg-gray-700/50">
                        {formHeaders.map((field, i) => (
                            <td key={i} className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">{reg.form_data[field] || 'N/A'}</td>
                        ))}
                        <td className="px-6 py-4 text-sm"><StatusBadge status={reg.status} /></td>
                        <td className="px-6 py-4 text-sm">
                          {reg.is_paid.toLowerCase() === 'paid'
                            // ⬇️ CHANGE: Use aria-label instead of title
                            ? <CheckCircle2 className="w-5 h-5 text-green-500" aria-label="Paid" /> 
                            // ⬇️ CHANGE: Use aria-label instead of title
                            : <XCircle className="w-5 h-5 text-red-500" aria-label="Unpaid" />} 
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{reg.check_in}</td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{new Date(reg.registration_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filtered.map((reg, idx) => (
                    <RegistrationCard key={reg.id || idx} reg={reg} formHeaders={formHeaders} idx={idx} />
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default EventRegistrationsView;