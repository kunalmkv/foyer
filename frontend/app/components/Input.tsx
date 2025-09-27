'use client';

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Events } from "@/app/types/Events";

interface SearchBarProps {
    events?: Events[];
    onEventSelect?: (event: Events) => void;
    placeholder?: string;
}

export const SearchBar = ({
    events = [],
    onEventSelect,
    placeholder = "Search events, artists, teams, and more..."
}: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState<Events[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter events based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredEvents([]);
            setShowSuggestions(false);
        } else {
            const filtered = events.filter(event =>
                event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredEvents(filtered.slice(0, 8)); // Limit to 8 suggestions
            setShowSuggestions(filtered.length > 0);
        }
        setSelectedIndex(-1);
    }, [searchQuery, events]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || filteredEvents.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredEvents.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredEvents.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredEvents.length) {
                    handleEventSelect(filteredEvents[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle event selection
    const handleEventSelect = (event: Events) => {
        setSearchQuery(event.name);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        onEventSelect?.(event);
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'SPORTS':
                return 'bg-green-900/50 text-green-300 border-green-700';
            case 'MUSIC':
                return 'bg-purple-900/50 text-purple-300 border-purple-700';
            case 'COMEDY':
                return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
            case 'EDUCATION':
                return 'bg-blue-900/50 text-blue-300 border-blue-700';
            default:
                return 'bg-gray-900/50 text-gray-300 border-gray-700';
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return 'bg-blue-900/50 text-blue-300 border-blue-700';
            case 'ONGOING':
                return 'bg-green-900/50 text-green-300 border-green-700';
            case 'COMPLETED':
                return 'bg-gray-900/50 text-gray-500 border-gray-700';
            case 'CANCELLED':
                return 'bg-red-900/50 text-red-300 border-red-700';
            default:
                return 'bg-gray-900/50 text-gray-300 border-gray-700';
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto" ref={searchRef}>
            <div className="relative group">
                <div className="flex items-center border-2 border-gray-600/50 rounded-2xl p-6 shadow-2xl bg-gray-800/50 backdrop-blur-md hover:border-blue-500/50 transition-all duration-300 hover:shadow-blue-500/20">
                    <Search className="text-gray-400 mr-4 group-hover:text-blue-400 transition-colors duration-300" size={28} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (filteredEvents.length > 0) {
                                setShowSuggestions(true);
                            }
                        }}
                        placeholder={placeholder}
                        className="flex-1 text-lg text-white placeholder-gray-400 outline-none bg-transparent font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="text-gray-400 hover:text-white transition-colors duration-200 mr-4"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <div className="hidden md:flex items-center space-x-2 text-gray-500 text-sm">
                        <kbd className="px-2 py-1 bg-gray-700/50 rounded border border-gray-600 text-xs">⌘</kbd>
                        <kbd className="px-2 py-1 bg-gray-700/50 rounded border border-gray-600 text-xs">K</kbd>
                    </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredEvents.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-gray-600/50 rounded-2xl shadow-2xl overflow-hidden z-50">
                        <div className="p-2">
                            <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-700/50">
                                {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} found
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {filteredEvents.map((event, index) => (
                                    <div
                                        key={event._id}
                                        onClick={() => handleEventSelect(event)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 m-1 ${
                                            index === selectedIndex
                                                ? 'bg-blue-600/20 border border-blue-500/50'
                                                : 'hover:bg-gray-700/50 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white truncate mb-1">
                                                    {event.name}
                                                </h3>
                                                <p className="text-sm text-gray-300 truncate mb-2">
                                                    {event.venue}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(event.category)}`}>
                                                        {event.category}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(event.status)}`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 text-gray-400">
                                                <Search size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
            </div>
        </div>
    );
};
