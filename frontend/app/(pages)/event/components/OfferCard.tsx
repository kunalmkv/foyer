import { Shield, Users, TrendingUp, TrendingDown, Clock, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { Offer } from "@/app/types/Offers";
import {ERC20_ABI, PYUSD_TOKEN_ADDRESS} from "@/app/(pages)/buy/page";
import {OFFER_MANAGER_ADDRESS} from "@/app/consts";
import {offerabi} from "@/app/consts/abi";

interface OfferCardProps {
    offer: Offer & { id: number | string }; // Ensure offer has an id field
}

export const OfferCard = ({ offer }: OfferCardProps) => {
    const [isAccepting, setIsAccepting] = useState(false);
    const [needsApproval, setNeedsApproval] = useState(false);
    const [step, setStep] = useState<'idle' | 'approving' | 'accepting' | 'completed'>('idle');

    const { address } = useAccount();

    // Get user's PYUSD balance
    const { data: pyusdBalance } = useBalance({
        address,
        token: PYUSD_TOKEN_ADDRESS,
    });

    // wagmi hooks for contract interaction
    const {
        writeContract,
        data: hash,
        isPending: isWritePending,
        error: writeError
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: waitError
    } = useWaitForTransactionReceipt({
        hash,
    });

    // Calculate required amount based on offer type
    const getRequiredAmount = () => {
        if (offer.type === 'OFFER_TO_SELL') {
            // For sell offers, buyer needs to pay the full amount (collateral * 2)
            // Convert from regular number to PYUSD wei (6 decimals)
            return (offer.collateral*2)
        } else {
            // For buy offers, seller needs to provide collateral
            // Convert from regular number to PYUSD wei (6 decimals)
            return (offer.collateral)
        }
    };

    // Check if user has sufficient balance
    const hasSufficientBalance = () => {
        if (!pyusdBalance) return false;
        const required = getRequiredAmount();
        return pyusdBalance.value >= required;
    };

    // Convert PYUSD wei to readable format (6 decimals) - FIXED
    const formatPrice = (priceInWei: number) => {
        if (!priceInWei || isNaN(priceInWei)) return '0.00';
        // If priceInWei is already a regular number (not in wei), just format it
        return priceInWei.toFixed(2);
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

    // Handle approval first, then accept offer
    const handleApproveAndAccept = async () => {
        if (!offer.id || !address) {
            console.error('Offer ID and wallet connection are required');
            return;
        }

        const requiredAmount = getRequiredAmount();

        try {
            setIsAccepting(true);
            setStep('approving');

            // First approve PYUSD spending
            await writeContract({
                address: PYUSD_TOKEN_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [OFFER_MANAGER_ADDRESS, requiredAmount],
            });

        } catch (error) {
            console.error('Error during approval:', error);
            setIsAccepting(false);
            setStep('idle');
        }
    };

    // Handle accept offer after approval
    const handleAcceptOffer = async () => {
        if (!offer.id) {
            console.error('Offer ID is required');
            return;
        }

        try {
            setStep('accepting');
            await writeContract({
                address: OFFER_MANAGER_ADDRESS,
                abi: offerabi,
                functionName: "acceptOffer",
                args: [offer.id],
            });
        } catch (error) {
            console.error('Error accepting offer:', error);
            setIsAccepting(false);
            setStep('idle');
        }
    };

    // Handle the transaction flow
    useEffect(() => {
        if (isConfirmed && step === 'approving') {
            // Approval confirmed, now accept the offer
            handleAcceptOffer();
        } else if (isConfirmed && step === 'accepting') {
            // Accept confirmed, transaction complete
            setStep('completed');
            setIsAccepting(false);
        } else if (writeError || waitError) {
            // Reset on error
            setIsAccepting(false);
            setStep('idle');
        }
    }, [isConfirmed, step, writeError, waitError]);

    // Determine button state and text
    const getButtonState = () => {
        if (!address) {
            return {
                disabled: true,
                text: 'Connect Wallet',
                className: 'bg-gray-600 cursor-not-allowed'
            };
        }

        if (!hasSufficientBalance()) {
            return {
                disabled: true,
                text: 'Insufficient PYUSD',
                className: 'bg-red-600 cursor-not-allowed'
            };
        }

        if (step === 'approving' || (isWritePending && step === 'approving')) {
            return {
                disabled: true,
                text: 'Approving PYUSD...',
                className: 'bg-blue-600 cursor-not-allowed'
            };
        }

        if (step === 'accepting' || (isWritePending && step === 'accepting')) {
            return {
                disabled: true,
                text: 'Accepting Offer...',
                className: 'bg-blue-600 cursor-not-allowed'
            };
        }

        if (isConfirming) {
            return {
                disabled: true,
                text: 'Processing...',
                className: 'bg-blue-600 cursor-not-allowed'
            };
        }

        if (step === 'completed') {
            return {
                disabled: true,
                text: 'Accepted!',
                className: 'bg-green-600 cursor-not-allowed'
            };
        }

        if (offer.status !== 'ACTIVE') {
            return {
                disabled: true,
                text: 'Not Available',
                className: 'bg-gray-600 cursor-not-allowed'
            };
        }

        // Check if user is trying to accept their own offer
        const isOwnOffer = (offer.type === 'OFFER_TO_SELL' && offer.sellerAddress === address) ||
            (offer.type === 'OFFER_TO_BUY' && offer.sellerAddress === address);

        if (isOwnOffer) {
            return {
                disabled: true,
                text: 'Your Offer',
                className: 'bg-gray-600 cursor-not-allowed'
            };
        }

        return {
            disabled: false,
            text: offer.type === 'OFFER_TO_SELL' ? 'Buy Now' : 'Sell Now',
            className: 'bg-blue-600 hover:bg-blue-700'
        };
    };

    const typeInfo = getTypeInfo(offer.type);
    const TypeIcon = typeInfo.icon;
    const buttonState = getButtonState();
   const requiredAmount = getRequiredAmount();
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
                        {(offer.collateral/10**6 * 2)} PYUSD
                    </div>
                    <div className="text-sm text-gray-300 mb-3">per ticket</div>

                    <button
                        onClick={handleApproveAndAccept}
                        disabled={buttonState.disabled}
                        className={`w-full ${buttonState.className} text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2`}
                    >
                        {(isWritePending || isConfirming) && (
                            <Loader2 size={16} className="animate-spin" />
                        )}
                        {buttonState.text}
                    </button>

                    {/* Balance Info */}
                    {address && pyusdBalance && (
                        <div className="text-gray-400 text-xs mt-2">
                            Balance: {formatUnits(pyusdBalance.value, 6)} PYUSD
                        </div>
                    )}

                    {/* Required Amount Info */}
                    {address && (
                        <div className="text-gray-400 text-xs">
                            Required: {requiredAmount/10**6} PYUSD
                        </div>
                    )}

                    {/* Insufficient Balance Warning */}
                    {address && !hasSufficientBalance() && (
                        <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
                            <AlertTriangle size={12} />
                            <span>Insufficient balance</span>
                        </div>
                    )}

                    {/* Error Messages */}
                    {writeError && (
                        <div className="text-red-400 text-xs mt-2">
                            Error: {writeError.message}
                        </div>
                    )}
                    {waitError && (
                        <div className="text-red-400 text-xs mt-2">
                            Transaction failed
                        </div>
                    )}

                    {/* Transaction Hash */}
                    {hash && (
                        <div className="text-gray-400 text-xs mt-2">
                            Tx: {formatAddress(hash)}
                        </div>
                    )}
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
