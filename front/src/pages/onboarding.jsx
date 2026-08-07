import { Calendar, Dot, Heart, Locate, Star } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

const TAG_OPTIONS = [
    { key: "crkveno", label: "⛪ Crkveno vjenčanje" },
    { key: "otvoreno", label: "🌳 Vjenčanje na otvorenom" },
    { key: "glazba", label: "🎵 DJ/Glazba uživo" },
    { key: "foto", label: "📷 Fotograf i video" },
    { key: "gosti_izvan", label: "✈️ Gosti izvan grada" },
];

const Onboarding = () => {

    const [step, setStep] = useState(1);
    const [partnerOneName, setPartnerOneName] = useState("");
    const [partnerTwoName, setPartnerTwoName] = useState("");
    const [partnerOneEmail, setPartnerOneEmail] = useState("");
    const [partnerTwoEmail, setPartnerTwoEmail] = useState("");
    const [engagementDate, setEngagementDate] = useState("");
    const [weddingDate, setWeddingDate] = useState("");
    const [weddingLocation, setWeddingLocation] = useState("");
    const [missingFields, setMissingFields] = useState(false);
    const [taskStatus, setTaskStatus] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    const getInfo = async () => {
        try {
            const response = await fetch("/api/me", {
                method: "GET",
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPartnerOneEmail(data.user.email);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getOnboard = async () => {
        try {
            const response = await fetch("/api/me/onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    partner_one: partnerOneName,
                    partner_two: partnerTwoName,
                    email: partnerOneEmail,
                    partner_email: partnerTwoEmail,
                    engagement_date: engagementDate,
                    wedding_date: weddingDate,
                    wedding_location: weddingLocation,
                    onboarding_completed: true,
                    seed_tasks: taskStatus,
                    tags: selectedTags,
                }),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = "/dashboard";
            } else {
                const data = await response.json();
                alert(data.detail || "Došlo je do greške. Molim pokušajte ponovo.");
            }
        } catch (error) {
            alert("Došlo je do greške na poslužitelju. Molim pokušajte ponovo.");
        }
    };

    useEffect(() => {
        getInfo();
    }, []);

    return (
        <div
            className="fixed inset-0 bg-fixed bg-cover bg-center items-center justify-center flex flex-col p-8 overflow-y-auto"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920')" }}
        >
            <div className="bg-linear-to-r from-[#c39d76] to-[#8B6B47] p-8 rounded-t-2xl  shadow-xl w-full max-w-lg flex flex-col">
                <div className="flex p-4 bg-white/20 w-fit rounded-2xl items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                </div>
                { step === 1 && (
                    <div className="flex flex-col mt-6 gap-1">
                        <h1 className="text-2xl md:text-3xl text-white font-bold">Dobrodošli u Weddinger</h1>
                        <p className="text-sm md:text-[14px] text-white/80">Nekoliko pitanja prije samog početka.</p>
                        <div className="flex gap-2 mt-4">
                            <div className="w-8 h-2 bg-white transition-all duration-300 rounded-full"></div>
                            <div className="w-4 h-2 bg-white/50 transition-all duration-300 rounded-full"></div>
                            <div className="w-4 h-2 bg-white/50 transition-all duration-300 rounded-full"></div>
                        </div>
                    </div>
                )}
                { step === 2 && (
                    <div className="flex flex-col mt-6 gap-1">
                        <h1 className="text-2xl md:text-3xl text-white font-bold">Vaše vjenčanje</h1>
                        <p className="text-sm md:text-[14px] text-white/80">Ove informacije koristimo za odbrojavanje i rokove zadataka.</p>
                        <div className="flex gap-2 mt-4">
                            <div className="w-8 h-2 bg-white transition-all duration-300 rounded-full"></div>
                            <div className="w-8 h-2 bg-white transition-all duration-300 rounded-full"></div>
                            <div className="w-4 h-2 bg-white/50 transition-all duration-300 rounded-full"></div>
                        </div>
                    </div>
                )}
                { step === 3 && (
                    <div className="flex flex-col mt-6 gap-1">
                        <h1 className="text-2xl md:text-3xl text-white font-bold">Uskoro smo gotovi!</h1>
                        <p className="text-sm md:text-[14px] text-white/80">Pomažemo Vam da odmah krenete s planiranjem.</p>
                        <div className="flex gap-2 mt-4">
                            <div className="w-8 h-2 bg-white transition-all duration-300 rounded-full"></div>
                            <div className="w-8 h-2 bg-white transition-all duration-300 rounded-full"></div>
                            <div className="w-8 h-2 bg-white transition-all duration-300 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-white p-8 w-full max-w-lg rounded-b-2xl">
                { step === 1 && (
                <div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Ime partnera 1 *</label>
                            <input required value={partnerOneName} onChange={(e) => setPartnerOneName(e.target.value)} placeholder="Ana" className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" type="text" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Ime partnera 2 *</label>
                            <input required value={partnerTwoName} onChange={(e) => setPartnerTwoName(e.target.value)} placeholder="Marko" className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" type="text" />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <div className="flex-col gap-2 w-full hidden md:flex">
                            <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Registracijski email *</label>
                            <input readOnly disabled value={partnerOneEmail} onChange={(e) => setPartnerOneEmail(e.target.value)} placeholder="ana@example.com" className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-500 transition" type="email" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Dodatni email</label>
                            <input value={partnerTwoEmail} onChange={(e) => setPartnerTwoEmail(e.target.value)} placeholder="marko@example.com" className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" type="email" />
                        </div>
                    </div>
                    <div className={`flex ${missingFields ? 'justify-between items-center' : 'justify-end'} mt-10 md:mt-15`}>
                        {missingFields && (
                            <p className="text-[#a39d90] text-sm font-bold">* Molimo popunite sva obavezna polja</p>
                        )}
                        <button
                            type="button"
                            onClick={() =>
                                {(!partnerOneName || !partnerTwoName)
                                    ? setMissingFields(true)
                                    : (setStep(step + 1), setMissingFields(false))
                                }}
                            className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#8c7b6b] transition">
                        Nastavi</button>
                    </div>
                </div>
                )}
                { step === 2 && (
                    <div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex items-center">
                                    <Star className="w-3 h-3 text-[#a39d90] mr-1" />
                                    <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Datum zaruka *</label>
                                </div>
                                <input required value={engagementDate} onChange={(e) => setEngagementDate(e.target.value)} placeholder="28. svibnja 2027." className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" type="date" />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 text-[#a39d90] mr-1" />
                                    <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Datum vjenčanja</label>
                                </div>
                                 <input value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} placeholder="28. svibnja 2027." className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" type="date" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full mt-4">
                            <div className="flex items-center">
                                <Locate className="w-3 h-3 text-[#a39d90] mr-1" />
                                <label className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider block">Lokacija vjenčanja</label>
                            </div>
                            <input value={weddingLocation} onChange={(e) => setWeddingLocation(e.target.value)} placeholder="Unesite lokaciju vjenčanja" className="border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" type="text" />
                            {missingFields && (
                                <p className="text-[#a39d90] text-sm font-bold mt-4">* Molimo popunite sva obavezna polja</p>
                            )}
                        </div>
                        <div className="flex justify-between mt-6 md:mt-10">
                            <button onClick={() => setStep(step-1)} className="cursor-pointer text-gray-500 font-semibold ">
                                Natrag
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    {(!engagementDate)
                                        ? setMissingFields(true)
                                        : (setStep(step + 1), setMissingFields(false))
                                    }}
                                className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#8c7b6b] transition">
                            Nastavi</button>
                        </div>
                    </div>
                )}
                { step === 3 && (
                    <div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full bg-[#8B6B47]/10 p-4 rounded-2xl">
                                <div className="flex flex-col">
                                    <h2 className="text-sm font-semibold text-gray-800">Pripremimo Vam početni popis zadataka?</h2>
                                    <p className="text-xs text-[#8a8378] mt-0.5">Dodat ćemo zadatke s rokovima prema Vašem datumu vjenčanja</p>
                                </div>
                                <div className="inline-flex w-fit rounded-xl bg-white border border-[#e9e2d6] p-1 shadow-sm shrink-0">
                                    <button
                                        type="button"
                                        disabled={weddingDate === ""}
                                        onClick={() => setTaskStatus(true)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer active ${taskStatus === true ? 'bg-[#c39d76] text-white' : 'text-black'}`}
                                    >
                                        Da
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTaskStatus(false)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${taskStatus === false ? 'bg-[#c39d76] text-white' : 'text-black'}`}
                                    >
                                        Ne
                                    </button>
                                </div>
                            </div>
                            {!weddingDate.trim() && (
                                <p className="text-[12px] tracking-tight text-gray-500">Napomena: Nije moguće odabrati automatsko dodavanje zadataka ako niste postavili datum vjenčanja</p>
                            )}
                            {taskStatus && (
                            <><div className="flex flex-col gap-4">
                                <h3 className="text-xs font-semibold text-[#a39d90] uppercase tracking-wider mb-0 mt-2">Koje zadatke želite dodati?</h3>
                                <div className="flex flex-wrap gap-3">
                                    {TAG_OPTIONS.map((tag) => (
                                        <button
                                            key={tag.key}
                                            type="button"
                                            onClick={() => toggleTag(tag.key)}
                                            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                                selectedTags.includes(tag.key)
                                                    ? "bg-[#8B6B47] text-white"
                                                    : "bg-[#8B6B47]/10 text-[#8B6B47] hover:bg-[#8B6B47]/20"
                                            }`}
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col gap-2 bg-[#8B6B47]/10 p-4 rounded-2xl mt-4">
                                    <h4 className="text-xs font-semibold text-[#8B6B47] uppercase tracking-wider mb-2">Npr. dodat ćemo</h4>
                                    <div className="flex items-center gap-2">
                                        <Dot className="w-6 h-6 text-[#a39d90]" />
                                        <p className="text-sm text-gray-700 flex flex-col gap-1.5">Rezervacija lokacije</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Dot className="w-6 h-6 text-[#a39d90]" />
                                        <p className="text-sm text-gray-700 flex flex-col gap-1.5">Odabir fotografa</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Dot className="w-6 h-6 text-[#a39d90]" />
                                        <p className="text-sm text-gray-700 flex flex-col gap-1.5">Odabir glazbe</p>
                                    </div>
                                </div>
                            </div>
                            </>
                            )}
                        </div>
                        <div className="flex justify-between mt-10 md:mt-10">
                            <button onClick={() => setStep(step-1)} className="cursor-pointer text-gray-500 font-semibold ">
                                Natrag
                            </button>
                            <button
                                type="button"
                                onClick={() => getOnboard()}
                                className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#8c7b6b] transition"
                            >
                                Završi
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
