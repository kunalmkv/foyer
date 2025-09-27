export interface Offer {
    _id: string;
    id: number;
    type: 'OFFER_TO_BUY' | 'OFFER_TO_SELL';
    eventId: number;
    sellerAddress: string;
    collateral: number;
    ask: number;
    buyerAddress?: string;
    quantity?: number;
    seatNumbers?: string[];
    seatType?: string;
    isPhysicalTicketNeededToAttend?: boolean;
    metadataUrl: string;
    status: 'ACTIVE' | 'SETTLED' | 'ACCEPTED' | 'DISPUTED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
}

export interface OfferMetadata {
    quantity: number;
    seatNumbers: string[];
    seatType: string;
    isPhysicalTicketNeededToAttend: boolean;
}

export interface GetEventOffersRequest {
    eventId: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
}

export interface GetEventOffersResponse {
    message: string;
    offers: Offer[];
}

export interface IOfferService {
    getEventOffers(params: GetEventOffersRequest): Promise<GetEventOffersResponse>;
    getOffer(offerId: number): Promise<{ message: string; offer: Offer }>;
    getUserOffers(userAddress: string, params?: { status?: string; type?: string; page?: number; limit?: number }): Promise<GetEventOffersResponse>;
}
