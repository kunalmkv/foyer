import { Shield, Users, TrendingUp, TrendingDown, Clock, MapPin } from "lucide-react";
import { Offer } from "@/app/types/Offers";
import { useAccount } from 'wagmi';
import { handleOfferAcceptanceWithChat } from '@/app/utils/offerChat';

interface OfferCardProps {
    offer: Offer;
}

export const OfferCard = ({ offer }: OfferCardProps) => {
    const { address, isConnected } = useAccount();

    // Convert PYUSD wei to readable format (6 decimals)
    const formatPrice = (priceInWei: number) => {
        if (!priceInWei || isNaN(priceInWei)) return '0.00';
        return (priceInWei / Math.pow(10, 6)).toFixed(2);
    };

    // Format address for display
    const formatAddress = (address: string | undefined | null) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-900/50 text-green-300 border border-green-600/50';
            case 'SETTLED':
                return 'bg-blue-900/50 text-blue-300 border border-blue-600/50';
            case 'ACCEPTED':
                return 'bg-purple-900/50 text-purple-300 border border-purple-600/50';
            case 'DISPUTED':
                return 'bg-red-900/50 text-red-300 border border-red-600/50';
            case 'CANCELLED':
                return 'bg-gray-900/50 text-gray-300 border border-gray-600/50';
            default:
                return 'bg-gray-900/50 text-gray-300 border border-gray-600/50';
        }
    };

    // Get type icon and color
    const getTypeInfo = (type: string) => {
        if (type === 'OFFER_TO_SELL') {
            return {
                icon: TrendingDown,
                color: 'text-red-400',
                label: 'Selling',
                bgColor: 'bg-red-900/50 border border-red-600/50'
            };
        } else {
            return {
                icon: TrendingUp,
                color: 'text-green-400',
                label: 'Buying',
                bgColor: 'bg-green-900/50 border border-green-600/50'
            };
        }
    };

    const typeInfo = getTypeInfo(offer.type);
    const TypeIcon = typeInfo.icon;

    const handleAcceptOffer = async () => {
        if (!isConnected || !address) {
            alert('Please connect your wallet first');
            return;
        }

        if (address === offer.sellerAddress) {
            alert('You cannot accept your own offer');
            return;
        }

        try {
            // TODO: Add the actual blockchain transaction here using wagmi
            // For now, we'll simulate the acceptance and trigger the chat
            
            console.log('Accepting offer:', offer.id);
            
            // Simulate successful transaction - in real implementation, 
            // this would be called after the blockchain transaction is confirmed
            await handleOfferAcceptanceWithChat({
                offer,
                acceptingUserAddress: address
            });

            alert('Offer accepted! A chat has been started with the other party.');
        } catch (error) {
            console.error('Failed to accept offer:', error);
            alert('Failed to accept offer. Please try again.');
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700 hover:shadow-3xl transition-all duration-300 hover:border-blue-500/50">
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
                        <h3 className="text-xl font-bold text-white mb-2">{offer.seatType}</h3>
                    )}

                    {offer.seatNumbers && offer.seatNumbers.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-300 mb-2">
                            <MapPin size={14} />
                            <span>Seats: {offer.seatNumbers.join(', ')}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{offer.quantity || 1} ticket{offer.quantity !== 1 ? 's' : ''}</span>
                        </div>
                        {offer.isPhysicalTicketNeededToAttend && (
                            <div className="text-orange-400 font-medium">
                                Physical ticket required
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatPrice(offer.collateral * 2)} PYUSD
                    </div>
                    <div className="text-sm text-gray-300 mb-3">per ticket</div>

                    <button 
                        onClick={handleAcceptOffer}
                        disabled={!isConnected || address === offer.sellerAddress || offer.status !== 'ACTIVE'}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        {!isConnected ? 'Connect Wallet' : 
                         address === offer.sellerAddress ? 'Your Offer' :
                         offer.status !== 'ACTIVE' ? `${offer.status}` :
                         offer.type === 'OFFER_TO_SELL' ? 'Buy Now' : 'Sell Now'}
                    </button>
                </div>
            </div>

            {/* Seller/Buyer Info */}
            <div className="border-t border-gray-600 pt-4 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                {offer.type === 'OFFER_TO_SELL' ? 'S' : 'B'}
                            </span>
                        </div>
                        <div>
                            <div className="font-medium text-white">
                                {offer.type === 'OFFER_TO_SELL' ? 'Seller' : 'Buyer'}
                            </div>
                            <div className="text-sm text-gray-300">
                                {formatAddress(offer.sellerAddress)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-green-400">
                        <Shield size={16} />
                        <span className="text-sm font-medium">Secure</span>
                    </div>
                </div>
            </div>


            {/* Timestamp */}
            <div className="border-t border-gray-600 pt-3 mt-3">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};
