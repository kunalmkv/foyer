import {ArrowLeft} from "lucide-react";
import Link from "next/link";

export const Breadcrumb = ({eventName}: { eventName: string }) => {
    return (
        <Link href={"/"}>
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-6 ">
                <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                    <ArrowLeft size={16}/>
                    Back to Events
                </button>

                <span>/</span>
                <span className="text-white font-medium">{eventName}</span>
            </div>
        </Link>
    );
};