import { Shield, Users, TrendingUp, TrendingDown, Clock, MapPin } from "lucide-react";
import { Offer } from "@/app/types/Offers";

interface OfferCardProps {
    offer: Offer;
}

export const OfferCard = ({ offer }: OfferCardProps) => {
    // Convert PYUSD wei to readable format (6 decimals)
    const formatPrice = (priceInWei: number) => {
        if (!priceInWei || isNaN(priceInWei)) return '0.00';
        return (priceInWei / Math.pow(10, 6)).toFixed(2);
    };

    // Format address for display
    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700';
            case 'SETTLED':
                return 'bg-blue-100 text-blue-700';
            case 'ACCEPTED':
                return 'bg-purple-100 text-purple-700';
            case 'DISPUTED':
                return 'bg-red-100 text-red-700';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Get type icon and color
    const getTypeInfo = (type: string) => {
        if (type === 'OFFER_TO_SELL') {
            return {
                icon: TrendingDown,
                color: 'text-red-600',
                label: 'Selling',
                bgColor: 'bg-red-50'
            };
        } else {
            return {
                icon: TrendingUp,
                color: 'text-green-600',
                label: 'Buying',
                bgColor: 'bg-green-50'
            };
        }
    };

    const typeInfo = getTypeInfo(offer.type);
    const TypeIcon = typeInfo.icon;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${typeInfo.bgColor}`}>
                            <TypeIcon size={12} className={typeInfo.color} />
                            <span className={typeInfo.color}>{typeInfo.label}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(offer.status)}`}>
                            {offer.status}
                        </span>
                    </div>

                    {offer.seatType && (
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.seatType}</h3>
                    )}

                    {offer.seatNumbers && offer.seatNumbers.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin size={14} />
                            <span>Seats: {offer.seatNumbers.join(', ')}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{offer.quantity || 1} ticket{offer.quantity !== 1 ? 's' : ''}</span>
                        </div>
                        {offer.isPhysicalTicketNeededToAttend && (
                            <div className="text-orange-600 font-medium">
                                Physical ticket required
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatPrice(offer.collateral * 2)} PYUSD
                    </div>
                    <div className="text-sm text-gray-600 mb-3">per ticket</div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                        {offer.type === 'OFFER_TO_SELL' ? 'Buy Now' : 'Sell Now'}
                    </button>
                </div>
            </div>

            {/* Seller/Buyer Info */}
            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                {offer.type === 'OFFER_TO_SELL' ? 'S' : 'B'}
                            </span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">
                                {offer.type === 'OFFER_TO_SELL' ? 'Seller' : 'Buyer'}
                            </div>
                            <div className="text-sm text-gray-600">
                                {formatAddress(offer.sellerAddress)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-green-600">
                        <Shield size={16} />
                        <span className="text-sm font-medium">Secure</span>
                    </div>
                </div>
            </div>


            {/* Timestamp */}
            <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};
