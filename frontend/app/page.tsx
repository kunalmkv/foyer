import {Header} from "@/app/components/Header";
import {SearchBar} from "@/app/components/Input";
import {HeroBanner} from "@/app/components/HeroBanner";
import {EventSection} from "@/app/components/EventSection";
import {eventService} from "@/app/service/events.service";
import {Events} from "@/app/types/Events";


export default async function Home(){
    const events= await eventService.getAllEvents()
    console.log(events,'masti')

    const ComedyEvents=events.filter((event:Events)=>event.category==="COMEDY")
    const MusicEvents=events.filter((event:Events)=>event.category==="MUSIC")
    const EducationEvents=events.filter((event:Events)=>event.category==="EDUCATION")
    const SportsEvents=events.filter((event:Events)=>event.category==="SPORTS")
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">

            <main className="container mx-auto px-6 md:px-8 py-8 space-y-16">
                {/* Search Section */}
                <div className="pt-8">
                    <SearchBar events={events} />
                </div>

                {/* Hero Banner */}
                <div>
                    <HeroBanner events={events} />
                </div>

                {/* Event Sections */}
                <div className="space-y-12">
                    <EventSection
                        title="Sports"
                        events={SportsEvents}
                        showEdit={false}
                    />
                    <EventSection
                        title="Comedy"
                        events={ComedyEvents}
                        showEdit={false}
                    />



                    <EventSection
                        title="Music "
                        events={MusicEvents}
                        showEdit={false}
                    />

                    <EventSection
                        title= "Education"
                        events={EducationEvents}
                        showEdit={false}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-gray-300 py-16 mt-16">
                <div className="container mx-auto px-8">
                    <div className="text-center space-y-4">
                        <p className="text-sm text-gray-400">Prices are set by sellers and may be below or above face value.</p>
                        <div className="flex justify-center space-x-6 pt-4 text-sm">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
