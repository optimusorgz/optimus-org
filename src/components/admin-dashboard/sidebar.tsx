// /src/components/dashboard/Sidebar.tsx
import Link from 'next/link';
import { X, Calendar, Users, Briefcase, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  userId: string; // receive userId as prop
}

export default function Sidebar({ isOpen, toggleSidebar, userId }: SidebarProps) {
  // Define your table links using template literals
  const tables = [
    { name: 'Events', href: `/admin-dashboard/${userId}/events`, icon: Calendar },
    { name: 'Organizations', href: `/admin-dashboard/${userId}/organisation`, icon: Briefcase },
    { name: 'Profiles', href: `/admin-dashboard/${userId}/profiles`, icon: Users },
    { name: 'Recruitment', href: `/admin-dashboard/${userId}/recruitment`, icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar} />}
      
      {/* Sidebar Content */}
      <nav className={`fixed h-full w-56 sm:w-64 bg-gray-800/90 border-r border-gray-700 text-white p-3 sm:p-4 transition-transform z-50 
                      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:shadow-xl overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-green-400 truncate">OPTIMUS Admin</h2>
          <button onClick={toggleSidebar} className="md:hidden p-1 rounded hover:bg-gray-700 flex-shrink-0">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <ul className="space-y-1 sm:space-y-2">
          {tables.map((table) => {
            const Icon = table.icon;
            return (
              <li key={table.name}>
                <Link
                  href={table.href}
                  onClick={toggleSidebar}
                  className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-green-600 transition-colors text-gray-300 hover:text-white text-sm sm:text-base"
                >
                  <Icon size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">{table.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <button className="flex items-center w-full p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <Settings size={20} className="mr-3" />
            Settings
          </button>
        </div>
      </nav>
    </>
  );
}
