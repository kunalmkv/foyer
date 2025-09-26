'use client'
import {useState} from "react";
import {Calendar, Clock, Heart, MapPin, Share2, Shield, Star} from "lucide-react";
import {Events} from "@/app/types/Events";

export const EventHero = ({ event }:{event:Events}) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Event Image */}
            <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                    <div
                        className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center"
                    >
                        <div className="text-center text-white">
                            <div className="text-2xl font-bold">{event.name}</div>
                        </div>
                    </div>
                </div>

                {/* High Demand Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    High demand 🔥
                </div>
            </div>

            {/* Event Details */}
            <div className="flex flex-col justify-center">
                <div className="mb-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        {event.name}
                    </h1>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={20} />
                            <span className="font-medium">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={20} />
                            <span className="font-medium">{event.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={20} />
                            <span className="font-medium">{event.venue}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 fill-yellow-500" size={20} />
                            <span className="font-bold text-gray-900">4.8</span>
                            <span className="text-gray-600">(2,341 reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                            <Shield size={16} />
                            <span className="text-sm font-medium">Verified seller</span>
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        {event.description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                            isLiked
                                ? 'border-red-500 bg-red-50 text-red-500'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                    </button>

                    <button className="p-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
