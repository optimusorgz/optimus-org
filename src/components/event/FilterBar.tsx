// src/components/event/FilterBar.tsx
"use client";

import React, { useState } from "react";
import { Search as SearchIcon, ChevronDown as ChevronDownIcon } from "lucide-react";
import type { Filters } from "@/app/event-page/page";

type PriceFilter = "Upcoming Events" | "Free" | "Paid";
type SortOption = "Event Date" | "Recently Added" | "Title (A-Z)";

interface FilterBarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

const PRICE_OPTIONS: PriceFilter[] = ["Upcoming Events", "Free", "Paid"];
const SORT_OPTIONS: SortOption[] = ["Event Date", "Recently Added", "Title (A-Z)"];

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFilterChange(key, value);
  };

  return (
<div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-800 rounded-xl border border-gray-700 mt-6 sm:mt-8 md:mt-0 w-full max-w-full md:w-auto"> 
      
      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full flex-wrap md:flex-row">
        
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full md:min-w-[200px]">
          <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, locations, organizers..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm sm:text-base"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center justify-between w-full md:w-auto px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 text-xs sm:text-sm"
          >
            <span className="truncate">{filters.sortOption}</span>
            <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
          </button>

          {isSortDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-44 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 max-w-full">
              {SORT_OPTIONS.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    handleFilterChange("sortOption", option);
                    setIsSortDropdownOpen(false);
                  }}
                  className={`px-3 sm:px-4 py-2 cursor-pointer text-xs sm:text-sm transition-colors duration-200 hover:bg-cyan-500 hover:text-white ${
                    filters.sortOption === option ? "bg-cyan-500 text-white" : ""
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Category / Price Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRICE_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => handleFilterChange("priceFilter", option)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              filters.priceFilter === option
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
