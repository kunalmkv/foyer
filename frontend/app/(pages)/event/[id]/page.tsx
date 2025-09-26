import {Breadcrumb} from "@/app/(pages)/event/components/Breadcrums";
import {EventHero} from "@/app/(pages)/event/components/EventHero";
import {TicketCard} from "@/app/(pages)/event/components/TicketCard";
import {EventInformation} from "@/app/(pages)/event/components/EventInfo";
import {eventService} from "@/app/service/events.service";

interface EventDetailsPageProps {
    params: {
        id: string;
    };
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
    const { id } = params;
    const event = await eventService.getEventById(parseInt(id));

    return (
        <div className="min-h-screen bg-[#E8DFCA]">
            <main className="container mx-auto px-8 py-8">
                <Breadcrumb eventName={event.name} />

                <EventHero event={event} />

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <EventInformation event={event} />

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Average Price</span>
                                    <span className="font-bold">INR 4,156</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cheapest Price</span>
                                    <span className="font-bold text-green-600">INR 1,618</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Most Expensive</span>
                                    <span className="font-bold">INR 9,674</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Listings</span>
                                    <span className="font-bold">4</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
