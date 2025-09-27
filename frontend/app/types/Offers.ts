export enum OfferTypeEnum {
    OFFER_TO_BUY = 'OFFER_TO_BUY',
    OFFER_TO_SELL = 'OFFER_TO_SELL',
}

export enum OfferStatusEnum {
    ACTIVE = 'ACTIVE',
    SETTLED = 'SETTLED',
    ACCEPTED = 'ACCEPTED',
    DISPUTED = 'DISPUTED',
    CANCELLED = 'CANCELLED',
}

export interface Offer {
    _id: string;
    id: number;
    type: OfferTypeEnum;
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
    status: OfferStatusEnum;
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
    status?: OfferStatusEnum;
    type?: OfferTypeEnum;
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
    getUserOffers(userAddress: string, params?: { status?: OfferStatusEnum; type?: OfferTypeEnum; page?: number; limit?: number }): Promise<GetEventOffersResponse>;
}
