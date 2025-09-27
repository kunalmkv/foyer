import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { offerabi } from '@/app/consts/abi';
import { OFFER_MANAGER_ADDRESS } from '@/app/consts';
import { Offer } from '@/app/types/Offers';
import { handleOfferAcceptanceWithChat } from '@/app/utils/offerChat';

interface UseOfferAcceptanceProps {
    offer: Offer;
    acceptingUserAddress: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function useOfferAcceptance({ 
    offer, 
    acceptingUserAddress, 
    onSuccess, 
    onError 
}: UseOfferAcceptanceProps) {
    const [isAccepting, setIsAccepting] = useState(false);

    const { writeContract, data: hash, isPending, error: contractError } = useWriteContract();
    
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const acceptOffer = async () => {
        if (!acceptingUserAddress) {
            throw new Error('User address is required');
        }

        if (acceptingUserAddress === offer.sellerAddress) {
            throw new Error('Cannot accept your own offer');
        }

        if (offer.status !== 'ACTIVE') {
            throw new Error('Offer is not active');
        }

        try {
            setIsAccepting(true);

            // Execute the blockchain transaction
            writeContract({
                address: OFFER_MANAGER_ADDRESS,
                abi: offerabi,
                functionName: 'acceptOffer',
                args: [BigInt(offer.id)],
            });

        } catch (error) {
            setIsAccepting(false);
            const errorMessage = error instanceof Error ? error.message : 'Failed to accept offer';
            onError?.(new Error(errorMessage));
            throw error;
        }
    };

    // Handle successful transaction
    useEffect(() => {
        if (isConfirmed && hash) {
            handleTransactionSuccess();
        }
    }, [isConfirmed, hash]);

    // Handle transaction errors
    useEffect(() => {
        if (contractError) {
            setIsAccepting(false);
            onError?.(contractError);
        }
    }, [contractError]);

    const handleTransactionSuccess = async () => {
        try {
            console.log('Offer acceptance transaction confirmed:', hash);

            // Initiate chat after successful transaction
            await handleOfferAcceptanceWithChat({
                offer,
                acceptingUserAddress
            });

            setIsAccepting(false);
            onSuccess?.();
            
        } catch (chatError) {
            console.error('Failed to initiate chat after offer acceptance:', chatError);
            // Don't fail the entire process if chat fails
            setIsAccepting(false);
            onSuccess?.();
        }
    };

    return {
        acceptOffer,
        isAccepting: isAccepting || isPending || isConfirming,
        isConfirming,
        isPending,
        isConfirmed,
        hash,
        error: contractError
    };
}