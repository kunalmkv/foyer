import {EventCard} from "@/app/components/EventCard";
import {Events} from "@/app/types/Events";


export const EventSection = ({ title, events, showEdit = false }:{title:string,events:Events[],showEdit:boolean}) => {
    return (
        <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{title}</h2>
                {showEdit && (
                    <button className="text-blue-400 hover:text-blue-300 font-medium px-4 py-2 rounded-lg border border-blue-400/30 hover:border-blue-300/50 transition-all duration-200 hover:bg-blue-400/10">
                        Edit
                    </button>
                )}
            </div>

            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {events.map((event, index) => (
                        <EventCard key={index} event={event} size={'normal'} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                    <div className="text-4xl mb-4">🎭</div>
                    <p className="text-gray-400 text-lg">No events in this category yet</p>
                    <p className="text-gray-500 text-sm mt-2">Check back soon for new events!</p>
                </div>
            )}
        </div>
    );
};
