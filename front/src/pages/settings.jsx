import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import weddingerLogo from "../assets/logo.png";
import { HeartIcon, Mail, Lock, Trash, KeyRound, Calendar, Map, Gem} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import ConfirmationModalDelete from "../components/confirmationModalDelete";

const Settings = () => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [partnerNames, setPartnerNames] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSuccessEmail, setShowSuccessEmail] = useState(false);
    const [partnerEmails, setPartnerEmails] = useState({});
    const [emailTrue, setEmailTrue] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showSuccessPassword, setShowSuccessPassword] = useState(false);
    const [engagementDate, setEngagementDate] = useState({});
    const [date, setDate] = useState({});
    const [location, setLocation] = useState({});

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
    const emails = userData ? { partner_one: userData.email, partner_two: userData.partner_email } : { partner_one: "", partner_two: "" };
    const weddingDate = userData ? { wedding_date: userData.wedding_date } : { wedding_date: "" };
    const engagementDateDate = userData ? { engagement_date: userData.engagement_date } : { engagement_date: "" };

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

    const updateEngagementDate = async (engagementDate) => {
        setIsSaving(true);
        setShowSuccess(false);
        try {
            const response = await fetch("/api/me/engagement-date", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(engagementDate),
            });
            if (response.ok) {
                queryClient.invalidateQueries(['user-profile']); // Refresh the engagement date after successful update
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Greška prilikom ažuriranja datuma zaruka:", error);
            setIsSaving(false);
        }
    };

    const updateDate = async (date) => {
        setIsSaving(true);
        setShowSuccess(false);
        try {
            const response = await fetch("/api/me/date", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(date),
            });
            if (response.ok) {
                queryClient.invalidateQueries(['user-profile']); // Refresh the date after successful update
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Greška prilikom ažuriranja datuma:", error);
            setIsSaving(false);
        }
    };

    const updateLocation = async (location) => {
        setIsSaving(true);
        setShowSuccess(false);
        try {
            const response = await fetch ("/api/me/location", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(location),
            });
            if (response.ok) {
                queryClient.invalidateQueries(['user-profile']); // Refresh the location after successful update
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Greška prilikom ažuriranja lokacije:", error);
            setIsSaving(false);
        }
    };

    const updateEmails = async (emails) => {
        setIsSaving(true);
        setShowSuccessEmail(false);

        if (!emails.partner_one && !emails.partner_two) {
            alert("Morate unijeti barem jedan email.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch("/api/me/email", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(emails),
            });
            if (response.ok) {
                queryClient.invalidateQueries(['user-profile']); // Refresh the emails after successful update
                setShowSuccessEmail(true);
            }
        } catch (error) {
            console.error("Greška prilikom ažuriranja partnera:", error);
            setIsSaving(false);
        }
    };  

    const deleteAccount = async () => {
        try {
            const response = await fetch("/api/me", {
                method: "DELETE",
                credentials: "include",
            });
        } catch (error) {
            console.error("Greška prilikom brisanja računa:", error);
        }
    };

    const updatePassword = async (currentPassword, newPassword, confirmNewPassword) => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert("Molim popunite sva polja.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert("Nova lozinka i potvrda lozinke se ne podudaraju.");
            return;
        }

        try {
            const response = await fetch("/api/me/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });

            if (response.ok) {
                alert("Lozinka je uspješno promijenjena!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setShowSuccessPassword(true);
            } else {
                const data = await response.json();
                alert(data.detail || "Promjena lozinke nije uspjela, molim pokušajte ponovo.");
            }
        } catch (error) {
            console.error("Greška prilikom promjene lozinke:", error);
            alert("Došlo je do greške na poslužitelju. Molim pokušajte ponovo.");
        }
    };

    useEffect(() => {
        if (userData) {
            setPartnerNames({ partner_one: userData.partner_one, partner_two: userData.partner_two });
        }
    }, [userData]);

    useEffect(() => {
        if (userData) {
            setDate({ wedding_date: userData.wedding_date });
        }
    }, [userData]);
    
    useEffect(() => {
        if (userData) {
            setEngagementDate({ engagement_date: userData.engagement_date });
        }
    }, [userData]);

    useEffect(() => {
        if(userData) {
            setLocation({ wedding_location: userData.wedding_location });
        }
    }, [userData]);

    useEffect(() => {
        if (userData) {
            setPartnerEmails({ partner_one: userData.email, partner_two: userData.partner_email });
        }
    }, [userData]);

    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 2000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    useEffect(() => {
        if (!showSuccessEmail) return;
        const timer = setTimeout(() => setShowSuccessEmail(false), 2000);
        return () => clearTimeout(timer);
    }, [showSuccessEmail]);

    return (
        <div className="h-screen flex overflow-hidden bg-[#fcfbfa] relative">
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
                                    <p className="text-[12px] md:text-sm text-gray-500">Informacije o mladencima i vjenčanju</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 items-start mt-8 gap-10">
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
                                <div className="flex items-center gap-4 w-full ">
                                    <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 text-[#8B6B47] flex items-center justify-center font-semibold text-xl shrink-0">
                                        <Gem className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Datum zaruka</p>
                                        <input
                                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                            type="date"
                                            value={engagementDate?.engagement_date || ""}
                                            onChange={(e) => setEngagementDate({ engagement_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full ">
                                    <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 text-[#8B6B47] flex items-center justify-center font-semibold text-xl shrink-0">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Datum vjenčanja</p>
                                        <input
                                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                            type="date"
                                            value={date?.wedding_date || ""}
                                            onChange={(e) => setDate({ wedding_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-14 h-14 rounded-full bg-[#B8926A]/10 text-[#8B6B47] flex items-center justify-center font-semibold text-xl shrink-0">
                                        <Map className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lokacija vjenčanja</p>
                                        <input
                                            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                            type="text"
                                            value={location?.wedding_location || ""}
                                            onChange={(e) => setLocation({ wedding_location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={`flex flex-col md:flex-row justify-between mt-8 pt-6 border-t border-gray-100 ${showSuccess ? 'gap-2' : ''}`}>
                                <p className="text-sm text-gray-500">
                                    {showSuccess && <span className="text-sm text-[#8B6B47] font-semibold">Promjene su uspješno spremljene!</span>}
                                </p>
                                <button
                                    onClick={() => {updateNames(partnerNames); updateDate(date); updateLocation(location); updateEngagementDate(engagementDate);}}
                                    className="cursor-pointer bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 disabled:opacity-60 w-full md:w-auto"
                                >
                                    Spremi promjene
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col bg-white rounded-2xl border border-[#efe9e0] shadow-sm hover:shadow-md transition-shadow duration-200 w-full p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#B8926A]/10 rounded-xl p-2.5">
                                    <Mail className="w-6 h-6 text-[#8B6B47]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-semibold text-gray-800">Adresa E-pošte</h2>
                                    <p className="text-[12px] md:text-sm text-gray-500">Koriste se za prijavu i obavijesti</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start gap-4 mt-8">
                                <div className="flex flex-col gap-1.5 flex-1 w-full">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        Registracijska adresa e-pošte
                                        {!emailTrue && <Lock className="w-3 h-3 text-gray-300" />}
                                    </p>
                                    <input
                                        disabled={!emailTrue}
                                        value={partnerEmails.partner_one || ""}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] ${
                                            !emailTrue ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 text-gray-800"
                                        }`}
                                        onChange={(e) => setPartnerEmails({ ...partnerEmails, partner_one: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 w-full">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dodatna adresa e-pošte</p>
                                    <input
                                        value={partnerEmails.partner_two || ""}
                                        className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                        onChange={(e) => setPartnerEmails({ ...partnerEmails, partner_two: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2.5 mt-6 text-sm text-gray-500 cursor-pointer w-fit select-none">
                                <input
                                    type="checkbox"
                                    checked={emailTrue}
                                    className="w-4 h-4 accent-[#B8926A] rounded focus:ring-2 focus:ring-[#B8926A]/40"
                                    onChange={(e) => setEmailTrue(e.target.checked)}
                                />
                                Želiš li promijeniti svoju registracijsku adresu e-pošte?
                            </label>

                            <div className={`flex flex-col md:flex-row justify-between mt-8 pt-6 border-t border-gray-100 ${showSuccess ? 'gap-2' : ''}`}>
                                <p className="text-sm text-gray-500 mb-0">
                                    {showSuccessEmail && <span className="text-[#8B6B47] font-semibold">Promjene su uspješno spremljene!</span>}
                                </p>
                                <button
                                    onClick={() => updateEmails(partnerEmails)}
                                    className="cursor-pointer bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 disabled:opacity-60 w-full md:w-auto"
                                >
                                    Spremi promjene
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col bg-white rounded-2xl border border-[#efe9e0] shadow-sm hover:shadow-md transition-shadow duration-200 w-full p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#B8926A]/10 rounded-xl p-2.5">
                                        <KeyRound className="w-6 h-6 text-[#8B6B47]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-semibold text-gray-800">Promjena lozinke</h2>
                                    <p className="text-[12px] md:text-sm text-gray-500">Promijenite svoju lozinku za prijavu.</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 w-full md:w-auto mt-8">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trenutačna lozinka</p>
                                <input
                                    className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 flex-col md:flex-row mt-4">
                                <div className="flex flex-col gap-1.5 flex-1 w-full md:w-auto mt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nova lozinka</p>
                                    <input
                                        className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 w-full md:w-auto mt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ponovite novu lozinku</p>
                                    <input
                                        className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B8926A]/25 focus:border-[#B8926A] transition-all"
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={`flex flex-col md:flex-row justify-between mt-8 pt-6 border-t border-gray-100 ${showSuccessPassword ? 'gap-2' : ''}`}>
                                <p className="text-sm text-gray-500 mb-0">
                                    {showSuccessPassword && <span className="text-[#8B6B47] font-semibold">Promjene su uspješno spremljene!</span>}
                                </p>
                                <button
                                    onClick={() => updatePassword(currentPassword, newPassword, confirmNewPassword)}
                                    className="cursor-pointer bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 disabled:opacity-60 w-full md:w-auto"
                                >
                                    Spremi promjene
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col items-start md:items-center justify-between md:flex-row bg-white rounded-2xl border border-[#efe9e0] shadow-sm hover:shadow-md transition-shadow duration-200 w-full p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#B8926A]/10 rounded-xl p-2.5">
                                        <Trash className="w-6 h-6 text-[#8B6B47]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-semibold text-gray-800">Brisanje računa</h2>
                                    <p className="text-[12px] md:text-sm text-gray-500">Ova akcija je nepovratna i trajno će izbrisati sve podatke.</p>
                                </div>
                            </div>
                            <div className="flex w-full md:w-auto mt-4 md:mt-0 md:mb-2">
                                <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="mt-4 cursor-pointer bg-linear-to-br from-red-300 to-red-500 text-white px-10 py-3 rounded-xl text-sm font-semibold shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 disabled:opacity-60 w-full md:w-auto"
                                >
                                    Obriši račun
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModalDelete
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    deleteAccount();
                    setIsDeleteModalOpen(false);
                    navigate("/login");
                }}
            />
        </div>
    );
};

export default Settings;