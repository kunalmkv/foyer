import {Info, MapPin, Zap} from "lucide-react";
import {Events} from "@/app/types/Events";

export const EventInformation = ({ event }:{event:Events}) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Information</h2>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Info size={20} />
                        About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        {event.description}
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={20} />
                        Venue Details
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p><span className="font-medium">Venue:</span> {event.venue}</p>
                        <p><span className="font-medium">Status:</span> {event.status}</p>
                        <p><span className="font-medium">Category:</span>{event.category}</p>
                        <p><span className="font-medium">Age Restriction:</span> All ages welcome</p>
                    </div>
                </div>
            </div>


            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                    <Zap className="text-yellow-600 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-yellow-800 mb-2">Important Information</h4>
                        <ul className="text-yellow-700 text-sm space-y-1">
                            <li>• Doors open 30 minutes before show time</li>
                            <li>• No outside food or beverages allowed</li>
                            <li>• Flash photography is prohibited during performance</li>
                            <li>• Latecomers will be seated at management&#39;s discretion</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
