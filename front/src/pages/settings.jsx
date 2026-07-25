import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import weddingerLogo from "../assets/logo.png";
import { HeartIcon } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const Settings = () => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [partnerNames, setPartnerNames] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { data: userData } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await fetch("/api/me", { credentials: 'include' });
            if (response.status === 401) {
                window.location.href = "/login";
                throw new Error("Neautorizirano");
            }
            const data = await response.json();
            return data.user;
        },
        staleTime: 60000, // Podaci su "svježi" 1 minutu, nema potrebe za pozivom servera prije toga
        refetchInterval: 30000, // Automatski će raditi provjeru svakih 30 sekundi, ali samo ako je prozor aktivan
        refetchOnWindowFocus: true, // Ovo je "bonus": ako korisnik prebaci tab i vrati se, odmah će provjeriti sesiju
    });

    const names = userData ? { partner_one: userData.partner_one, partner_two: userData.partner_two } : { partner_one: "", partner_two: "" };

    const updateNames = async (names) => {
        setIsSaving(true);
        setShowSuccess(false);
        try {
            const response = await fetch("/api/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(names),
            });
            if (response.ok) {
                queryClient.invalidateQueries(['user-profile']); // Refresh the names after successful update
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Greška prilikom ažuriranja partnera:", error);
            setIsSaving(false);
        }
    }

    useEffect(() => {
        if (userData) {
            setPartnerNames({ partner_one: userData.partner_one, partner_two: userData.partner_two });
        }
    }, [userData]);

    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 2000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    return (
        <div className="h-screen flex overflow-hidden bg-[#fcfbfa] relative">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col p-6 shadow-xl h-full border-r border-gray-100 z-40 lg:z-10 lg:static transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between lg:justify-center">
                    <img src={weddingerLogo} alt="Weddinger Logo" className="h-auto w-36 lg:w-44" />
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <Sidebar activeTab="Postavke" />
            </div>

            <div className="flex flex-1 h-screen flex-col overflow-y-auto bg-[#fcfbfa]">
                <div className="flex flex-col w-full h-full relative">
                    <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 flex-row items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">Postavke</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 truncate mt-0.5">Upravljajte postavkama svog računa</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col px-4 md:px-10 lg:px-16 py-4 space-y-6 pb-6 pt-6">
                        <div className="flex flex-col bg-white rounded-2xl border border-[#efe9e0] shadow-sm hover:shadow-md transition-shadow duration-200 p-8 w-full">
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#B8926A]/10 rounded-xl p-2.5">
                                    <HeartIcon className="w-6 h-6 text-[#8B6B47]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-semibold text-gray-800">Mladenci</h2>
                                    <p className="text-sm text-gray-500">Imena koja se prikazuju kroz cijelu aplikaciju</p>
                                </div>
                            </div>

                            <div className="items-start mt-8 flex flex-col md:flex-row gap-10">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 text-[#8B6B47] flex items-center justify-center font-semibold text-xl shrink-0">
                                        {partnerNames?.partner_one?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner 1 (mladenka)</p>
                                        <input
                                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                            value={partnerNames?.partner_one || ""}
                                            onChange={(e) => setPartnerNames({ ...partnerNames, partner_one: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 text-[#8B6B47] flex items-center justify-center font-semibold text-xl shrink-0">
                                        {partnerNames?.partner_two?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner 2 (mladoženja)</p>
                                        <input
                                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                            value={partnerNames?.partner_two || ""}
                                            onChange={(e) => setPartnerNames({ ...partnerNames, partner_two: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                <p>
                                    {showSuccess && <span className="text-sm text-[#8B6B47] font-semibold">Promjene su uspješno spremljene!</span>}
                                </p>
                                <button
                                    onClick={() => updateNames(partnerNames)}
                                    className="cursor-pointer bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 disabled:opacity-60"
                                >
                                    Spremi promjene
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;