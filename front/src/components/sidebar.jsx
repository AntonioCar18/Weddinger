import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { QueryCache, QueryClient, useQuery } from "@tanstack/react-query";

export default function Sidebar({ activeTab }) {
    const navigate = useNavigate();
    const [names, setNames] = useState("Učitavanje..."); // Početno stanje

    const handleLogout = async () => {
        try {

            window.location.replace("/login");
            // Pozivamo backend da obriše cookie
            await fetch("/api/logout", { 
                method: "POST", 
                credentials: 'include' // Ključno za slanje cookieja
            });
            
            // Nakon toga, samo očisti lokalno stanje i preusmjeri
            queryClient.clear();
        } catch (error) {
            console.error("Greška pri odjavi:", error);
        }
    };

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
        staleTime: 3000, // Podaci su "svježi" 3 sekunde, nema potrebe za pozivom servera prije toga
        refetchInterval: 3000, // Automatski će raditi provjeru svakih 3 sekunde, ali samo ako je prozor aktivan
        refetchOnWindowFocus: true, // Ovo je "bonus": ako korisnik prebaci tab i vrati se, odmah će provjeriti sesiju
        });

        // Postavljanje imena - React Query će ovo pokrenuti svaki put kad userData stigne
        useEffect(() => {
        if (userData) {
            setNames(`${userData.partner_one} & ${userData.partner_two}`);
        }
        }, [userData]);

    const menuItems = [
        {
            name: "Nadzorna ploča",
            path: "/dashboard",
            icon: (
                <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            )
        },
        {
            name: "Gosti",
            path: "/guests",
            icon: (
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 20v-1c0-2.761 4.029-5 8-5s8 2.239 8 5v1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            )
        },
        {
            name: "Raspored sjedenja",
            path: "/sitting-schedule",
            icon: (
                <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            )
        },
        {
            name: "Budžet",
            path: "/budget",
            icon: (
                <>
                    <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/>
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </>
            )
        },
        {
            name: "Zadaci",
            path: "/tasks",
            icon: (
                <>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <path d="M7 10l5 5 5-5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </>
            )
        },
        {
            name: "Partneri",
            path: "/partners",
            icon: (
                <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            )
        },
        {
            name: "Dokumenti",
            path: "/documents",
            icon: (
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            )
        },
        {
            name: "FAQ",
            path: "/FAQ",
            icon: (
                <>
                    <circle cx="12" cy="12" r="9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </>
            )
        },
        {
            name: "Postavke",
            path: "/settings",
            icon: (
                <>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </>
            )
        }
    ];

    return (
         <div className="flex flex-col h-full">
            <div onClick={() => navigate("/settings")} className="cursor-pointer mt-3 mx-1 py-3 px-4 bg-gray-50/70 border border-gray-100 rounded-xl flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#B8926A] shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider leading-none">Mladenci</p>
                    <p className="text-sm font-bold text-gray-700 truncate mt-1" title={names}>
                        {names}
                    </p>
                </div>
            </div>

            <div className="flex flex-col flex-1 mt-5 overflow-y-auto">
                <ul className="space-y-2 font-semibold">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.name;

                        return (
                            <li
                                key={item.name}
                                onClick={() => item.path && navigate(item.path)}
                                className={`flex items-center space-x-4 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                                    isActive
                                        ? "text-[#B8926A] bg-[#B8926A]/10" 
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50" 
                                }`}
                            >
                                <svg 
                                    className={`w-5 h-5 transition-colors ${
                                        isActive ? "text-[#B8926A]" : "text-gray-400 group-hover:text-gray-700"
                                    }`} 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor"
                                >
                                    {item.icon}
                                </svg>
                                <span>{item.name}</span>
                            </li>
                        );
                    })}

                    <li 
                        className="flex items-center space-x-4 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-200 group mt-auto" 
                        onClick={handleLogout}
                    >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12H9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Odjava</span>
                    </li>
                    
                </ul>
            </div>
            <div className="pt-4 mt-2 text-center shrink-0">
                <p className="text-[10px] text-gray-400">
                    © {new Date().getFullYear()} <a href="https://4solutions.hr">4Solutions</a>. Sva prava pridržana.
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 hover:underline">Privatnost</a>
                    {" · "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 hover:underline">Uvjeti korištenja</a>
                </p>
            </div>
        </div>
    );
}