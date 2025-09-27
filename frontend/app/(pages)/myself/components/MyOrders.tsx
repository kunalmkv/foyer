'use client';

import { useState, useEffect } from 'react';
import { Offer } from '@/app/types/Offers';
import { OfferCard } from './OfferCard';
import { ShoppingCart, Filter } from 'lucide-react';

interface MyOrdersProps {
    userAddress: string;
}

export const MyOrders = ({ userAddress }: MyOrdersProps) => {
    const [orders, setOrders] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACCEPTED' | 'SETTLED' | 'DISPUTED' | 'CANCELLED'>('ALL');

    useEffect(() => {
        loadOrders();
    }, [userAddress]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for testing - Orders (where user is the buyer)
            const mockOrders: Offer[] = [
                {
                    _id: '507f1f77bcf86cd799439031',
                    id: 3001,
                    type: 'OFFER_TO_SELL',
                    eventId: 777,
                    sellerAddress: '0xabc123def456789abc123def456789abc123def',
                    collateral: 80,
                    ask: 250,
                    buyerAddress: userAddress,
                    quantity: 2,
                    seatNumbers: ['H1', 'H2'],
                    seatType: 'VIP',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmOrderHash1',
                    status: 'SETTLED',
                    createdAt: '2024-01-20T15:30:00Z',
                    updatedAt: '2024-01-22T10:45:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439032',
                    id: 3002,
                    type: 'OFFER_TO_SELL',
                    eventId: 888,
                    sellerAddress: '0xdef456ghi789jkl012mno345pqr678stu901vwx',
                    collateral: 45,
                    ask: 130,
                    buyerAddress: userAddress,
                    quantity: 1,
                    seatNumbers: ['I15'],
                    seatType: 'Premium',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmOrderHash2',
                    status: 'ACCEPTED',
                    createdAt: '2024-01-25T09:20:00Z',
                    updatedAt: '2024-01-26T14:15:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439033',
                    id: 3003,
                    type: 'OFFER_TO_BUY',
                    eventId: 999,
                    sellerAddress: '0x123456789abcdef123456789abcdef123456789',
                    collateral: 35,
                    ask: 100,
                    buyerAddress: userAddress,
                    quantity: 3,
                    seatType: 'General',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmOrderHash3',
                    status: 'ACTIVE',
                    createdAt: '2024-01-28T12:00:00Z',
                    updatedAt: '2024-01-28T12:00:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439034',
                    id: 3004,
                    type: 'OFFER_TO_SELL',
                    eventId: 1010,
                    sellerAddress: '0x987654321fedcba987654321fedcba987654321',
                    collateral: 60,
                    ask: 180,
                    buyerAddress: userAddress,
                    quantity: 1,
                    seatNumbers: ['J8'],
                    seatType: 'Standard',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmOrderHash4',
                    status: 'DISPUTED',
                    createdAt: '2024-01-15T16:45:00Z',
                    updatedAt: '2024-01-18T11:30:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439035',
                    id: 3005,
                    type: 'OFFER_TO_SELL',
                    eventId: 1111,
                    sellerAddress: '0xfedcba987654321fedcba987654321fedcba987',
                    collateral: 90,
                    ask: 300,
                    buyerAddress: userAddress,
                    quantity: 4,
                    seatNumbers: ['K1', 'K2', 'K3', 'K4'],
                    seatType: 'VIP',
                    isPhysicalTicketNeededToAttend: true,
                    metadataUrl: 'https://ipfs.io/ipfs/QmOrderHash5',
                    status: 'CANCELLED',
                    createdAt: '2024-01-12T08:15:00Z',
                    updatedAt: '2024-01-14T13:20:00Z'
                },
                {
                    _id: '507f1f77bcf86cd799439036',
                    id: 3006,
                    type: 'OFFER_TO_BUY',
                    eventId: 1212,
                    sellerAddress: '0x456789abcdef012345678900abcdef123456789',
                    collateral: 55,
                    ask: 165,
                    buyerAddress: userAddress,
                    quantity: 2,
                    seatType: 'Premium',
                    isPhysicalTicketNeededToAttend: false,
                    metadataUrl: 'https://ipfs.io/ipfs/QmOrderHash6',
                    status: 'SETTLED',
                    createdAt: '2024-01-08T11:30:00Z',
                    updatedAt: '2024-01-10T17:45:00Z'
                }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1200));

            setOrders(mockOrders);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(order => order.status === filter);

    const totalSpent = orders
        .filter(order => order.status === 'SETTLED')
        .reduce((sum, order) => sum + order.ask, 0);

    const activeOrders = orders.filter(order => order.status === 'ACTIVE').length;
    const acceptedOrders = orders.filter(order => order.status === 'ACCEPTED').length;
    const settledOrders = orders.filter(order => order.status === 'SETTLED').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={loadOrders}
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
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <ShoppingCart size={24} />
                    My Orders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{orders.length}</div>
                        <div className="text-purple-100">Total Orders</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{activeOrders}</div>
                        <div className="text-purple-100">Active Bids</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{acceptedOrders}</div>
                        <div className="text-purple-100">Pending</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">${totalSpent}</div>
                        <div className="text-purple-100">Total Spent</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-300" />
                    <span className="text-sm text-gray-300">Filter by status:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'ALL', label: 'All Orders' },
                        { key: 'ACTIVE', label: 'Active' },
                        { key: 'ACCEPTED', label: 'Accepted' },
                        { key: 'SETTLED', label: 'Settled' },
                        { key: 'DISPUTED', label: 'Disputed' },
                        { key: 'CANCELLED', label: 'Cancelled' }
                    ].map(status => (
                        <button
                            key={status.key}
                            onClick={() => setFilter(status.key as 'ALL' | 'ACTIVE' | 'ACCEPTED' | 'SETTLED' | 'DISPUTED' | 'CANCELLED')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                                filter === status.key
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                            }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart size={48} className="text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Orders Found</h3>
                    <p className="text-gray-400">
                        {orders.length === 0
                            ? "You haven't placed any orders yet."
                            : `No orders with ${filter.toLowerCase()} status.`
                        }
                    </p>
                    {orders.length === 0 && (
                        <p className="text-gray-500 mt-2">
                            Browse events and make an offer to get started!
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <OfferCard
                            key={order._id}
                            offer={order}
                            userAddress={userAddress}
                            type="order"
                        />
                    ))}
                </div>
            )}

            {/* Order Status Legend */}
            {orders.length > 0 && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Order Status Guide</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                            <span className="text-gray-300"><strong>Active:</strong> Your bid is live</span>
                        </div>
                        <div>
                            <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                            <span className="text-gray-300"><strong>Accepted:</strong> Seller accepted, awaiting settlement</span>
                        </div>
                        <div>
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-gray-300"><strong>Settled:</strong> Transaction completed</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};