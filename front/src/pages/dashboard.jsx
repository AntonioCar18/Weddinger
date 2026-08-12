import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import weddingerLogo from "../assets/logo.png";
import { Calendar, Dot, Heart, User2Icon, CheckCircle, FileText, Banknote, PlusCircle, User, UserPlus, FileCheck, BadgeEuro, Star } from "lucide-react";
import DashboardComponents from "../components/dashboardComponents";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TaskDashboard from "../components/tasksDashboard";
import DashboardQuickAction from "../components/dashboardQuickAction";
import AddGuest from "../components/addGuest";
import AddTask from "../components/addTask";
import { useQueryClient } from "@tanstack/react-query";
import AddItem from "../components/addItem";
import { useRef } from "react";
import PricingNotification from "../components/pricingNotification";
import Announcements from "../components/Announcements";

const Dashboard = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [weddingInfo, setWeddingInfo] = useState(null);
  const [guestsInfo, setGuestsInfo] = useState(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getWeddingInfo = async () => {
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setWeddingInfo({
          partner_one: data.user.partner_one,
          partner_two: data.user.partner_two,
          wedding_date: data.user.wedding_date,
          engagement_date: data.user.engagement_date,
          wedding_location: data.user.wedding_location,
        });
      } else {
        console.error("Greška prilikom dohvaćanja imena partnera.");
      }
    } catch (error) {
      console.error("Greška prilikom dohvaćanja podataka:", error);
    }
  };

  const getPartners = async () => {
        try {
            const response = await fetch("/api/me", { method: "GET", credentials: "include" });
            const data = await response.json();
            if (data.user) setPartners([data.user.partner_one, data.user.partner_two]);
        } catch (error) { console.error(error); }
    };

  const getGuests = async () => {
    try {
      const response = await fetch("/api/guests/numbers", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setGuestsInfo({
          total_guests: data.total_guests,
          confirmed_guests: data.confirmed_guests,
        });
      } else {
        console.error("Greška prilikom dohvaćanja broja gostiju.");
      }
    } catch (error) {
      console.error("Greška prilikom dohvaćanja broja gostiju:", error);
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

  const used_budget = queryData?.total_paid_so_far || 0;
  const total_budget = queryData?.total_budget_plan || 0;
  const budget_percentage = total_budget > 0 ? Math.round((used_budget / total_budget) * 100) : 0;

  const { data: tasksSummary = { data: [], total_tasks: 0, total_completed_tasks: 0, total_incomplete_tasks: 0 } } = useQuery({
        queryKey: ['tasksSummary'],
        queryFn: async () => {
            const response = await fetch("/api/tasks/summary", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Greška prilikom dohvaćanja ukupnog pregleda zadataka");
            return response.json();
        },
        staleTime: 3000,
        refetchInterval: 3000,
    });

  const completedTasks = tasksSummary?.total_completed_tasks || 0;
  const totalTasks = tasksSummary?.total_tasks || 0;

  const { data: documentResponse } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const response = await fetch("/api/documents", {credentials: "include"});
            if (!response.ok) {throw new Error("Greška prilikom dohvaćanja dokumenata");}
            return response.json();
        },
        staleTime: 3000, // Podaci su "svježi" 3 sekundi - neće ih ponovo tražiti dokle god su svježi
        refetchInterval: 10000, // Zadržavamo tvoj interval od 10s u pozadini
    });

    const total_documents = documentResponse?.total_documents ?? 0;
   const { data: tasksData = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetch("/api/tasks", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Greška pri dohvatu zadataka");
            const result = await response.json();
            return result.data;
        },
        staleTime: 3000,
        refetchInterval: 3000,
    });

  const upcomingTasks = tasksData.filter(task => task.is_completed !== true);

  useEffect(() => {
    getWeddingInfo();
    getGuests();
    getPartners();
  }, []);

  const daysUntilWedding = weddingInfo?.wedding_date
    ? Math.max(0, Math.ceil((new Date(weddingInfo.wedding_date) - new Date()) / (1000 * 3600 * 24)))
    : null;

  const remainingPercentage = weddingInfo?.engagement_date && weddingInfo?.wedding_date
    ? Math.min(100, Math.max(0, Math.round(((new Date() - new Date(weddingInfo.engagement_date)) / (new Date(weddingInfo.wedding_date) - new Date(weddingInfo.engagement_date))) * 100)))
    : null;

  function formatWeddingDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("hr-HR", { day: "numeric", month: "long", year: "numeric" });
  }

  function formatTaskDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("hr-HR", { day: "numeric", month: "short"});
  }

  const addGuest = async (guestData) => {
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
                setShowAddGuestModal(false);
                getGuests();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Došlo je do greške prilikom dodavanja gosta.");
            }
        } catch (error) {
            console.error("Greška pri slanju:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

  const addTask = async (taskData) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskData),
                credentials: 'include'
            });
            if (response.ok) {
                setShowAddTaskModal(false);
                queryClient.invalidateQueries(['tasks']);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Došlo je do greške prilikom dodavanja zadatka.");
            }
        } catch (error) {
            console.error("Greška pri slanju:", error);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

  const newItem = async (itemData) => {
        try {
            const response = await fetch("/api/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData),
                credentials: 'include'
            });
            if (response.ok) {
                setShowAddItemModal(false);
                queryClient.invalidateQueries(['budget']);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Greška pri dodavanju.");
            }
        } catch (e) {
            console.error("Greška:", e);
            alert("Problem s povezivanjem na poslužitelj.");
        }
    };

  const uploadFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        console.log("0dabrana datoteka:", file.name, file.size, file.type);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (response.ok) {
                console.log("Datoteka uspješno uplodana")
                queryClient.invalidateQueries(['documents']); // Osvježava podatke o dokumentima nakon uploada
            } else {
                console.error("Grešak prilikom uploada")
            }
        } catch (error) {
            console.error("Greška prilikom uploada:", error);
        }
    };

  const advices = [
    "Planirajte unaprijed kako biste izbjegli stres.",
    "Komunicirajte otvoreno sa svojim partnerom o svim odlukama.",
    "Ne zaboravite na male detalje koji čine dan posebnim.",
    "Uživajte u svakom trenutku planiranja, to je dio vaše priče.",
    "Postavite realan budžet i držite ga se.",
    "Ne bojte se tražiti pomoć od prijatelja i obitelji.",
    "Pazite na svoje zdravlje i dobrobit tijekom planiranja.",
    "Odaberite dobavljače koji razumiju vašu viziju.",
    "Ne zaboravite na fotografije, one će trajati vječno.",
    "Uživajte u procesu i slavite svaki korak prema vašem velikom danu.",
    "Zapamtite, u pitanju je Vaše vjenčanje i planirajte ga tako da Vi budete sretni."
  ]

  return (
    <div className="h-dvh w-screen flex overflow-hidden bg-[#fcfbfa] relative">
      <PricingNotification />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col p-6 shadow-xl h-full border-r border-gray-100 z-40 lg:z-10 lg:static transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
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

        <Sidebar activeTab="Nadzorna ploča" />
      </div>

      <div className="flex flex-1 h-dvh bg-[#fcfbfa] overflow-auto">
        <div className="flex flex-col w-full h-fit relative pb-4">
          <div className="flex px-4 md:px-10 lg:px-16 pt-6 lg:pt-12 pb-6 items-center justify-between w-full lg:border-none border-gray-100 bg-white lg:bg-transparent">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-col text-gray-800 flex-1 min-w-0 lg:mr-4">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">Nadzorna ploča</h1>
              <p className="hidden md:block text-sm lg:text-base text-gray-500 mt-0.5">
                Pregled Vašeg vjenčanja na jednom mjestu
              </p>
            </div>
          </div>
          <div className="px-4 md:px-10 lg:px-16 flex flex-col lg:flex-row lg:gap-6 pt-4 md:pt-2 w-full">
            <Announcements page="dashboard" className="flex-1" />
          </div>
          <div className="px-4 md:px-10 lg:px-16 flex flex-col lg:flex-row gap-8 lg:gap-6 h-fit pb-6 pt-4">
            <div className="relative w-full min-h-60 md:min-h-65 h-auto md:h-72 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                  backgroundPosition: "center 30%",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(35,24,14,.78) 10%, rgba(60,42,24,.42) 48%, rgba(35,24,14,.15) 78%)",
                }}
              />

              <div className="relative h-full flex flex-col justify-between gap-3 p-6 md:p-10">
                <div className="flex gap-2 items-center min-w-0">
                  <Heart className="w-4 h-4 text-white fill-current animate-pulse shrink-0" />
                  <span className="text-[10px] md:text-sm font-semibold text-white/80 uppercase tracking-wider md:tracking-[0.2em]">Vaš veliki dan</span>
                  <span><Dot className="w-6 h-6 text-white/80 shrink-0" /></span>
                  <span className="text-[10px] md:text-sm font-semibold text-white/80 uppercase tracking-wider md:tracking-[0.2em] truncate">
                    {weddingInfo ? ` ${weddingInfo.partner_one} & ${weddingInfo.partner_two}` : ""}
                  </span>
                  {weddingInfo?.wedding_location && (
                  <div className="flex items-center gap-2">
                     <span><Dot className="hidden md:block w-6 h-6 text-white/80 shrink-0" /></span>
                     <span className="hidden md:block text-[10px] md:text-sm font-semibold text-white/80 uppercase tracking-[0.12em] md:tracking-[0.2em] truncate">{weddingInfo ? `${weddingInfo.wedding_location}` : ""}</span>
                  </div>
                  )}
                </div>

                <h2 className="font-display font-bold italic text-xl sm:text-2xl md:text-3xl text-white leading-snug drop-shadow-sm line-clamp-2">
                  Vaša priča o ljubavi počinje ovdje, uživajte u planiranju.
                </h2>

                <div className="flex flex-col gap-2">
                  <span className="font-display font-bold italic text-white/80 text-xs sm:text-sm md:text-base">
                    Do vjenčanja još
                  </span>
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div className="flex items-end gap-1.5 sm:gap-2 shrink-0">
                      <span className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-none">
                        {daysUntilWedding ?? "NaN"}
                      </span>
                      <span className="text-white/80 font-bold text-sm sm:text-base md:text-lg">dana</span>
                    </div>
                    <div className="glass-pill rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-3 flex items-center gap-2 md:gap-3 text-white bg-white/10 backdrop-blur-sm min-w-0">
                      <Calendar className="w-4 h-4 md:w-6 md:h-6 text-white/80 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="block text-[10px] md:text-[14px] text-white/70 tracking-wide leading-none mb-1">
                          Datum
                        </span>
                        <span className="font-display font-semibold text-xs md:text-sm leading-none truncate">
                          {weddingInfo ? formatWeddingDate(weddingInfo.wedding_date) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex px-4 md:px-10 lg:px-16 pb-6 items-center justify-between w-full lg:bg-transparent">
            <div className="flex flex-col bg-white p-8 w-full rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-[#efe9e0]">
              <div className="flex justify-between items-center mb-4">
                <p className="font-display font-semibold italic text-sm md:text-base text-gray-700">Vaš put do oltara</p>
                <div className="text-xs font-semibold text-[#8B6B47] bg-[#B8926A]/10 px-2.5 py-1 rounded-full">{remainingPercentage ?? 0}% prijeđeno</div>
              </div>
              <div className="relative w-full border-t border-dashed border-[#b38e56] my-6">
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#8B6B47]"
                  style={{ left: "0%" }}
                />
                <Heart
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 fill-[#8B6B47] text-[#8B6B47] drop-shadow-sm"
                  style={{ left: `${remainingPercentage ?? 0}%` }}
                />
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#8B6B47]"
                  style={{ left: "100%" }}
                />
              </div>
              <div className="flex justify-between text-[11px] md:text-[13px] text-gray-400 mt-3">
                <p>💍 Zaruke</p>
                <p>⏳ Pripreme u tijeku</p>
                <p>🎉 Vjenčanje</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 px-4 md:px-10 lg:px-16 pb-4 items-center justify-between lg:bg-transparent">
            <DashboardComponents
              desc="Potvrđeni gosti"
              icon={User2Icon}
              value={guestsInfo?.confirmed_guests ?? 0}
              total={guestsInfo?.total_guests ?? 0}
            />
            <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-[#efe9e0] transition-shadow duration-200">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                    <Banknote className="w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-2xl font-extrabold text-gray-800">{budget_percentage}%</span>
                </div>
                <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600 truncate">Iskorištenog budžeta</p>
                </div>
            </div>
            <DashboardComponents
              desc="Zadataka gotovo"
              icon={CheckCircle}
              value={completedTasks}
              total={totalTasks}
            />
            <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-[#efe9e0] transition-shadow duration-200">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                    <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-2xl font-extrabold text-gray-800">{total_documents}</span>
                </div>
                <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600 truncate">Pohranjenih dokumenata</p>
                </div>
            </div>
          </div>
          <div className="flex px-4 flex-col md:flex-row gap-4 md:px-10 lg:px-16 pb-0 pt-4 items-stretch justify-between w-full lg:bg-transparent">
            <div className="flex flex-col w-full md:w-3/4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#efe9e0] p-6 ">
                <div className="flex justify-between w-full items-center">
                    <h2 className="text-lg md:text-2xl font-bold">Nadolazeći zadaci</h2>
                    <div className="flex items-center gap-2">
                      <a href="/tasks" className="text-sm font-bold text-[#B8926A]">Svi zadaci</a>
                      <p className="hidden md:block text-sm font-bold text-[#B8926A]">→</p>
                    </div>
                </div>
                <div className="flex-1 items-stretch flex flex-col w-full divide-y divide-gray-50 mt-4 ">
                    {upcomingTasks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center w-full py-16 bg-white rounded-2xl border border-gray-100">
                            <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 flex items-center justify-center mb-4">
                                <CheckCircle className="w-7 h-7 text-[#B8926A]" />
                            </div>
                            <p className="text-sm text-gray-500">Nema nadolazećih zadataka</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col w-full divide-y divide-gray-50">
                                {upcomingTasks?.slice(0,4).map((task, index) => (
                                    <TaskDashboard
                                        key={index}
                                        taskName={task.task_name}
                                        category={task.category}
                                        date={formatTaskDate(task.due_date)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col md:w-1/4 gap-8 md:gap-4 w-full">
              <div className="mt-4 md:mt-0 flex flex-col w-full bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#efe9e0] p-6">
                <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Brze akcije</h2>
                <div className="grid grid-cols-2 gap-3">
                    <DashboardQuickAction
                      icon={UserPlus}
                      label="Dodaj gosta"
                      onClick={() => setShowAddGuestModal(true)}
                    />
                    <DashboardQuickAction
                      icon={FileCheck}
                      label="Dodaj zadatak"
                      onClick={() => setShowAddTaskModal(true)}
                    />
                    <DashboardQuickAction
                      icon={PlusCircle}
                      label="Dodaj dokument"
                      onClick={() => fileInputRef.current.click()}
                    />
                    <DashboardQuickAction
                      icon={BadgeEuro}
                      label="Dodaj trošak"
                      onClick={() => setShowAddItemModal(true)}
                    />
                </div>
              </div>
              <div className="flex md:flex-1 w-full bg-linear-to-r from-[#c39d76] to-[#8B6B47] rounded-2xl shadow-sm hover:shadow-md border border-[#efe9e0] p-6">
                <div className="flex flex-col w-full h-full items-center justify-center text-center">
                    <div className="flex items-center justify-start w-full gap-2">
                      <Star className="w-6 h-6 fill-white text-white" />
                      <h2 className="font-display text-lg font-bold text-white">Dnevni savjeti</h2>
                    </div>
                    <p className="text-sm italic text-left text-white font-bold mt-4">{advices[Math.floor(Math.random() * advices.length)]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={uploadFile}
      />
      {showAddGuestModal && <AddGuest onSave={addGuest} onClose={() => setShowAddGuestModal(false)} />}
      {showAddTaskModal && <AddTask onSave={addTask} onClose={() => setShowAddTaskModal(false)} partners={partners} />}
      {showAddItemModal && <AddItem onSave={newItem} onClose={() => setShowAddItemModal(false)} />}
    </div>
  );
};

export default Dashboard;
