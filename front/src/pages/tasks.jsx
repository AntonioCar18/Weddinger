import { useState, useEffect, useRef } from "react";
import { Calendar, Circle, Star, Sparkles, Compass } from 'lucide-react';
import weddingerLogo from "../assets/logo.png";
import Sidebar from "../components/sidebar";
import ProgressBarTask from "../components/progressBarTask";
import AddTask from "../components/addTask";
import TaskTableItem from "../components/taskTableItem";
import { allSuggestions } from "../components/suggestions";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const SuggestionCard = ({ suggestion }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-all duration-300">
        <div className="text-3xl shrink-0">{suggestion.icon}</div>
        <div className="flex-1">
            <h4 className="font-bold text-white text-sm">{suggestion.title}</h4>
            <p className="text-white/70 text-xs mt-0.5 leading-tight">{suggestion.desc}</p>
        </div>
    </div>
);

const Tasks = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [partners, setPartners] = useState([]);
    const [tasksSummary, setTasksSummary] = useState({ completed_tasks: 0, incomplete_tasks: 0 });
    const [selectedCategory, setSelectedCategory] = useState("Sve");
    const [tables, setTables] = useState([]);
    const [activeSuggestions, setActiveSuggestions] = useState([]);
    const queryClient = useQueryClient();

    const { data: guestsData } = useQuery({
        queryKey: ['guests'],
        queryFn: async () => {
            const response = await fetch("/api/guests", { credentials: 'include' });
            if (!response.ok) throw new Error("Greška pri dohvatu gostiju");
            return response.json();
        },
        staleTime: 10000,
    });

    const { data: queryData } = useQuery({
        queryKey: ['budget'],
        queryFn: async () => {
            const response = await fetch("/api/budget", { method: "GET", credentials: 'include' });
            if (!response.ok) throw new Error("Server error");
            return response.json();
        },
        refetchInterval: 10000,
    });

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetch("/api/tasks", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Greška pri dohvatu zadataka");
            const result = await response.json();
            return result.data;
        },
        staleTime: 10000,
        placeholderData: (previousData) => previousData,
    });

    const tasks = tasksData || [];
    const budgetData = queryData?.data.length || 0;
    const totalGuests = (guestsData?.length || 0) + (guestsData?.filter(guest => guest.plus_one === true).length || 0);

    useEffect(() => {
        if (isLoading && tasks.length === 0) return;
        
        const dataForSuggestions = { tasks, guests: totalGuests, budget: budgetData, tables: tables.length || 0 };
        const available = allSuggestions.filter(s => s.condition(dataForSuggestions));
        const newSuggestions = available.slice(0, 1);

        setActiveSuggestions(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newSuggestions)) return prev;
            return newSuggestions;
        });
    }, [tasks, totalGuests, budgetData, tables, isLoading]);

    const getTasksSummary = async () => {
        try {
            const response = await fetch("/api/tasks/summary", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Greška prilikom dohvaćanja zadataka");
            const data = await response.json();
            setTasksSummary(data.data || []);
        } catch (error) { console.error(error); }
    };

    const getPartners = async () => {
        try {
            const response = await fetch("/api/me", { method: "GET", credentials: "include" });
            const data = await response.json();
            if (data.user) setPartners([data.user.partner_one, data.user.partner_two]);
        } catch (error) { console.error(error); }
    };

    const fetchTables = async () => {
        try {
            const response = await fetch("/api/tables", { method: "GET", credentials: "include" });
            setTables(await response.json());
        } catch (error) { console.error("Greška pri učitavanju podataka:", error); }
    };

    useEffect(() => {
        getPartners();
        getTasksSummary();
        fetchTables();
        const summaryInterval = setInterval(getTasksSummary, 10000);
        return () => clearInterval(summaryInterval);
    }, []);

    const newTask = async (taskData) => {
        const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(taskData) });
        if (response.ok) {
            setIsAddTaskOpen(false);
            getTasksSummary();
            queryClient.invalidateQueries(['tasks']);
        }
    };

    const deleteTask = async (task_id) => {
        await fetch(`/api/tasks/${task_id}`, { method: "DELETE", credentials: "include" });
        getTasksSummary();
        queryClient.invalidateQueries(['tasks']);
    };

    const changeTaskStatus = async (task_id, newStatus) => {
        await fetch(`/api/tasks/status/${task_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ is_completed: newStatus }) });
        getTasksSummary();
        queryClient.invalidateQueries(['tasks']);
    };

    const updateTask = async (task_id, updatedTaskData) => {
        await fetch(`/api/tasks/${task_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(updatedTaskData) });
        getTasksSummary();
        queryClient.invalidateQueries(['tasks']);
    };

    const filteredTasks = selectedCategory === "Sve" ? tasks : tasks.filter((task) => task.category === selectedCategory);

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
                <Sidebar activeTab="Zadaci" />
            </div>

            <div className="flex flex-1 h-screen overflow-y-auto bg-[#fcfbfa]">
                <div className="flex flex-col w-full h-full relative">
                    <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-4 flex-row items-center justify-between w-full border-b lg:border-none border-gray-100 bg-white lg:bg-transparent">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">Pregled zadataka</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 truncate mt-0.5">Nadzirajte i upravljajte svojim zadacima.</p>
                        </div>
                        <button className="hidden lg:block cursor-pointer bg-[#B8926A] text-white shadow-md shadow-[#B8926A]/20 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200" onClick={() => setIsAddTaskOpen(true)}>
                            Dodaj zadatak
                        </button>
                    </div>

                    <div className="px-4 md:px-10 lg:px-16 py-4 flex flex-col lg:flex-row gap-8 lg:gap-6 h-fit pb-6 pt-6">
                        <div className="flex flex-col rounded-2xl bg-white shadow lg:w-2/3 p-8">
                            <h2 className='font-bold text-[20px] lg:text-[26px] text-gray-800 mb-6'>Pregled obavljenih zadataka</h2>
                            <div className="flex flex-col gap-6 text-gray-400">
                                {tasks.length === 0 ? (
                                    <p>Trenutačno nemate zadataka prema kojima možete pratiti napredak.</p>
                                ) : (
                                    Array.isArray(tasksSummary) && tasksSummary.map((task) => (
                                        <ProgressBarTask key={task.category} category={task.category} done={task.completed_tasks} total={task.total_tasks} progress={((task.completed_tasks / task.total_tasks) * 100).toFixed(2)} />
                                    ))
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-[#B8926A] flex flex-col rounded-2xl shadow-lg lg:w-1/3 p-6 text-white h-full">
                            <div className="flex gap-3 items-center mb-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h2 className='font-bold text-lg'>Naše sugestije</h2>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                {tasksData ? (
                                    activeSuggestions.map((suggestion, index) => (
                                        <SuggestionCard key={index} suggestion={suggestion} />
                                    ))
                                ) : (
                                    // Možeš staviti neki "skeleton" ili ništa dok se učitava
                                    <div className="animate-pulse bg-white/10 h-20 rounded-2xl w-full"></div>
                                )}
                                
                                {tasksData && activeSuggestions.length === 0 && (
                                    <p className="text-white/70 text-sm italic">Trenutačno nema novih savjeta. Odlično napredujete!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-8 px-4 md:px-10 lg:px-16 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-2 md:ml-0">
                            <div>
                                <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Vaši zadaci</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setSelectedCategory("Sve")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${selectedCategory === "Sve" ? "bg-[#B8926A] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Sve</button>
                                {Array.isArray(tasksSummary) && tasksSummary.map((item) => (
                                    <button key={item.category} onClick={() => setSelectedCategory(item.category)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${selectedCategory === item.category ? "bg-[#B8926A] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{item.category}</button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4">
                            {tasks.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <Star className="w-12 h-12 text-[#B8926A] mb-4" />
                                    <p className="text-gray-500">Trenutačno nemate zadanih aktivnosti.</p>
                                    <button onClick={() => setIsAddTaskOpen(true)} className="mt-4 text-[#B8926A] font-bold hover:underline cursor-pointer">Dodajte prvi zadatak</button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {Array.isArray(filteredTasks) && filteredTasks.map((task) => (
                                        <div key={task.task_id} className="group transition-all hover:bg-gray-50/50 rounded-xl">
                                            <TaskTableItem task={task} deleteTask={deleteTask} changeTaskStatus={changeTaskStatus} updateTask={updateTask} partners={partners} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={() => setIsAddTaskOpen(true)} className="lg:hidden fixed bottom-8 right-6 bg-[#B8926A] text-white p-4 rounded-full shadow-lg shadow-[#B8926A]/40 active:scale-95 transition-all duration-200 z-40 flex items-center justify-center cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </button>
            {isAddTaskOpen && <AddTask onSave={newTask} onClose={() => setIsAddTaskOpen(false)} partners={partners} />}
        </div>
    );
};

export default Tasks;