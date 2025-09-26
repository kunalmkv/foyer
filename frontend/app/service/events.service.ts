import {Events, IEventService} from "@/app/types/Events";
import {baseurl} from "@/app/consts";

export class EventService implements IEventService{

   async getAllEvents(): Promise<Events[]> {
        const response= await fetch(`${baseurl}/event`,{
            cache: 'no-cache',
        });
       if (!response.ok) {
           throw new Error(`Failed to fetch events: ${response.statusText}`);
       }
       const {events}=await response.json();
       return events;
    }

    async getEventById(id: number): Promise<Events> {
       const response= await fetch(`${baseurl}/event/${id}`,{
           cache: 'no-cache',
       })
        if (!response.ok) {
            throw new Error(`Failed to fetch event: ${response.statusText}`);
        }
        const {event}=await response.json();
        return event
    }
}

export const eventService = new EventService();
