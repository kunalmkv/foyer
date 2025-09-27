import { baseurl } from "@/app/consts";
import { GetEventOffersRequest, GetEventOffersResponse, IOfferService, Offer } from "@/app/types/Offers";

class OfferService implements IOfferService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${baseurl}/offer`;
    }

    async getEventOffers(params: GetEventOffersRequest): Promise<GetEventOffersResponse> {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.status) queryParams.append('status', params.status);
            if (params.type) queryParams.append('type', params.type);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const url = `${this.baseUrl}/event/${params.eventId}?${queryParams.toString()}`;
            console.log('Fetching offers from URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Offers API response status:', response.status);
            console.log('Offers API response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Offers API error response:', errorText);
                throw new Error(`Failed to fetch offers: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Offers API response data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching event offers:', error);
            throw error;
        }
    }

    async getOffer(offerId: number): Promise<{ message: string; offer: Offer }> {
        try {
            const response = await fetch(`${this.baseUrl}/${offerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch offer: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching offer:', error);
            throw error;
        }
    }

    async getUserOffers(userAddress: string, params?: { status?: string; type?: string; page?: number; limit?: number }): Promise<GetEventOffersResponse> {
        try {
            const queryParams = new URLSearchParams();
            
            if (params?.status) queryParams.append('status', params.status);
            if (params?.type) queryParams.append('type', params.type);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const url = `${this.baseUrl}/user/${userAddress}?${queryParams.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user offers: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user offers:', error);
            throw error;
        }
    }
}

export const offerService = new OfferService();
