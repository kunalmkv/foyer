import {Search} from "lucide-react";

export const SearchBar = () => {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="relative group">
                <div className="flex items-center border-2 border-gray-600/50 rounded-2xl p-6 shadow-2xl bg-gray-800/50 backdrop-blur-md hover:border-blue-500/50 transition-all duration-300 hover:shadow-blue-500/20">
                    <Search className="text-gray-400 mr-4 group-hover:text-blue-400 transition-colors duration-300" size={28} />
                    <input
                        type="text"
                        placeholder="Search events, artists, teams, and more..."
                        className="flex-1 text-lg text-white placeholder-gray-400 outline-none bg-transparent font-medium"
                    />
                    <div className="hidden md:flex items-center space-x-2 text-gray-500 text-sm">
                        <kbd className="px-2 py-1 bg-gray-700/50 rounded border border-gray-600 text-xs">⌘</kbd>
                        <kbd className="px-2 py-1 bg-gray-700/50 rounded border border-gray-600 text-xs">K</kbd>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
            </div>
        </div>
    );
};