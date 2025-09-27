import { chatService } from '@/app/service/chat.service';
import { Offer } from '@/app/types/Offers';

interface OfferAcceptanceParams {
    offer: Offer;
    acceptingUserAddress: string;
}

export async function handleOfferAcceptanceWithChat(params: OfferAcceptanceParams): Promise<void> {
    const { offer, acceptingUserAddress } = params;
    
    try {
        // Determine buyer and seller based on offer type and who's accepting
        let buyerAddress: string;
        let sellerAddress: string;

        if (offer.type === 'OFFER_TO_SELL') {
            // Someone is buying from a seller
            buyerAddress = acceptingUserAddress;
            sellerAddress = offer.sellerAddress;
        } else {
            // Someone is selling to a buyer (accepting a buy request)
            buyerAddress = offer.sellerAddress; // In OFFER_TO_BUY, sellerAddress is actually the buyer
            sellerAddress = acceptingUserAddress;
        }

        console.log('Initiating chat for offer acceptance:', {
            offerId: offer.id,
            offerType: offer.type,
            buyerAddress,
            sellerAddress,
            acceptingUser: acceptingUserAddress
        });

        // Add a small delay to ensure the backend has processed the offer acceptance
        // This helps ensure the chat system is ready to receive the new chat
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Initiate the chat with template message
        await chatService.initiateOfferChat(
            buyerAddress,
            sellerAddress,
            offer.id,
            offer.type
        );

        console.log('Chat initiated successfully for offer:', offer.id);
    } catch (error) {
        console.error('Failed to initiate chat for offer acceptance:', error);
        // Don't throw here - we don't want to fail the entire transaction if chat fails
        // Just log the error and continue
    }
}

export function generateOfferAcceptanceMessage(offerId: number, offerType: 'OFFER_TO_BUY' | 'OFFER_TO_SELL'): string {
    const action = offerType === 'OFFER_TO_SELL' ? 'purchased' : 'accepted your buy request for';
    const nextSteps = offerType === 'OFFER_TO_SELL' 
        ? 'Please arrange for ticket delivery. Once you receive the tickets, please confirm in the system to complete the transaction.'
        : 'Please arrange for ticket delivery. Once the buyer receives the tickets, they will confirm to complete the transaction.';

    return `🎫 Great news! I've ${action} your tickets for Offer #${offerId}. 

${nextSteps}

Looking forward to a smooth transaction! 👍`;
}