import React from "react";
import { useProjects } from "../context/ProjectContext";

const SearchBar = () => {
    const { searchQuery, setSearchQuery, filters, setFilters } = useProjects();

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchQuery("");
        setFilters({ status: "", priority: "", dueDate: "" });
    };

    const hasActiveFilters = searchQuery || filters.status || filters.priority || filters.dueDate;

    return (
        <div className="mb-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filter Row - Responsive */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Status Filter */}
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="px-2 sm:px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Status</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                </select>

                {/* Priority Filter */}
                <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    className="px-2 sm:px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>

                {/* Due Date Filter */}
                <select
                    value={filters.dueDate}
                    onChange={(e) => handleFilterChange("dueDate", e.target.value)}
                    className="px-2 sm:px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Dates</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due Today</option>
                    <option value="week">This Week</option>
                    <option value="no-date">No Date</option>
                </select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-2 sm:px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
