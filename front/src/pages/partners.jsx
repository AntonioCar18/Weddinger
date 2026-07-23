import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import weddingerLogo from "../assets/logo.png";
import PartnersBlock from "../components/partnesBlock";
import { Building2, Camera, Utensils, Flower, Music, Users, LocateIcon, MapPin, BadgeCheck, Star, Phone } from 'lucide-react';
import PartnersBlockPresentation from "../components/partnersBlockPresentation";

const Partners = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchPartner, setSearchPartner] = useState("");
    const [partners, setPartners] = useState([]);

    const categoryIcons = {
        "Fotograf/Videograf": Camera,
        "Catering/Vjenčanje": Utensils,
        "Cvijeće/Dekoracije": Flower,
        "Glazba/Pratnja/DJ": Music,
    };

    const defaultIcon = Building2;

    const getPartners = async () => {
        try { const response = await fetch("/api/partners",
            {
                method: "GET",
                credentials: "include",
            });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            setPartners(data);
        }
        } catch (error) {
            console.error("Greška prilikom dohvaćanja partnera:", error);
        }
    }

    useEffect(() => {
        getPartners();
    }, []);

    return (
        <div className="h-dvh w-screen flex bg-[#fcfbfa] relative">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
                   
            <div className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col p-6 shadow-xl h-full border-r border-gray-100 z-40 lg:z-10 lg:static transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between lg:justify-center">
                    <img src={weddingerLogo} alt="Weddinger Logo" className="h-auto w-36 lg:w-44" />
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <Sidebar activeTab="Partneri" />
            </div>

            <div className="flex flex-1 h-screen flex-col overflow-y-auto bg-[#fcfbfa]">
                <div className="flex flex-col w-full h-full relative">
                    <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 flex-row items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">Pregled partnera</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 truncate mt-0.5">Provjereni partneri koji Vam mogu pomoći oko Vašeg dana</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col px-4 md:px-10 lg:px-16 py-4 space-y-6 h-fit pb-6 pt-6">
                    <div className="bg-white p-8 rounded-lg shadow lg:hidden">
                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-[#8B6B47] shrink-0" />
                            <h2 className="text-[12px] text-gray-500 font-medium uppercase tracking-wider truncate">
                                    Ukupno partnera
                            </h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {partners.total_partners}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 w-full">
                        <div className="bg-white p-8 rounded-lg shadow hidden display lg:block">
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-[#8B6B47] shrink-0" />
                                <h2 className="text-[12px] text-gray-500 font-medium uppercase tracking-wider truncate">
                                    Ukupno partnera
                                </h2>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                {partners.total_partners}
                            </p>
                        </div>
                        <PartnersBlock icon_partners={Camera} title="Fotograf/Videograf" count={partners.foto_video_partners} />
                        <PartnersBlock icon_partners={Utensils} title="Catering/Vjenčanje" count={partners.catering_partners} />
                        <PartnersBlock icon_partners={Flower} title="Cvijeće/Dekoracije" count={partners.flower_partners} />
                        <PartnersBlock icon_partners={Music} title="Glazba/Pratnja/DJ" count={partners.music_partners} />
                    </div>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="relative w-full lg:max-w-md group">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#B8926A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Pretraži partnere po nazivu..."
                                className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl pl-11 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 placeholder-gray-400"
                                value={searchPartner}
                                onChange={(e) => setSearchPartner(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 w-full">
                        {partners.data && partners.data.length > 0 ? (
                            partners.data
                                .map((partner, index) => (
                                    <PartnersBlockPresentation
                                        key={partner.id}
                                        icon_partners={categoryIcons[partner.partner_category] || defaultIcon}
                                        title={partner.partner_name}
                                        desc={partner.partner_description}
                                        location={partner.partner_location}
                                        category={partner.partner_category}
                                    />
                                ))
                        ) : (
                            <p className="text-gray-500">Nema partnera za prikaz.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Partners;