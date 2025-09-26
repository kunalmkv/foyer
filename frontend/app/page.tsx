import {Header} from "@/app/components/Header";
import {SearchBar} from "@/app/components/Input";
import {HeroBanner} from "@/app/components/HeroBanner";
import {FilterChips} from "@/app/components/FilterChips";
import {EventSection} from "@/app/components/EventSection";
import {eventService} from "@/app/service/events.service";
import {Events} from "@/app/types/Events";


export default async function Home(){
    const events= await eventService.getAllEvents()

    const ComedyEvents=events.filter((event:Events)=>event.category==="COMEDY")
    const MusicEvents=events.filter((event:Events)=>event.category==="MUSIC")
    const EducationEvents=events.filter((event:Events)=>event.category==="EDUCATION")
    const SportsEvents=events.filter((event:Events)=>event.category==="SPORTS")
    return (
        <div className="min-h-screen bg-[#E8DFCA]">

            <main className="container mx-auto px-8 py-8">
                {/* Search Section */}
                <div className="mb-12">
                    <SearchBar />
                </div>

                {/* Hero Banner */}
                <div className="mb-12">
                    <HeroBanner events={events} />
                </div>

                {/* Filters */}
                {/*<FilterChips />*/}

                {/* Recently Viewed */}
                <EventSection
                    title="Comedy Events Happening"
                    events={ComedyEvents}
                    showEdit={false}
                />

                <EventSection
                    title="Sports Events Happening"
                    events={SportsEvents}
                    showEdit={false}
                />
                <EventSection
                    title="Music Events Happening"
                    events={MusicEvents}
                    showEdit={false}
                />
                <EventSection
                    title="Education Events Happening"
                    events={EducationEvents}
                    showEdit={false}
                />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-8">
                    <div className="text-center">
                        <p className="mb-2">We&#39;re the world&#39;s largest secondary marketplace for tickets to live events.</p>
                        <p className="text-sm text-gray-400">Prices are set by sellers and may be below or above face value.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
