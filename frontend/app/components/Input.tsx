import {Search} from "lucide-react";

export const SearchBar = () => {
    return (
        <div className="w-full max-w-4xl mx-auto ">
            <div className="relative">
                <div className="flex items-center  border-2 border-gray-200 rounded-2xl p-4 shadow-lg bg-[#F5EFE6]">
                    <Search className="text-gray-400 mr-4" size={24} />
                    <input
                        type="text"
                        placeholder="Search events, artists, teams, and more"
                        className="flex-1 rent text-lg placeholder-gray-400 outline-none bg-[#F5EFE6]"
                    />
                </div>
            </div>
        </div>
    );
};