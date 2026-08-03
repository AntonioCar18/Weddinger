import { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from "../components/sidebar";
import weddingerLogo from "../assets/logo.png";
import AddItem from "../components/addItem";
import BudgetGraph from "../components/budgetGraph";
import TipsTricksBudget from "../components/tipsTricksBudget";
import TableBudget from "../components/tableBudget";
import getItemCategory from "../components/iconSwitcher";
import EditItem from "../components/editItem";
import ExportPDFBudget from "../components/exportPDFBudget";
import { Banknote, DeleteIcon, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Budget = () => {
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [addItem, setAddItem] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editItem, setEditItem] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("Svi")
    const [statusFilter, setStatusFilter] = useState("Svi")
    const navigate = useNavigate();

    const newItem = async (itemData) => {
        try {
            const response = await fetch("/api/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData),
                credentials: 'include'
            });
            if (response.ok) {
                setAddItem(false);
                queryClient.invalidateQueries(['budget']);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Greška pri dodavanju.");
            }
        } catch (e) {
            console.error("Greška:", e);
            alert("Problem s povezivanjem na poslužitelja.");
        }
    };

    const { data: queryData } = useQuery({
        queryKey: ['budget'],
        queryFn: async () => {
            const response = await fetch("/api/budget", {
                method: "GET",
                credentials: 'include'
            });
            if (!response.ok) throw new Error("Server error");
            return response.json();
        },
        refetchInterval: 10000
    });

    const updateItem = async (updatedData) => {
        try {
            const response = await fetch(`/api/budget/${editItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
                credentials: 'include'
            });
            if (response.ok) {
                setEditItem(null);
                queryClient.invalidateQueries(['budget']);
            }
        } catch (e) {
            console.error("Greška pri ažuriranju:", e);
        }
    };

    const items = queryData || { data: [], total_paid_so_far: 0, total_budget_plan: 0 };
    const budgetList = items.data || [];

    const filteredItems = budgetList.filter(item => {
        const matchCategoy = categoryFilter === "Svi" || item.item_category === categoryFilter;
        const matchStatus = statusFilter === "Svi" || item.item_status === statusFilter;
        return matchCategoy && matchStatus;
    });

    const getVisibleItems = () => {
    // Logika: ako ima bilješki, stane ih manje (npr. 4), ako nema, stane više (npr. 7)
    const hasNotes = filteredItems.some(item => item.item_notes && item.item_notes.trim() !== "");
    return hasNotes ? 5 : 7;
};

    const itemsPerPage = getVisibleItems(); // Dinamički određujemo broj

    const indexLastItem = currentPage * itemsPerPage;
    const indexFirstItem = indexLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexFirstItem, indexLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

    const used_budget = items.total_paid_so_far || 0;
    const total_budget = items.total_budget_plan || 0;

    const itemCategories = budgetList.map(item => item.item_category);
    const uniqueCategories = ["Svi", ...new Set(itemCategories)]

    const deleteItem = async (budget_id) => {
    try {
        const response = await fetch(`/api/budget/${budget_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            queryClient.invalidateQueries(['budget']);
            setEditItem(false);
        } else {
            console.error("Server je vratio grešku:", response.statusText);
            alert("Došlo je do greške prilikom brisanja.");
        }
        } catch (error) {
            console.error("Greška pri brisanju:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

    const statusOrder = {
        "Na čekanju": "Kapara",
        "Kapara": "Plaćeno",
        "Plaćeno": "Na čekanju",
    };

    const cycleStatus = async (item) => {
        const newStatus = statusOrder[item.item_status] || "Na čekanju";

        try {
            const response = await fetch(`/api/budget/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    item_title: item.item_title,
                    item_category: item.item_category,
                    item_amount: item.item_amount,
                    item_status: newStatus,
                    deposit_amount: item.item_deposit || 0, // nikad se ne mijenja ovdje - kapara ostaje zapamćena u pozadini
                    item_notes: item.item_notes,
                }),
                credentials: 'include'
            });
            if (response.ok) {
                queryClient.invalidateQueries(['budget']);
            } else {
                alert("Greška prilikom promjene statusa.");
            }
        } catch (error) {
            console.error("Greška:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

    const handleCycleStatus = (item) => {
        const newStatus = statusOrder[item.item_status] || "Na čekanju";
        // Prozor za unos kapare otvara se SAMO ako stavka nikad nije imala zapamćen iznos kapare.
        // Ako je iznos već negdje u krugu unesen (item_deposit > 0), preskačemo prozor i primijenimo
        // status direktno - korisnik ne mora ponovno upisivati isti iznos.
        if (newStatus === "Kapara" && (!item.item_deposit || item.item_deposit <= 0)) {
            setEditItem({ ...item, forceKaparaModal: true });
        } else {
            cycleStatus(item);
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
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <Sidebar activeTab="Budžet"/>
            </div>

            <div className="flex flex-1 h-dvh bg-[#fcfbfa] overflow-auto">
                <div className="flex flex-col w-full h-full relative pb-10">
                    <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">Budžet</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 mt-0.5">Pratite troškove svojeg vjenčanja na jednom mjestu</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="bg-linear-to-r from-[#c39d76] to-[#8B6B47] cursor-pointer text-white px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 shadow-md shadow-[#B8926A]/20 transition-all duration-200 whitespace-nowrap"
                                onClick={() => ExportPDFBudget(currentItems)}
                            >
                                Izvezi u PDF
                            </button>
                            <button
                                className="hidden lg:block cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200 whitespace-nowrap"
                                onClick={() => setAddItem(true)}
                            >
                                Dodaj trošak
                            </button>
                            {addItem && <AddItem onSave={newItem} onClose={() => setAddItem(false)} />}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row flex-1 px-6 md:px-10 lg:px-16 py-4 gap-8 pb-4 lg:pb-8 items-stretch">
                        <div className="flex flex-col w-full lg:w-1/3 gap-8">
                            <BudgetGraph budget={total_budget} used={used_budget}/>
                            <TipsTricksBudget />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col shadow rounded-xl bg-white h-full">
                                <div className="p-8 lg:pl-8 lg:pt-4 lg:pb-4 lg:pr-8 flex flex-col lg:flex-row lg:items-start justify-between">
                                    <h2 className="text-left lg:pt-4 lg:text-center font-bold text-2xl">Pregled troškova</h2>
                                    <div className="flex gap-2 pt-6 lg:pt-3">
                                        <div className="relative w-full">
                                            <svg className="absolute left-3 top-6 transform -translate-y-1/2 w-8 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => {setCategoryFilter(e.target.value); setCurrentPage(1);}}
                                                className="w-full h-12 lg:h-12 bg-white border border-gray-200 rounded-xl pl-11 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                                            >
                                                {uniqueCategories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category === "Svi" ? "Sve kategorije" : category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="relative w-full">
                                            <svg className="absolute left-3 top-6 transform -translate-y-1/2 w-8 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1)}}
                                                className="w-full h-12 lg:h-12 bg-white border border-gray-200 rounded-xl pl-11 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                                            >
                                                <option value="Svi">Svi statusi</option>
                                                <option value="Na čekanju">Na čekanju</option>
                                                <option value="Kapara">Kapara</option>
                                                <option value="Plaćeno">Plaćeno</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="pl-8 pr-8 pb-0 pt-0 flex-1">
                                        {budgetList.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                            <Banknote className="w-12 h-12 text-[#B8926A] mb-4" />
                                            <p className="text-gray-500 font-medium">Trenutno nema unesenih troškova.</p>
                                            <button
                                                onClick={() => setAddItem(true)}
                                                className="mt-4 text-[#B8926A] font-semibold hover:underline cursor-pointer"
                                            >
                                                Dodaj prvi trošak
                                            </button>
                                        </div>
                                        ): filteredItems.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                                <p className="text-gray-500 font-medium">Nema troškova koji odgovaraju odabranim kriterijima.</p>
                                            </div>
                                        ) : (
                                            currentItems.map((item) => (
                                            <TableBudget
                                                key={item.id}
                                                Icon={getItemCategory(item.item_category)}
                                                category={item.item_category}
                                                title={item.item_title}
                                                amount={item.item_amount}
                                                paid={
                                                    item.item_status === "Plaćeno"
                                                        ? item.item_amount
                                                        : item.item_status === "Kapara"
                                                        ? item.item_deposit
                                                        : 0
                                                }
                                                status={item.item_status}
                                                notes={item.item_notes}
                                                onEdit={() => setEditItem(item)}
                                                onCycleStatus={() => handleCycleStatus(item)}
                                            />
                                        ))
                                        )}
                                </div>
                                <div className="flex justify-between pr-8 items-center pt-4 pb-8">
                                    <span className="text-sm text-gray-500 font-medium pl-8">
                                        Stranica <span className="font-semibold text-gray-800">{currentPage}</span> od <span className="font-semibold text-gray-800">{totalPages}</span>
                                    </span>
                                    <div className="justify-end flex gap-2 lg:gap-4">
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
                            </div>
                        </div>
                    </div>
                </div>
                {editItem && (
                    <EditItem
                        item={editItem}
                        onSave={updateItem}
                        onClose={() => setEditItem(null)}
                        onDelete={deleteItem}
                        defaultPaid={editItem.forceKaparaModal}
                    />
                )}

            </div>
            <button
                onClick={() => setAddItem(true)}
                className="lg:hidden fixed bottom-8 right-6 bg-[#B8926A] text-white p-4 rounded-full shadow-lg shadow-[#B8926A]/40 active:scale-95 transition-all duration-200 z-40 flex items-center justify-center cursor-pointer"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
}

export default Budget;
