import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import weddingerLogo from "../assets/logo.png";
import GuestBlock from "../components/guest_block";
import Sidebar from "../components/sidebar";
import AddTable from "../components/addTable";
import WeddingMap from "../components/mapTables";
import EditTable from "../components/EditTable";
import ExportTablesToPDF from "../components/exportPDFTables";
import { Armchair, Table, Table2 } from "lucide-react";

const SittingSchedule = () => {
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [guestSeat, setGuestSeat] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [addTable, setAddTable] = useState(false);
    const [tables, setTables] = useState([]);
    const [selectedGuestForModal, setSelectedGuestForModal] = useState(null);
    const [draggedGuestId, setDraggedGuestId] = useState(null);
    const [isEditTableOpen, setIsEditTableOpen] = useState(false);
    const [tableToEdit, setTableToEdit] = useState(null);
    const navigate = useNavigate();

    // Dohvaćanje gostiju putem React Queryja
    const { data: guestsFromQuery } = useQuery({
        queryKey: ['guests'],
        queryFn: async () => {
            const response = await fetch("/api/guests", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Greška pri učitavanju");
            return response.json();
        },
        refetchInterval: 10000 
    });

    // Sinkronizacija podataka iz queryja u lokalni state
    useEffect(() => {
        if (guestsFromQuery) {
            setGuestSeat(guestsFromQuery);
        }
    }, [guestsFromQuery]);

    const fetchTables = async () => {
        try {
            const response = await fetch("/api/tables", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Greška pri učitavanju stolova");
            const tables_data = await response.json();
            setTables(tables_data);
        } catch (error) {
            console.error("Greška pri učitavanju podataka:", error);
        }
    };

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSaveTable = async (tableData) => {
        try {   
            const response = await fetch("/api/tables", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tableData),
                credentials: "include"
            });
            if (response.ok) {
                setAddTable(false);
                fetchTables();
            }
        } catch (error) {
            console.error("Greška pri slanju:", error);
        }
    };

    const moveGuestToTable = async (guestId, tableId) => {
        try {
            const response = await fetch(`/api/guests/${guestId}/move`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ table_id: tableId })
            });
            if(!response.ok) throw new Error("Greška prilikom premještaja");
            
            // Osvježi podatke nakon uspješne akcije
            queryClient.invalidateQueries(['guests']);
        } catch(error) {
            console.error("Pogreška:", error);
            throw error;
        }
    };

    const handleSelectTable = async (tableId) => {
        try {
            await moveGuestToTable(selectedGuestForModal.id, tableId);
            setSelectedGuestForModal(null);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDragStart = (e, guest) => {
        setDraggedGuestId(guest.id);
        e.dataTransfer.setData("guestId", guest.id);
        setTimeout(() => e.currentTarget.classList.add("opacity-50"), 0);
    };

    const handleDragEnd = (e) => {
        setDraggedGuestId(null);
        e.currentTarget.classList.remove("opacity-50");
    };

    const handleDropGuest = async (e, tableId) => {
        e.preventDefault();
        const guestId = Number(e.dataTransfer.getData("guestId"));
        if (!guestId) return;

        const previousGuest = guestSeat.find(g => g.id === guestId);
        const previousTableId = previousGuest?.table_id ?? null;

        setGuestSeat(prev => prev.map(g => g.id === guestId ? { ...g, table_id: tableId } : g));

        try {
            await moveGuestToTable(guestId, tableId);
        } catch (error) {
            setGuestSeat(prev => prev.map(g => g.id === guestId ? { ...g, table_id: previousTableId } : g));
        }
    };

    const handleRemoveGuest = async (guestId) => {
        try {
            await moveGuestToTable(guestId, null);
            setGuestSeat(prev => prev.map(g => g.id === guestId ? { ...g, table_id: null } : g));
        } catch (error) {
            alert("Nije moguće ukloniti gosta: " + error.message);
        }
    };

    const updateTable = async (table_id, updatedData) => {
        try {
            const response = await fetch(`/api/tables/${table_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    capacity: parseInt(updatedData.capacity),
                    notes: updatedData.table_notes
                }),
                credentials: 'include'
            });
            if (response.ok) fetchTables();
        } catch (error) {
            console.error("Greška pri ažuriranju:", error);
        }
    };

    const deleteTable = async (table_id) => {
    try {
        const response = await fetch(`/api/tables/${table_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }, 
            credentials: 'include'
        });

        if (response.ok) {
            fetchTables();
            setIsEditTableOpen(false);
        } else {
            console.error("Server je vratio grešku:", response.statusText);
            alert("Došlo je do greške prilikom brisanja.");
        }
    } catch (error) {
        console.error("Greška pri brisanju:", error);
        alert("Problem s povezivanjem na poslužitelj.");
    }
};

    return (
        <div className="h-dvh w-screen flex overflow-hidden bg-[#fcfbfa] relative">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col p-6 shadow-xl h-full border-r border-gray-100 z-40 lg:z-10 lg:static transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div onClick={() => navigate("/dashboard")} className="cursor-pointer flex items-center justify-between lg:justify-center">
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
                <Sidebar activeTab="Raspored sjedenja" />
            </div>

            <div className="flex flex-1 h-screen overflow-hidden bg-[#fcfbfa]">
                <div className="flex flex-col w-full h-full relative">
                    <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 flex-row items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">Raspored po stolovima</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 truncate mt-0.5">Organizirajte raspored sjedenja gostiju i upravljajte salom.</p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button 
                                className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200 whitespace-nowrap"
                                onClick={() => ExportTablesToPDF(guestSeat, tables)}
                            >
                                Izvezi u PDF
                            </button>
                            <button 
                                className="hidden lg:block cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200 whitespace-nowrap"
                                onClick={() => setAddTable(true)}
                            >
                                <span className="inline cursor-pointer lg:hidden">+ </span>Dodaj stol
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden px-4 md:px-10 lg:px-16 py-4 flex flex-col lg:flex-row gap-6 items-stretch h-full pb-24 lg:pb-6">
                        <div className="flex-1 bg-transparent overflow-y-auto border-2 border-dashed border-gray-200/60 rounded-2xl hidden lg:block">
                            {tables.length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center text-center pt-80">
                                    <Armchair className="w-12 h-12 text-[#B8926A] mb-4" />
                                    <p className="text-gray-500">Trenutačno nemate dodanih stolova.</p>
                                    <button onClick={() => setAddTable(true)} className="mt-4 text-[#B8926A] font-bold hover:underline cursor-pointer">Dodajte prvi stol</button>
                                </div>
                            )}
                            <WeddingMap
                                tables={tables}
                                allGuests={guestSeat}
                                onDrop={handleDropGuest}
                                onRemoveGuest={handleRemoveGuest}
                                onEditTable={(table) => {
                                    const occupancyCount = guestSeat
                                        .filter(g => g.table_id === table.id)
                                        .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
                                    
                                    setTableToEdit({ ...table, currentOccupancy: occupancyCount });
                                    setIsEditTableOpen(true);
                                }}
                            />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs w-full lg:w-80 shrink-0 flex flex-col h-full min-h-0"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                const guestId = Number(e.dataTransfer.getData("guestId"));
                                if(guestId){
                                    handleRemoveGuest(guestId);
                                }
                            }}
                        >
                            <div className="flex items-baseline space-x-2 shrink-0">
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Nesmješteni uzvanici</h3>
                                <span className="text-xs font-bold text-gray-400">
                                    (
                                    {guestSeat
                                        .filter(g => !g.table_id)
                                        .reduce(
                                            (total, g) => total + 1 + (g.plus_one ? 1 : 0),
                                            0
                                        )}
                                    )
                                </span>
                            </div>
                            <div className="mt-4 shrink-0">
                                <input
                                    type="text"
                                    placeholder="Pretraži po imenu ili partneru.."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-hidden focus:border-[#B8926A] focus:bg-white transition-all duration-200"
                                />
                            </div>
                            <div className="mt-4 space-y-2 flex-1 overflow-y-auto pr-1">
                                {guestSeat
                                    .filter(g => !g.table_id)
                                    .filter(g =>
                                        `${g.name} ${g.plus_one_name} || ""`
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                    )
                                    .map((g) => (
                                    <div key={g.id}>
                                        <div 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e,g)}
                                        onDragEnd={handleDragEnd}
                                        className="hidden lg:flex items-center justify-between bg-gray-50 hover:bg-gray-100/70 border border-gray-100 rounded-xl p-3 text-sm font-semibold text-gray-700 cursor-grab active:cursor-grabbing select-none group"
                                        ><div>
                                                <span className="block text-gray-800 font-bold">{g.name}</span>
                                                {g.plus_one && g.plus_one_name && <span className="block text-[12px] text-gray-800 font-normal mt-0.5">+{g.plus_one_name}</span>}
                                            </div>
                                        </div>
                                        <div onClick={() => setSelectedGuestForModal(g)} className="flex lg:hidden items-center justify-between bg-gray-50 hover:bg-gray-100/70 border border-gray-100 rounded-xl p-3 text-sm font-semibold text-gray-700 cursor-pointer active:scale-[0.99] select-none group">
                                            <div>
                                                <span className="block text-gray-800 font-bold">{g.name}</span>
                                                {g.plus_one && g.plus_one_name && <span className="block text-[11px] text-gray-400 font-normal mt-0.5">+{g.plus_one_name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setAddTable(true)}
                        className="lg:hidden fixed bottom-8 right-6 bg-linear-to-r from-[#c39d76] to-[#8B6B47]  text-white p-4 rounded-full shadow-lg shadow-[#B8926A]/40 active:scale-95 transition-all duration-200 z-40 flex items-center justify-center cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {addTable && (
                <AddTable onClose={() => setAddTable(false)} onSave={handleSaveTable} />
            )}

            {selectedGuestForModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => setSelectedGuestForModal(null)} />
                    
                    <div className="relative bg-white w-full sm:max-w-md rounded-3xl shadow-2xl p-6 z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="mb-6 text-center sm:text-left">
                            <h2 className="text-2xl font-extrabold text-gray-900">Rasporedi gosta</h2>
                            <p className="text-gray-500 mt-1">
                                Gost: <span className="font-bold text-[#B8926A]">{selectedGuestForModal.name}</span>
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                            {tables.map((table) => {
                                const guestsAtTable = guestSeat.filter(g => g.table_id === table.id);
                                // Računamo ukupan broj mjesta (plus one = +1)
                                const occupancy = guestsAtTable.reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
                                const isFull = occupancy >= table.capacity;

                                return (
                                    <div key={table.id} className="group border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:border-[#B8926A]/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">Stol {table.table_number}</p>
                                                <p className="text-xs text-gray-400 font-medium">{table.table_notes || "Bez napomene"}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleSelectTable(table.id)}
                                                disabled={isFull}
                                                className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                                                    isFull 
                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                                        : "bg-[#B8926A] text-white hover:bg-[#a07b5c] shadow-lg shadow-[#B8926A]/20"
                                                }`}
                                            >
                                                {isFull ? "Popunjeno" : "Odaberi"}
                                            </button>
                                        </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="bg-[#B8926A] h-full transition-all duration-500" 
                                                style={{ width: `${Math.min((occupancy / table.capacity) * 100, 100)}%` }} 
                                            />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1.5 font-bold">
                                            {occupancy} / {table.capacity} mjesta popunjeno
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => setSelectedGuestForModal(null)}
                            className="mt-6 w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors"
                        >
                            Odustani
                        </button>
                    </div>
                </div>
            )}

            {isEditTableOpen && tableToEdit && (
            <EditTable 
                key={tableToEdit.id}
                initialData={tableToEdit} 
                onClose={() => setIsEditTableOpen(false)} 
                onSave={(data) => {
                    updateTable(tableToEdit.id, data);
                    setIsEditTableOpen(false);
                }}
                onDelete={deleteTable}
                occupancy={tableToEdit.currentOccupancy}
            />
        )}
        </div>
    );
};

export default SittingSchedule;