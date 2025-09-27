'use client';

import { useState, useEffect } from 'react';
import { Offer } from '@/app/types/Offers';
import { OfferCard } from './OfferCard';
import { CheckCircle, Filter } from 'lucide-react';

interface MySalesProps {
    userAddress: string;
}

export const MySales = ({ userAddress }: MySalesProps) => {
    const [sales, setSales] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'SETTLED'>('ALL');

    useEffect(() => {
        loadSales();
    }, [userAddress]);

    const loadSales = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for testing - Sales (where user is seller and status is ACCEPTED or SETTLED)
            const mockSales: Offer[] = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    id: 1001,
                    type: 'OFFER_TO_SELL',
                    eventId: 123,
                    sellerAddress: userAddress,
                    collateral: 50,
                    ask: 150,
                    buyerAddress: '0x742d35Cc6560C4C3e2533a8b51C29E0b8a1234567',
                    quantity: 2,
                    seatNumbers: ['A12', 'A13'],
                    seatType: 'VIP',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmHash1',
                    status: 'SETTLED',
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-16T14:20:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439012',
                    id: 1002,
                    type: 'OFFER_TO_SELL',
                    eventId: 456,
                    sellerAddress: userAddress,
                    collateral: 25,
                    ask: 75,
                    buyerAddress: '0x8ba1f109551bD432803012645Hac136c22111111',
                    quantity: 1,
                    seatNumbers: ['B15'],
                    seatType: 'General',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmHash2',
                    status: 'ACCEPTED',
                    createdAt: '2024-01-20T09:15:00Z',
                    updatedAt: '2024-01-20T16:45:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439013',
                    id: 1003,
                    type: 'OFFER_TO_SELL',
                    eventId: 789,
                    sellerAddress: userAddress,
                    collateral: 100,
                    ask: 300,
                    buyerAddress: '0x9f2298715D4d2d35e36c999992828Ac12a44447',
                    quantity: 4,
                    seatNumbers: ['C1', 'C2', 'C3', 'C4'],
                    seatType: 'Premium',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmHash3',
                    status: 'SETTLED',
                    createdAt: '2024-01-10T14:00:00Z',
                    updatedAt: '2024-01-12T11:30:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439014',
                    id: 1004,
                    type: 'OFFER_TO_BUY',
                    eventId: 321,
                    sellerAddress: userAddress,
                    collateral: 30,
                    ask: 120,
                    buyerAddress: '0xdef456789abcdef123456789abcdef123456789',
                    quantity: 1,
                    seatType: 'Standard',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmHash4',
                    status: 'ACCEPTED',
                    createdAt: '2024-01-25T16:30:00Z',
                    updatedAt: '2024-01-25T18:15:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439015',
                    id: 1005,
                    type: 'OFFER_TO_SELL',
                    eventId: 654,
                    sellerAddress: userAddress,
                    collateral: 40,
                    ask: 180,
                    buyerAddress: '0x123456789abcdef123456789abcdef123456789',
                    quantity: 3,
                    seatNumbers: ['D10', 'D11', 'D12'],
                    seatType: 'VIP',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmHash5',
                    status: 'SETTLED',
                    createdAt: '2024-01-05T12:00:00Z',
                    updatedAt: '2024-01-07T10:45:00Z'
                }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSales(mockSales);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load sales');
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = filter === 'ALL'
        ? sales
        : sales.filter(sale => sale.status === filter);

    const totalEarnings = sales
        .filter(sale => sale.status === 'SETTLED')
        .reduce((sum, sale) => sum + sale.ask, 0);

    const pendingSales = sales.filter(sale => sale.status === 'ACCEPTED').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading your sales...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={loadSales}
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
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={24} />
                    My Sales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{sales.length}</div>
                        <div className="text-green-100">Total Sales</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">${totalEarnings}</div>
                        <div className="text-green-100">Total Earnings</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{pendingSales}</div>
                        <div className="text-green-100">Pending Settlement</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-300" />
                    <span className="text-sm text-gray-300">Filter by status:</span>
                </div>
                <div className="flex gap-2">
                    {[
                        { key: 'ALL', label: 'All Sales' },
                        { key: 'ACCEPTED', label: 'Accepted' },
                        { key: 'SETTLED', label: 'Settled' }
                    ].map(status => (
                        <button
                            key={status.key}
                            onClick={() => setFilter(status.key as 'ALL' | 'ACCEPTED' | 'SETTLED')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                                filter === status.key
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                            }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sales List */}
            {filteredSales.length === 0 ? (
                <div className="text-center py-12">
                    <CheckCircle size={48} className="text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Sales Found</h3>
                    <p className="text-gray-400">
                        {filter === 'ALL'
                            ? "You haven't completed any sales yet."
                            : `No sales with ${filter.toLowerCase()} status.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSales.map(sale => (
                        <OfferCard
                            key={sale._id}
                            offer={sale}
                            userAddress={userAddress}
                            type="sale"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};