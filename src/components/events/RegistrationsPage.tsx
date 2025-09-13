import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  Users, 
  CheckCircle2, 
  Clock,
  Filter,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface RegistrationsPageProps {
  eventId: string;
  eventTitle: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  ticket_code: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

const RegistrationsPage: React.FC<RegistrationsPageProps> = ({
  eventId,
  eventTitle
}) => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'pending'>('all');

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchQuery, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load registrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.phone?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter === 'checked-in') {
      filtered = filtered.filter(reg => reg.checked_in);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(reg => !reg.checked_in);
    }

    setFilteredRegistrations(filtered);
  };

  const downloadExcel = () => {
    try {
      const exportData = filteredRegistrations.map(reg => ({
        Name: reg.name,
        Email: reg.email,
        Phone: reg.phone || 'N/A',
        'Registration Date': new Date(reg.created_at).toLocaleDateString(),
        'Check-in Status': reg.checked_in ? 'Checked In' : 'Pending',
        'Check-in Time': reg.checked_in_at 
          ? new Date(reg.checked_in_at).toLocaleString()
          : 'N/A',
        'Ticket Code': reg.ticket_code
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      XLSX.writeFile(workbook, `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.xlsx`);

      toast({
        title: "Download complete",
        description: "Registrations exported successfully.",
      });
    } catch (error) {
      console.error('Error downloading registrations:', error);
      toast({
        title: "Download failed",
        description: "Failed to export registrations.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (registration: Registration) => {
    if (registration.checked_in) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Checked In
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold text-green-600">
                  {registrations.filter(r => r.checked_in).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {registrations.length > 0 
                    ? Math.round((registrations.filter(r => r.checked_in).length / registrations.length) * 100)
                    : 0}%
                </p>
              </div>
              <Filter className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Event Registrations</CardTitle>
            <Button onClick={downloadExcel}>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({registrations.length})
              </Button>
              <Button
                variant={statusFilter === 'checked-in' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('checked-in')}
              >
                Checked In ({registrations.filter(r => r.checked_in).length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({registrations.filter(r => !r.checked_in).length})
              </Button>
            </div>
          </div>

          {/* Registrations List */}
          <div className="space-y-3">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No registrations match your filters.' 
                    : 'No registrations found for this event.'}
                </p>
              </div>
            ) : (
              filteredRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{registration.name}</h4>
                      {getStatusBadge(registration)}
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {registration.email}
                      </div>
                      {registration.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {registration.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Registered: {new Date(registration.created_at).toLocaleDateString()}</p>
                    {registration.checked_in_at && (
                      <p>Checked in: {new Date(registration.checked_in_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationsPage;