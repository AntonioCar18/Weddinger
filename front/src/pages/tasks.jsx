import { useState } from "react";
import { useEffect } from "react";
import Sidebar from "../components/sidebar";
import weddingerLogo from "../assets/logo.png";
import { Calendar, Circle } from 'lucide-react';
import ProgressBarTask from "../components/progressBarTask";
import AddTask from "../components/addTask";
import TaskTableItem from "../components/taskTableItem";
import EditTask from "../components/editTask";

const Tasks = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [partners, setPartners] = useState([]);
    const [tasksSummary, setTasksSummary] = useState({ completed_tasks: 0, incomplete_tasks: 0 });
    const [selectedCategory, setSelectedCategory] = useState("Sve");

    const newTask = async (taskData) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error("Greška prilikom dodavanja zadatka");
            }
            const data = await response.json();
            console.log(tasks.message);
            setIsAddTaskOpen(false);
            getTasks();
            getTasksSummary();
        }
        catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom dodavanja zadatka.");
        }
    };

    const getPartners = async () => {
        try {
            const response = await fetch("/api/me", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Greška prilikom dohvaćanja partnera");
            }

            const data = await response.json();
            if (data.user) {
            setPartners([data.user.partner_one, data.user.partner_two]);
            }
        } catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom dohvaćanja partnera.");
            return [];
        }
    };

    const getTasks = async () => {
        try {
            const response = await fetch("/api/tasks", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Greška prilikom dohvaćanja zadataka");
            }

            const result = await response.json();
            setTasks(result.data);

        } catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom dohvaćanja zadataka.");
        }
    }

    const getTasksSummary = async () => {
        try {
            const response = await fetch("/api/tasks/summary", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Greška prilikom dohvaćanja zadataka");
            }

            const data = await response.json();
            setTasksSummary(data.data || []);

        } catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom dohvaćanja zadataka.");
        }
    }

    const deleteTask = async (task_id) => {
        try {
            const response = await fetch(`/api/tasks/${task_id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Greška prilikom brisanja zadatka");
            }

            getTasks();
            getTasksSummary();
        } catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom brisanja zadatka.");
        }
    }

    const changeTaskStatus = async (task_id, newStatus) => {
        try {
            const reponse = await fetch(`/api/tasks/status/${task_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ is_completed: newStatus }),
            });
            if (!reponse.ok) {
                throw new Error("Greška prilikom promjene statusa zadatka");
            }
            getTasks();
            getTasksSummary();
        } catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom promjene statusa zadatka.");
        }
    }

    const updateTask = async (task_id, updatedTaskData) => {
        try {
            const response = await fetch(`/api/tasks/${task_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                throw new Error("Greška prilikom ažuriranja zadatka");
            }

            getTasks();
            getTasksSummary();
        } catch (error) {
            console.error(error);
            alert("Došlo je do greške prilikom ažuriranja zadatka.");
        }
    };

    useEffect(() => {
        getPartners();
        getTasks();
        getTasksSummary();
        const interval = setInterval(getTasks, 10000);
        const summaryInterval = setInterval(getTasksSummary, 10000);
        return () => {
            clearInterval(interval);
            clearInterval(summaryInterval);
        };
    }, []);

    const completedTasks = tasks?.completed_tasks || 0;
    const incompleteTasks = tasks?.incomplete_tasks || 0;
    const totalTasks = tasks?.total_tasks || 0;

    const filteredTasks = selectedCategory === "Sve"
     ? tasks
     : tasks.filter((task) => task.category === selectedCategory);

    return (
        <div className="h-dvh w-screen flex overflow-hidden bg-[#fcfbfa] relative">
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
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <Sidebar activeTab="Zadaci"/>
                </div>
                {/* Main content area */}
                <div className="flex flex-1 h-screen overflow-y-auto bg-[#fcfbfa]">
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
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">Pregled zadataka</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 truncate mt-0.5">Nadzirajte i upravljajte svojim zadacima i projektima.</p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button 
                                className="hidden lg:block cursor-pointer bg-[#B8926A] text-white shadow-md shadow-[#B8926A]/20 px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-[#a07b5c] active:scale-98 transition-all duration-200 whitespace-nowrap"
                                onClick={() => setIsAddTaskOpen(true)}
                            >
                                <span className="inline cursor-pointer lg:hidden">+ </span>Dodaj zadatak
                            </button>
                            {isAddTaskOpen && <AddTask onSave={newTask} onClose={() => setIsAddTaskOpen(false)} partners={partners} />}
                        </div>
                    </div>
                    <div className="px-4 md:px-10 lg:px-16 py-4 flex flex-col lg:flex-row gap-6 h-fit pb-24 lg:pb-6">
                        <div className="flex flex-col rounded-2xl bg-white shadow lg:w-2/3 p-8">
                            <div className="flex flex-col lg:flex-row gap-2 justify-between itemst-center">
                                <div className="flex flex-col items-left">                            
                                    <h2 className='font-bold text-[20px] lg:text-[26px] text-gray-800'>Pregled obavljenih zadataka</h2>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Calendar className="w-5 h-5 text-gray-500" /> 
                                    <p className="text-gray-500 text-[14px] lg:text-[16px]">01.01.2024 - 31.12.2024</p>
                                    {/* Ovdje treba ubaciti prave datume tj. od trenutka kreiranja accounta do mjesec dana nakon svadbe */}
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 items-center justify-center mb-15 mt-10 text-gray-400 text-[14px] lg:text-[18px] lg:pl-4 lg:pr-4">
                                {tasks.length === 0 ? (
                                    <div className="flex flex-col items-center">
                                        <p className="text-center">Trenutačno nemate dodatnih zadataka.</p>
                                        <button 
                                                className="mt-2 text-[#B8926A] font-semibold hover:underline cursor-pointer"
                                                onClick={() => setIsAddTaskOpen(true)}
                                            >
                                                Dodaj prvi zadatak
                                            </button>
                                            {isAddTaskOpen && <AddTask onSave={newTask} onClose={() => setIsAddTaskOpen(false)} partners={partners} />}
                                    </div>
                                ) : (
                                    Array.isArray(tasksSummary) && tasksSummary.map((task) => (
                                        <div key={task.category} className="w-full">
                                            <ProgressBarTask
                                                category={task.category}
                                                done={task.completed_tasks}
                                                total={task.total_tasks}
                                                progress={((task.completed_tasks / task.total_tasks) * 100).toFixed(2)}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex border-t-2 border-gray-200">
                                <div className="flex justify-start mt-6 gap-4">
                                    <div className="flex items-center gap-4">
                                        <Circle className="w-3 h-3" fill="#B8926A" stroke="#B8926A" />
                                        <p className="text-gray-600 text-[13px] lg:text-[16px]">Obavljeni zadaci</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Circle className="w-3 h-3" fill="#E2E8F0" stroke="#E2E8F0" />
                                        <p className="text-gray-600 text-[13px] lg:text-[16px]">Neobavljeni zadaci</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                            <div className="flex flex-col rounded-2xl bg-white shadow lg:w-1/3 p-6 h-full">
                                <p className="text-gray-600 text-[12px] lg:text-[16px]">AI savjeti ovisno o situaciji</p>
                            </div>
                        </div>
                    <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-10 lg:px-16 py-4 h-fit pb-24 lg:pb-6">
                        <div className="flex w-full shadow py-4 bg-white rounded-2xl px-6 flex-col gap-5 pt-8 pl-8">
                            <h2 className='font-bold text-[26px] lg:text-[26px] text-gray-800'>Svi zadaci</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-8 gap-4 items-center">
                                <button
                                    onClick={() => setSelectedCategory("Sve")}
                                    className="px-4 py-2 cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                                >
                                    Sve
                                </button>
                                {Array.isArray(tasksSummary) && tasksSummary.map((task) => (
                                    <button 
                                        key={task.category}
                                        onClick={() => setSelectedCategory(task.category)}
                                        className="px-4 py-2 cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                                    >
                                        {task.category}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-4 mt-4 mb-4">

                                {Array.isArray(filteredTasks) && filteredTasks.slice(0, 5).map((task) => (
                                    <TaskTableItem 
                                    key={task.task_id} 
                                    task={task} 
                                    deleteTask={deleteTask} 
                                    changeTaskStatus={changeTaskStatus}
                                    updateTask={updateTask}
                                    partners={partners}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <button
                onClick={() => setIsAddTaskOpen(true)}
                className="lg:hidden fixed bottom-8 right-6 bg-[#B8926A] text-white p-4 rounded-full shadow-lg shadow-[#B8926A]/40 active:scale-95 transition-all duration-200 z-40 flex items-center justify-center cursor-pointer"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
};

export default Tasks;