import {IOfferService, Offer} from "@/app/types/Events";
import {baseurl} from "@/app/consts";

export class OfferService  implements IOfferService{

   async getOfferById(offerId: number): Promise<Offer> {
        if(!offerId){
            throw Error(`OfferId ${offerId} not found`);
        }
        const response=await fetch(`${baseurl}/offers/${offerId}`, {
            cache: "no-cache"
        })
        const {offer}=await response.json();
        return offer;
    }

    async getOfferByEventId(eventId:number): Promise<Offer[]> {
       if(!eventId){
           throw Error(`EventId ${eventId} not found`);
       }
       const response=await fetch(`${baseurl}/offers/${eventId}`, {
           cache: "no-cache"
       })

        return response.json();
    }
}

export const offerService = new OfferService();
