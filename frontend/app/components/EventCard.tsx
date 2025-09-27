'use client'
import {useState} from "react";
import {Calendar, Heart, Users} from "lucide-react";
import {Events} from "@/app/types/Events";


export const EventCard = ({ event, size = 'normal' }:{event:Events,size:string}) => {
    const [isLiked, setIsLiked] = useState(false);
    const getCategoryGradient = (category: Events['category']) => {
        switch(category) {
            case 'SPORTS': return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)';
            case 'MUSIC': return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)';
            case 'COMEDY': return 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)';
            case 'EDUCATION': return 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)';
            default: return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)';
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
            <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105 hover:border-gray-600/70">
                <div className={`${size === 'large' ? 'h-64' : 'h-48'} relative`}>
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/60 transition-all duration-300" />
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all duration-200 border border-white/20 hover:border-white/40"
                >
                    <Heart
                        size={18}
                        className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors`}
                    />
                </button>

                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider border border-white/20">
                    {event.category}
                </div>

                <div className="p-6 bg-gray-800/70 backdrop-blur-sm">
                    <h3 className="font-bold text-xl text-white mb-2 line-clamp-1">{event.name}</h3>
                    {event.venue && (
                        <div className="flex items-center text-gray-300 text-sm mb-2">
                            <Calendar size={16} className="mr-2 text-blue-400" />
                            <span className="truncate">{event.venue}</span>
                        </div>
                    )}
                    {event.category && (
                        <div className="flex items-center text-gray-400 text-sm">
                            <Users size={16} className="mr-2 text-purple-400" />
                            <span className="font-medium">{event.category}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
