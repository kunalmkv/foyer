'use client';

import { useState, useEffect } from 'react';
import { Offer } from '@/app/types/Offers';
import { OfferCard } from './OfferCard';
import { Package, Filter, Plus } from 'lucide-react';

interface MyListingsProps {
    userAddress: string;
}

export const MyListings = ({ userAddress }: MyListingsProps) => {
    const [listings, setListings] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DISPUTED' | 'CANCELLED'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'OFFER_TO_SELL' | 'OFFER_TO_BUY'>('ALL');

    useEffect(() => {
        loadListings();
    }, [userAddress]);

    const loadListings = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for testing - Listings (where user is seller and status is NOT ACCEPTED or SETTLED)
            const mockListings = [
                {
                    _id: '507f1f77bcf86cd799439021',
                    id: 2001,
                    type: 'OFFER_TO_SELL',
                    eventId: 111,
                    sellerAddress: userAddress,
                    collateral: 75,
                    ask: 200,
                    quantity: 2,
                    seatNumbers: ['E1', 'E2'],
                    seatType: 'Premium',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmListingHash1',
                    status: 'ACTIVE',
                    createdAt: '2024-01-28T10:00:00Z',
                    updatedAt: '2024-01-28T10:00:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439022',
                    id: 2002,
                    type: 'OFFER_TO_BUY',
                    eventId: 222,
                    sellerAddress: userAddress,
                    collateral: 40,
                    ask: 120,
                    quantity: 1,
                    seatType: 'General',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmListingHash2',
                    status: 'ACTIVE',
                    createdAt: '2024-01-26T14:30:00Z',
                    updatedAt: '2024-01-26T14:30:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439023',
                    id: 2003,
                    type: 'OFFER_TO_SELL',
                    eventId: 333,
                    sellerAddress: userAddress,
                    collateral: 60,
                    ask: 180,
                    quantity: 3,
                    seatNumbers: ['F10', 'F11', 'F12'],
                    seatType: 'VIP',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmListingHash3',
                    status: 'DISPUTED',
                    createdAt: '2024-01-22T09:15:00Z',
                    updatedAt: '2024-01-24T16:20:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439024',
                    id: 2004,
                    type: 'OFFER_TO_SELL',
                    eventId: 444,
                    sellerAddress: userAddress,
                    collateral: 30,
                    ask: 90,
                    quantity: 1,
                    seatNumbers: ['G5'],
                    seatType: 'Standard',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmListingHash4',
                    status: 'CANCELLED',
                    createdAt: '2024-01-18T11:45:00Z',
                    updatedAt: '2024-01-19T08:30:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439025',
                    id: 2005,
                    type: 'OFFER_TO_BUY',
                    eventId: 555,
                    sellerAddress: userAddress,
                    collateral: 50,
                    ask: 150,
                    quantity: 2,
                    seatType: 'Premium',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmListingHash5',
                    status: 'ACTIVE',
                    createdAt: '2024-01-30T13:20:00Z',
                    updatedAt: '2024-01-30T13:20:00Z'
                }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            setListings(mockListings);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const filteredListings = listings.filter(listing => {
        const statusMatch = filter === 'ALL' || listing.status === filter;
        const typeMatch = typeFilter === 'ALL' || listing.type === typeFilter;
        return statusMatch && typeMatch;
    });

    const activeListings = listings.filter(listing => listing.status === 'ACTIVE').length;
    const sellOffers = listings.filter(listing => listing.type === 'OFFER_TO_SELL').length;
    const buyOffers = listings.filter(listing => listing.type === 'OFFER_TO_BUY').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading your listings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={loadListings}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package size={24} />
                    My Listings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{listings.length}</div>
                        <div className="text-blue-100">Total Listings</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{activeListings}</div>
                        <div className="text-blue-100">Active</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{sellOffers}</div>
                        <div className="text-blue-100">Sell Offers</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{buyOffers}</div>
                        <div className="text-blue-100">Buy Requests</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-300" />
                    <span className="text-sm text-gray-300">Filters:</span>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Status:</span>
                    <div className="flex gap-2">
                        {[
                            { key: 'ALL', label: 'All' },
                            { key: 'ACTIVE', label: 'Active' },
                            { key: 'DISPUTED', label: 'Disputed' },
                            { key: 'CANCELLED', label: 'Cancelled' }
                        ].map(status => (
                            <button
                                key={status.key}
                                onClick={() => setFilter(status.key as 'ALL' | 'ACTIVE' | 'DISPUTED' | 'CANCELLED')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                                    filter === status.key
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Type:</span>
                    <div className="flex gap-2">
                        {[
                            { key: 'ALL', label: 'All' },
                            { key: 'OFFER_TO_SELL', label: 'Sell' },
                            { key: 'OFFER_TO_BUY', label: 'Buy' }
                        ].map(type => (
                            <button
                                key={type.key}
                                onClick={() => setTypeFilter(type.key as 'ALL' | 'OFFER_TO_SELL' | 'OFFER_TO_BUY')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                                    typeFilter === type.key
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Listings List */}
            {filteredListings.length === 0 ? (
                <div className="text-center py-12">
                    <Package size={48} className="text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Listings Found</h3>
                    <p className="text-gray-400 mb-4">
                        {listings.length === 0
                            ? "You don't have any active listings yet."
                            : "No listings match your current filters."
                        }
                    </p>
                    {listings.length === 0 && (
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                            <Plus size={20} />
                            Create New Listing
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredListings.map(listing => (
                        <OfferCard
                            key={listing._id}
                            offer={listing}
                            userAddress={userAddress}
                            type="listing"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};