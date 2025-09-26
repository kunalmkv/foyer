'use client'
import {useState} from "react";
import {Filter, Ticket} from "lucide-react";

export const TicketFilters = ({ onFiltersChange }) => {
    const [ticketCount, setTicketCount] = useState(2);
    const [priceSort, setPriceSort] = useState('recommended');

    return (
        <div className="bg-[#F5EFE6] rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-600" />
                        <span className="font-medium text-gray-900">Filters</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-gray-600" />
                        <select
                            value={ticketCount}
                            className="bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none"
                            onChange={(e) => setTicketCount( e.target.value)}
                        >
                            <option value={1}>1 ticket</option>
                            <option value={2}>2 tickets</option>
                            <option value={3}>3 tickets</option>
                            <option value={4}>4+ tickets</option>
                        </select>
                    </div>

                    <select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none"
                    >
                        <option value="recommended">Sort by recommended</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="section">By Section</option>
                    </select>
                </div>

                <div className="text-sm text-gray-600">
                    <span className="font-medium">4 listings</span> • Showing 4 of 4
                </div>
            </div>
        </div>
    );
};
