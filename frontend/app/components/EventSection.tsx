import {EventCard} from "@/app/components/EventCard";
import {Events} from "@/app/types/Events";


export const EventSection = ({ title, events, showEdit = false }:{title:string,events:Events[],showEdit:boolean}) => {
    return (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {showEdit && (
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((event, index) => (
                    <EventCard key={index} event={event} size={'normal'} />
                ))}
            </div>
        </div>
    );
};
