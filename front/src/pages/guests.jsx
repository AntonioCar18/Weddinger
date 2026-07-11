import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import weddingerLogo from "../assets/logo.png";
import AddGuest from "../components/addGuest";
import GuestBlock from "../components/guest_block";
import ExportGuestsToPDF from "../components/exportPDFGuests";
import EditGuest from "../components/editGuest";
import Sidebar from "../components/sidebar";
import { useQuery } from '@tanstack/react-query';
import { UsersRound } from "lucide-react";

const Guests = () => {
    const navigate = useNavigate();
    const [showAddPage, setShowAddPage] = useState(false);
    const [searchGuest, setSearchGuest] = useState("");
    const [statusFilter, setStatusFilter] = useState("Svi");
    const [plusOneFilter, setPlusOneFilter] = useState("Svi");
    const [menuFilter, setMenuFilter] = useState("Svi");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [selectGuestForEdit, setSelectGuestForEdit] = useState(null);

    const { data: guestsData = [], isLoading, refetch } = useQuery({
        queryKey: ['guests'], // Ovo je ključ koji povezuje cache
        queryFn: async () => {
            const response = await fetch("/api/guests", { 
                method: "GET", 
                credentials: 'include' 
            });
            if (!response.ok) throw new Error("Greška");
            return response.json();
        },
        staleTime: 5000, // Podaci su "svježi" 5 sekundi - neće ih ponovo tražiti dokle god su svježi
        refetchInterval: 10000, // Zadržavamo tvoj interval od 10s u pozadini
    });
    

    useEffect(() => {
        setCurrentPage(1);
    }, [searchGuest, statusFilter, plusOneFilter, menuFilter]);

    const totalNumber = (guestsData?.length || 0) + (guestsData?.filter(guest => guest.plus_one === true).length || 0);
    const confirmedNumber = (guestsData?.filter(guest => guest.status === "Potvrđeno").length || 0) + (guestsData?.filter(guest => guest.plus_one === true && guest.status === "Potvrđeno").length || 0);
    const pendingNumber = (guestsData?.filter(guest => guest.status === "Na čekanju").length || 0) + (guestsData?.filter(guest => guest.plus_one === true && guest.status === "Na čekanju").length || 0); 
    const rejectedNumber = (guestsData?.filter(guest => guest.status === "Odbijeno").length || 0) + (guestsData?.filter(guest => guest.plus_one === true && guest.status === "Odbijeno").length || 0);

    const handleSaveGuest = async (guestData) => {
        try {  
            const response = await fetch("/api/guests", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guestData), 
                credentials: 'include'
            });
            if (response.ok) {
                setShowAddPage(false);
                refetch();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Došlo je do greške prilikom dodavanja gosta.");
            }
        } catch (error) {
            console.error("Greška pri slanju:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

    const filteredGuests = guestsData?.filter((guest) => {
        const searchTerm = searchGuest.toLowerCase();
        const matchesStatus = statusFilter === "Svi" || guest.status === statusFilter;
        const matchesPlusOne = plusOneFilter === "Svi" || guest.plus_one === (plusOneFilter === "Da");
        const matchesMenu = menuFilter === "Svi" || guest.menu_type === menuFilter || (guest.plus_one && guest.menu_type_plus_one === menuFilter);
        return (
            guest.name?.toLowerCase().includes(searchTerm) || 
            (guest.plus_one_name && guest.plus_one_name.toLowerCase().includes(searchTerm))
        ) && matchesStatus && matchesPlusOne && matchesMenu;
    }) || [];

    const indexOfLastGuest = currentPage * itemsPerPage;
    const indexOfFirstGuest = indexOfLastGuest - itemsPerPage;
    
    const currentGuests = filteredGuests.slice(indexOfFirstGuest, indexOfLastGuest);
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);

    const deleteGuest = async (guestId) => {
        if (!window.confirm("Jeste li sigurni da želite izbrisati ovog gosta?")) {
            return;
        }
        try {
            const response = await fetch(`/api/guests/${guestId}`, {
                method: "DELETE",
                headers: {
                },
                credentials: 'include'
            });
            if (response.ok) {
                const filteredLengthAfterDelete = filteredGuests.length - 1;
                const maxPageWithNewCount = Math.ceil(filteredLengthAfterDelete / itemsPerPage);
                if (currentPage > maxPageWithNewCount && maxPageWithNewCount > 0) {
                    setCurrentPage(maxPageWithNewCount);
                }
                refetch();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Došlo je do greške prilikom brisanja gosta.");
            }
        } catch (error) {
            console.error("Greška pri brisanju:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

    const guestStatus = async (guestId, currentStatus) => {
        const statusOrder = {
            "Na čekanju": "Potvrđeno",
            "Potvrđeno": "Odbijeno",
            "Odbijeno": "Na čekanju"
        };
        const newStatus = statusOrder[currentStatus] || "Na čekanju";

        const originalGuest = guestsData.find(guest => guest.id === guestId);
        if (!originalGuest) return;

        const updatedGuest = {
            name: originalGuest.name,
            plus_one: originalGuest.plus_one,
            plus_one_name: originalGuest.plus_one_name,
            phone: originalGuest.phone,
            status: newStatus,
            menu_type: originalGuest.menu_type || "Standard",
            menu_type_plus_one: originalGuest.menu_type_plus_one || "Standard",
            table_number: originalGuest.table_number,
            notes: originalGuest.notes
        };

        try {
            const response = await fetch(`/api/guests/${guestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedGuest),
                credentials: 'include'
            });
            if (response.ok) {
                refetch();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Došlo je do greške prilikom ažuriranja statusa gosta.");
            }
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

    const updateGuest = async (guestId, updatedData) => {
        try {
            const response = await fetch(`/api/guests/${guestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
                credentials: 'include'
            });
            if (response.ok) {
                refetch();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Došlo je do greške prilikom ažuriranja gosta.");
            }
        } catch (error) {
            console.error("Greška pri ažuriranju gosta:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

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
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-800"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <Sidebar activeTab="Gosti"/>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">Popis gostiju</h1>
                    <p className="hidden md:block text-sm lg:text-base text-gray-500 truncate mt-0.5">Upravljajte svojim gostima, dodajte ih i uređujte informacije.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button 
                        className="cursor-pointer bg-[#B8926A] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200 whitespace-nowrap"
                        onClick={() => ExportGuestsToPDF(filteredGuests)}
                    >
                        Izvezi u PDF
                    </button>
                    <button 
                        className="hidden lg:block cursor-pointer bg-[#B8926A] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200 whitespace-nowrap"
                        onClick={() => setShowAddPage(true)}
                    >
                        <span className="inline cursor-pointer lg:hidden">+ </span>Dodaj gosta
                    </button>
                </div>
            </div>

            <div className="flex-1 px-4 md:px-10 lg:px-16 py-4 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 w-full">
                    <GuestBlock title="Ukupno gostiju" count={totalNumber} />
                    <GuestBlock title="Potvrđeni" count={confirmedNumber} />
                    <GuestBlock title="Upitni" count={pendingNumber} />
                    <GuestBlock title="Odbijeni" count={rejectedNumber} />
                </div>

                <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="relative w-full lg:max-w-md group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#B8926A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Pretraži goste po imenu ili pratnji..."
                            className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl pl-11 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 placeholder-gray-400"
                            value={searchGuest}
                            onChange={(e) => setSearchGuest(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full lg:flex lg:w-auto lg:justify-end">
                        <div className="w-full lg:w-48 relative group flex items-center">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#B8926A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl pl-11 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                            >
                                <option value="Svi">Svi statusi</option>
                                <option value="Potvrđeno">Potvrđeno</option>
                                <option value="Na čekanju">Na čekanju</option>
                                <option value="Odbijeno">Odbijeno</option>
                            </select>
                        </div>

                        <div className="w-full lg:w-48 relative group flex items-center">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#B8926A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </span>
                            <select
                                value={plusOneFilter}
                                onChange={(e) => setPlusOneFilter(e.target.value)}
                                className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl pl-11 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                            >
                                <option value="Svi">Pratnja</option>
                                <option value="Da">S pratnjom</option>
                                <option value="Ne">Bez pratnje</option>
                            </select>
                        </div>

                        <div className="w-full lg:w-48 relative group flex items-center">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#B8926A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 00-5 5h10a5 5 0 00-5-5zM2 17h20a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1v1a1 1 0 011-1z" />
                                </svg>
                            </span>
                            <select
                                value={menuFilter}
                                onChange={(e) => setMenuFilter(e.target.value)}
                                className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl pl-11 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                            >
                                <option value="Svi">Svi meni</option>
                                <option value="Standard">Standard</option>
                                <option value="Vegetarijanski">Vegetarijanski</option>
                                <option value="Veganski">Veganski</option>
                                <option value="Bez glutena">Bez glutena</option>
                                <option value="Dječji">Dječji</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="w-full hidden md:block">
                    <div className="overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100">
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">Ime i prezime</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ime i prezime pratnje</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Broj mobitela</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Meni</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Akcije</th>
                                    <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider pr-6">Napomena</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {guestsData.length === 0 ? (
                                   <tr>
                                        <td colSpan="7" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                            <p className="text-gray-500 font-medium">Trenutačno nemate dodanih gostiju.</p>
                                            <button 
                                                onClick={() => setShowAddPage(true)} 
                                                className="mt-4 text-[#B8926A] font-semibold hover:underline cursor-pointer"
                                            >
                                                Dodaj prvog gosta
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredGuests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-gray-400 font-medium">
                                            Nema pronađenih gostiju za filtrirane pojmove.
                                        </td>
                                    </tr>
                                ): (
                                    currentGuests.map((guest) => (
                                        <tr 
                                        key={guest.id} 
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectGuestForEdit(guest)}
                                        >
                                            <td className="py-4 px-5 font-medium text-gray-800 pl-6 align-middle">{guest.name}</td>
                                            <td className="py-4 px-5 text-gray-600 font-medium align-middle">{guest.plus_one_name || <span className="text-gray-300">—</span>}</td>
                                            <td className="py-4 px-5 text-gray-600 font-medium align-middle">{guest.phone || <span className="text-gray-300">—</span>}</td>
                                            <td className="py-4 px-5 text-gray-600 font-medium align-middle">{guest.name.split('')[0]}: {guest.menu_type}
                                                {guest.plus_one && guest.plus_one_name ? `, ${guest.plus_one_name.split('')[0]}: ${guest.menu_type_plus_one || 'Standard'}` : ''}
                                            </td>
                                            <td className = "py-4 px-5 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();        
                                                        guestStatus(guest.id, guest.status);}}
                                                    className={`cursor-pointer inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shrink-0 transition-colors
                                                        ${guest.status === "Potvrđeno" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : ""}
                                                        ${guest.status === "Na čekanju" ? "bg-amber-50 text-amber-700 border border-amber-100" : ""}
                                                        ${guest.status === "Odbijeno" ? "bg-rose-50 text-rose-700 border border-rose-100" : ""}
                                                        hover:bg-opacity-80
                                                    `}
                                                >
                                                    {guest.status}
                                                </button>
                                            </td>
                                            <td className="py-4 px-5 text-center align-middle">
                                                <button 
                                                    className="text-red-300 hover:text-red-200 cursor-pointer font-medium transition-colors" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteGuest(guest.id);
                                                    }}
                                                >
                                                    Izbriši
                                                </button>
                                            </td>
                                            <td className="py-4 px-5 text-gray-600 align-middle pr-6">{guest.notes || <span className="text-gray-300">—</span>}</td>
                                        </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="w-full space-y-3 md:hidden">
                    {guestsData.length === 0 ? (
                        <div className="bg-white p-6 shadow-sm rounded-2xl flex flex-col items-center justify-center">
                            <p className="text-gray-500 font-medium">Trenutačno nemate dodanih gostiju.</p>
                            <button 
                                onClick={() => setShowAddPage(true)} 
                                className="mt-4 text-[#B8926A] font-semibold hover:underline cursor-pointer"
                            >
                            Dodaj prvog gosta
                            </button>
                        </div>
                    ) : filteredGuests.length === 0 ? (
                        <div className="bg-white p-8 text-center text-gray-400 font-medium border border-gray-100 rounded-2xl">
                            Nema pronađenih gostiju za upisani pojam.
                        </div>
                    ) : (
                        currentGuests.map((guest) => (
                            <div 
                            key={guest.id} 
                            className="bg-white p-4 border border-gray-100 rounded-2xl shadow-xs flex flex-col space-y-3"
                            onClick={() => setSelectGuestForEdit(guest)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-800 text-base truncate">{guest.name}</h3>
                                        {guest.plus_one && (
                                            <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                                                Pratnja: <span className="text-gray-700 font-semibold">{guest.plus_one_name || "—"}</span>
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            guestStatus(guest.id, guest.status);
                                        }}
                                        className={`cursor-pointer inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shrink-0 transition-colors
                                            ${guest.status === "Potvrđeno" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : ""}
                                            ${guest.status === "Na čekanju" ? "bg-amber-50 text-amber-700 border border-amber-100" : ""}
                                            ${guest.status === "Odbijeno" ? "bg-rose-50 text-rose-700 border border-rose-100" : ""}
                                            hover:bg-opacity-80
                                        `}
                                    >
                                        {guest.status}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                                    <span className="text-gray-400 font-medium">Dolazi s pratnjom?</span>
                                    <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-0.5 rounded-md font-semibold ${guest.plus_one ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                                        {guest.plus_one ? 'Da' : 'Ne'}
                                    </span>
                                    <button 
                                        className="text-red-500 hover:text-red-700 font-medium transition-colors" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteGuest(guest.id);
                                        }}
                                    >
                                        Izbriši
                                    </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                        onClick={() => setShowAddPage(true)}
                        className="lg:hidden fixed bottom-2 right-6 bg-[#B8926A] text-white p-4 rounded-full shadow-lg shadow-[#B8926A]/40 active:scale-95 transition-all duration-200 z-40 flex items-center justify-center cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-xs mt-4 pb-6">
                        <span className="text-sm text-gray-500 font-medium">
                            Stranica <span className="font-semibold text-gray-800">{currentPage}</span> od <span className="font-semibold text-gray-800">{totalPages}</span>
                        </span>
                        
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-2xs cursor-pointer active:scale-98"
                            >
                                Prethodna
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-2xs cursor-pointer active:scale-98"
                            >
                                Sljedeća
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showAddPage && (
                <AddGuest 
                    onClose={() => setShowAddPage(false)} 
                    onSave={handleSaveGuest} 
                />
            )}

            {selectGuestForEdit && (
                <EditGuest
                    guest={selectGuestForEdit}
                    onClose={() => setSelectGuestForEdit(null)} 
                    onSave={(data) => {
                        updateGuest(selectGuestForEdit.id, data);
                        setSelectGuestForEdit(null);
                        refetch();
                    }} 
                />
            )}
        </div>
    </div>
);
};

export default Guests;