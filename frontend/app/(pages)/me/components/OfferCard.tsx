'use client';

import { Offer } from '@/app/types/Offers';
import { Calendar, MapPin, User, Hash, Ticket, DollarSign } from 'lucide-react';

interface OfferCardProps {
    offer: Offer;
    userAddress: string;
    type: 'sale' | 'listing' | 'order';
}

export const OfferCard = ({ offer, userAddress, type }: OfferCardProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-600 text-white';
            case 'ACCEPTED': return 'bg-green-600 text-white';
            case 'SETTLED': return 'bg-green-500 text-white';
            case 'DISPUTED': return 'bg-red-600 text-white';
            case 'CANCELLED': return 'bg-gray-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getTypeColor = (offerType: string) => {
        switch (offerType) {
            case 'OFFER_TO_BUY': return 'bg-purple-600 text-white';
            case 'OFFER_TO_SELL': return 'bg-orange-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getCardTitle = () => {
        switch (type) {
            case 'sale':
                return 'Completed Sale';
            case 'listing':
                return offer.type === 'OFFER_TO_SELL' ? 'Your Listing' : 'Buy Request';
            case 'order':
                return 'Your Purchase';
            default:
                return 'Offer';
        }
    };

    const getPriceLabel = () => {
        if (type === 'sale') {
            return 'Sold for';
        } else if (type === 'order') {
            return 'Purchased for';
        } else {
            return offer.type === 'OFFER_TO_SELL' ? 'Asking price' : 'Offer price';
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-slate-800 border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{getCardTitle()}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(offer.status)}`}>
                            {offer.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(offer.type)}`}>
                            {offer.type === 'OFFER_TO_SELL' ? 'SELL' : 'BUY'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400">{getPriceLabel()}</div>
                    <div className="text-xl font-bold text-green-400 flex items-center gap-1">
                        <DollarSign size={16} />
                        {offer.ask}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
                {/* Event ID */}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Hash size={14} />
                    <span>Event ID: {offer.eventId}</span>
                </div>

                {/* Quantity */}
                {offer.quantity && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Ticket size={14} />
                        <span>Quantity: {offer.quantity} tickets</span>
                    </div>
                )}

                {/* Seat Info */}
                {offer.seatType && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin size={14} />
                        <span>Seat Type: {offer.seatType}</span>
                    </div>
                )}

                {offer.seatNumbers && offer.seatNumbers.length > 0 && (
                    <div className="text-sm text-gray-300">
                        <span className="font-medium">Seats:</span> {offer.seatNumbers.join(', ')}
                    </div>
                )}

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                    <div>
                        <div className="font-medium text-gray-300">Seller</div>
                        <div className="flex items-center gap-1">
                            <User size={12} />
                            {offer.sellerAddress.slice(0, 6)}...{offer.sellerAddress.slice(-4)}
                            {offer.sellerAddress === userAddress && (
                                <span className="text-blue-400 text-xs">(You)</span>
                            )}
                        </div>
                    </div>
                    {offer.buyerAddress && (
                        <div>
                            <div className="font-medium text-gray-300">Buyer</div>
                            <div className="flex items-center gap-1">
                                <User size={12} />
                                {offer.buyerAddress.slice(0, 6)}...{offer.buyerAddress.slice(-4)}
                                {offer.buyerAddress === userAddress && (
                                    <span className="text-blue-400 text-xs">(You)</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Collateral */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Collateral:</span>
                    <span className="text-gray-300 font-medium">${offer.collateral}</span>
                </div>

                {/* Physical Ticket */}
                {offer.isPhysicalTicketNeededToAttend !== undefined && (
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Physical Ticket Required:</span>
                        <span className={`font-medium ${offer.isPhysicalTicketNeededToAttend ? 'text-yellow-400' : 'text-green-400'}`}>
                            {offer.isPhysicalTicketNeededToAttend ? 'Yes' : 'No'}
                        </span>
                    </div>
                )}

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created: {formatDate(offer.createdAt)}
                    </div>
                    {offer.updatedAt !== offer.createdAt && (
                        <div>
                            Updated: {formatDate(offer.updatedAt)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};