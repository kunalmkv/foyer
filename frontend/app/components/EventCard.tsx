'use client'
import {useState} from "react";
import {Calendar, Heart, Users} from "lucide-react";
import {Events} from "@/app/types/Events";


export const EventCard = ({ event, size = 'normal' }:{event:Events,size:string}) => {
    const [isLiked, setIsLiked] = useState(false);
    const getCategoryGradient = (category: Events['category']) => {
        switch(category) {
            case 'SPORTS': return 'linear-gradient(135deg, #0F4A3C 0%, #2A6B5C 50%, #6D94C5 100%)';
            case 'MUSIC': return 'linear-gradient(135deg, #2A3B5C 0%, #465C88 50%, #6D94C5 100%)';
            case 'COMEDY': return 'linear-gradient(135deg, #8B5A3C 0%, #D2691E 50%, #FFD700 100%)';
            case 'EDUCATION': return 'linear-gradient(135deg, #4A5568 0%, #6B7280 50%, #9CA3AF 100%)';
            default: return 'linear-gradient(135deg, #6D94C5 0%, #CBD6EB 50%, #E8DFCA 100%)';
        }
    };
    const getCategoryIcon = (category: Events['category']) => {
        switch(category) {
            case 'SPORTS': return '🏈';
            case 'MUSIC': return '🎤';
            case 'COMEDY': return '🎭';
            case 'EDUCATION': return '📚';
            default: return '🎫';
        }
    };
    return (
        <div className={`relative group cursor-pointer ${size === 'large' ? 'col-span-2' : ''}`}>
            <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div
                    className={`${size === 'large' ? 'h-64' : 'h-48'} bg-gradient-to-br ${getCategoryGradient(event.category)} flex items-center justify-center`}
                >
                    <div className="text-center text-white">
                        <div className="text-4xl mb-2">{getCategoryIcon(event.category)}</div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                    <Heart
                        size={20}
                        className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors`}
                    />
                </button>

                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm font-medium">
                    {event.category}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{event.name}</h3>
                {event.venue && (
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                        <Calendar size={14} className="mr-1" />
                        {event.venue}
                    </div>
                )}
                {event.category && (
                    <div className="flex items-center text-gray-600 text-sm">
                        <Users size={14} className="mr-1" />
                        {event.category}
                    </div>
                )}
            </div>
        </div>
    );
};
