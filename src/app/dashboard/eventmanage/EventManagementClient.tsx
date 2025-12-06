"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/ui/Loader"; // import your loader

// Components
import EventEditForm from "@/components/dashboard/hostevent/EventEditForm";
import EventRegistrationsView from "@/components/dashboard/hostevent/EventRegistrationsView";
import EventFormEditor from "@/components/dashboard/hostevent/EventFormBuilder";

// ---------------- ICONS ----------------
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const FormIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="8" y1="9" x2="12" y2="9" />
  </svg>
);

const ViewIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ---------------- TABS ----------------
type TabKey = "edit" | "form" | "registrations";

const tabs = [
  { key: "registrations", title: "View Registrations", icon: ViewIcon, color: "cyan" },
  { key: "edit", title: "Edit Event Details", icon: EditIcon, color: "cyan" },
  { key: "form", title: "Customize Registration Form", icon: FormIcon, color: "cyan" },
] as const;

// ---------------- MOCK EVENTS ----------------
interface HostedEvent {
  id: string;
  title: string;
}

const hostedEventsMock: HostedEvent[] = [
  { id: "event1", title: "Event One" },
  { id: "event2", title: "Event Two" },
  { id: "event3", title: "Event Three" },
];

// ---------------- MAIN COMPONENT ----------------
const EventManagementPage: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("registrations");
  const [loading, setLoading] = useState<boolean>(false); // added loading state

  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("id");

  useEffect(() => {
    if (eventIdFromUrl) {
      setLoading(true); // start loading
      setSelectedEventId(eventIdFromUrl);
      setActiveTab("registrations");
      setTimeout(() => setLoading(false), 500); // simulate loading
    }
  }, [eventIdFromUrl]);

  // ---------------- HANDLERS ----------------
  const handleCloseModal = () => {
    setActiveTab("registrations");
  };

  const handleEventUpdated = () => {
    console.log("Event updated successfully");
  };

  // Accent Colors
  const getAccentColorClass = (color: string) => {
    switch (color) {
      case "cyan": return "hover:bg-cyan-400/10 border-cyan-700";
      default: return "text-gray-300 border-gray-700";
    }
  };

  const getActiveTabClass = (key: TabKey, color: string) =>
    key === activeTab
      ? "bg-cyan-400/20 border-cyan-400 ring-2 ring-cyan-400/50"
      : "";

  // Tab Button Component
  const TabButton: React.FC<{ tab: typeof tabs[number] }> = ({ tab }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => setActiveTab(tab.key)}
        className={`
          flex items-center p-3 rounded-xl border-2 w-full transition
          ${getAccentColorClass(tab.color)}
          ${getActiveTabClass(tab.key, tab.color)}
        `}
      >
        <Icon className="mr-3" />
        <span className="font-semibold hidden lg:block">{tab.title}</span>
      </button>
    );
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  // ---------------- If event not selected ----------------
  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-8">Hosted Events</h1>
        <div className="space-y-4">
          {hostedEventsMock.map((e) => (
            <div
              key={e.id}
              onClick={() => { setLoading(true); setSelectedEventId(e.id); setTimeout(() => setLoading(false), 500); }}
              className="cursor-pointer p-5 rounded-lg bg-[#15181d] border border-gray-800 hover:border-gray-600 hover:bg-[#1b1f24] transition"
            >
              <h2 className="text-lg font-semibold">{e.title}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- RENDER UI ----------------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 mt-10">Manage Event</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <nav className="hidden lg:block">
            <div className="p-4 bg-gray-800 rounded-xl border border-gray-800 shadow-xl space-y-3">
              {tabs.map((tab) => (
                <TabButton key={tab.key} tab={tab} />
              ))}
            </div>
          </nav>

          {/* MOBILE TABS */}
          <div className="lg:hidden flex space-x-3 overflow-x-auto pb-3 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center px-4 py-2 rounded-xl whitespace-nowrap border-2
                    ${getAccentColorClass(tab.color)}
                    ${getActiveTabClass(tab.key, tab.color)}
                  `}
                >
                  <Icon className="mr-2" />
                  <span className="font-semibold">{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <section className="lg:col-span-3 bg-gray-800 rounded-xl border border-gray-700 min-h-[500px]">
            {activeTab === "edit" && (
              <EventEditForm
                eventId={selectedEventId}
                onCancel={handleCloseModal}
                onEventUpdated={handleEventUpdated}
              />
            )}

            {activeTab === "form" && <EventFormEditor eventId={selectedEventId} />}

            {activeTab === "registrations" && (
              <EventRegistrationsView eventId={selectedEventId} onBack={handleCloseModal} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default EventManagementPage;
