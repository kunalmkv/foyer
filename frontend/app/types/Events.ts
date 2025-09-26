export interface Events{
_id:string;
id:number;
name: string;
description: string;
category: 'SPORTS'|'COMEDY'|'MUSIC'|'EDUCATION';
venue: string;
imageUrl: string;
metadataUrl: string;
status:'UPCOMING'|'ONGOING'|'COMPLETED'|'CANCELLED';
}

export interface IEventService{
    getAllEvents(): Promise<Events[]>;
    getEventById(id: number): Promise<Events>;
}

// Enum for offer status
export enum OfferStatus {
    ACTIVE = 'ACTIVE',
    SETTLED = 'SETTLED',
    ACCEPTED = 'ACCEPTED',
    DISPUTED = 'DISPUTED',
    CANCELLED = 'CANCELLED'
}

// Type for ticket metadata
export interface TicketMetadata {
    quantity: number;
    seatNumbers: string[];
    seatType: string;
    isPhysicalTicketNeededToAttend: boolean;
}

export interface Offer {
    id: number;
    eventId: number;
    sellerAddress: string;
    collateral: number;
    ask: number;
    buyerAddress: string | null;
    metadata: TicketMetadata;
    metadataUrl: string;
    status: OfferStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOfferService{
    getOfferById(offerId:number): Promise<Offer>;
    getOfferByEventId(eventId:number): Promise<Offer[]>;
}
