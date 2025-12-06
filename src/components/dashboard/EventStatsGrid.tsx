// components/Dashboard/EventStatsGrid.tsx
import React from 'react';

interface EventStatsGridProps {
    participated: number;
    hosted: number;

}

const StatCard: React.FC<{ title: string; value: number; color: string; index?: number }> = ({ title, value, color, index = 0 }) => (
    <div className="rounded-xl shadow-lg p-4 sm:p-5 md:p-6 flex flex-col justify-center items-center bg-gray-800/90 border border-gray-700 w-full max-w-full opacity-0" data-animate-on-visible="pop-in" style={{ animationDelay: `${index * 0.15}s` }}>
        <h3 className="text-sm sm:text-base md:text-lg text-gray-300 font-medium text-center">{title}</h3>
        <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
);

const EventStatsGrid: React.FC<EventStatsGridProps> = ({ participated, hosted }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <StatCard
                title="Events Participated"
                value={participated}
                color="text-green-400"
                index={0}
            />
            <StatCard
                title="Events Hosted"
                value={hosted}
                color="text-green-400"
                index={1}
            />
        </div>
    );
};

export default EventStatsGrid;