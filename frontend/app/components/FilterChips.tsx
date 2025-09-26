'use client'
import {useState} from "react";
import {Calendar, MapPin} from "lucide-react";

export const FilterChips = () => {
    const [selectedFilters, setSelectedFilters] = useState(['All types']);

    const filters = ['All types', 'Sports', 'Concerts', 'Theater & Comedy'];

    const toggleFilter = (filter: string) => {
        if (filter === 'All types') {
            setSelectedFilters(['All types']);
        } else {
            setSelectedFilters(prev =>
                prev.includes(filter)
                    ? prev.filter(f => f !== filter)
                    : [...prev.filter(f => f !== 'All types'), filter]
            );
        }
    };

    return (
        <div className="flex items-center gap-4 mb-8 bg-[#F5EFE6]">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <MapPin size={16} />
                <span className="font-medium">New York</span>
            </div>

            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Calendar size={16} />
                <span className="font-medium">All dates</span>
            </div>

            <div className="flex gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => toggleFilter(filter)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                            selectedFilters.includes(filter)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};