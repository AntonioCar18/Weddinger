import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import weddingerLogo from "../assets/logo.png";
import Sidebar from '../components/sidebar';
import { ChevronDown } from 'lucide-react';
import Announcements from '../components/Announcements';
import FAQComponents from '../components/FAQComponent';

const FAQ = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="h-dvh w-screen flex overflow-hidden bg-[#fcfbfa] relative">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col p-6 shadow-xl h-full border-r border-gray-100 z-40 lg:z-10 lg:static transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer flex items-center justify-between lg:justify-center"
                >
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
                <Sidebar activeTab="FAQ"/>
            </div>

            <div className="flex flex-1 h-dvh bg-[#fcfbfa] overflow-auto">
                <div className="flex flex-col w-full h-full relative pb-10">

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
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">Najčešće postavljena pitanja</h1>
                            <p className="hidden md:block text-sm lg:text-base text-gray-500 mt-0.5">
                                Sva pitanja koja imate potencijalno su već odgovorena, provjerite!
                            </p>
                        </div>
                    </div>
                    <div className="px-4 md:px-10 lg:px-16 flex flex-col lg:flex-row lg:gap-6 pt-4 md:pt-2 w-full">
                        <Announcements page="faq" className="flex-1" />
                    </div>
                    <div className="flex flex-col gap-6 px-4 md:px-10 lg:px-16 pt-2 pb-4 w-full  mx-auto lg:mx-0">
                        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col w-full gap-2">
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <h2 className='text-md text-gray-800 font-bold'>Kako "instalirati" aplikaciju na mobitel?</h2>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                />
                            </div>

                            {!isOpen && (
                                <p className="text-gray-500 text-sm">Radnja je zapravo vrlo jednostavna, ali ovisi o uređaju koji koristiš. Dodirni za detalje.</p>
                            )}

                            {isOpen && (
                                <>
                                    <p className="text-gray-500 text-sm">Radnja je zapravo vrlo jednostavna, ali ovisi o uređaju koji koristiš. U nastavku ti šaljemo nekoliko primjera pa odaberi tebi najprikladniji:</p>

                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                                            <h3 className="font-bold text-gray-800 mb-3">Android (Chrome)</h3>
                                            <ol className="space-y-2">
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">1</span>
                                                    <span>Otvori weddinger.com.hr u Chromeu.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">2</span>
                                                    <span>Dodirni izbornik s tri točkice (⋮) u gornjem desnom kutu.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">3</span>
                                                    <span>Odaberi "Instaliraj aplikaciju" ili "Dodaj na početni zaslon".</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">4</span>
                                                    <span>Potvrdi dodirom na "Instaliraj".</span>
                                                </li>
                                            </ol>
                                        </div>

                                        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                                            <h3 className="font-bold text-gray-800 mb-3">iPhone (Safari)</h3>
                                            <ol className="space-y-2">
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">1</span>
                                                    <span>Otvori weddinger.com.hr u Safariju.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">2</span>
                                                    <span>Dodirni ikonu dijeljenja (kvadrat sa strelicom prema gore) u donjem dijelu ekrana.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">3</span>
                                                    <span>Skrolaj i odaberi "Dodaj na početni zaslon".</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">4</span>
                                                    <span>Dodirni "Dodaj" u gornjem desnom kutu.</span>
                                                </li>
                                            </ol>
                                        </div>

                                        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                                            <h3 className="font-bold text-gray-800 mb-3">iPhone (Chrome)</h3>
                                            <ol className="space-y-2">
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">1</span>
                                                    <span>Otvori weddinger.com.hr u Chromeu.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">2</span>
                                                    <span>Dodirni ikonu dijeljenja (kvadrat sa strelicom prema gore) koja se nalazi desno od URL-a.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">3</span>
                                                    <span>Odaberi "Dodaj na početni zaslon".</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#B8926A]/10 text-[#8B6B47] font-bold text-xs flex items-center justify-center">4</span>
                                                    <span>Dodirni "Dodaj".</span>
                                                </li>
                                            </ol>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2">Nakon instalacije, ikona Weddingera pojavit će se na tvom početnom zaslonu i otvarat će se kao samostalna aplikacija, bez browser adresne trake.</p>
                                </>
                            )}
                        </div>
                        <FAQComponents
                            title = "Što se događa s mojim računom nakon vjenčanja?"
                            short_desc = "Kao što je navedeno u uvjetima korištenja aplikacije, tjedan dana nakon Vašeg vjenčanja profil će biti obrisan."
                            long_desc = "Kao što je navedeno u uvjetima korištenja aplikacije, tjedan dana nakon Vašeg vjenčanja, profil će biti obrisan. Kroz tih tjedan dana slat ćemo Vam obavijest o prestanku važenja profila te ćemo Vas pozvati da preuzmete podatke koje želite preuzeti."
                        />
                        <FAQComponents
                            title="Kako radi raspored sjedenja/plan stolova?"
                            short_desc="U 'Rasporedu sjedenja' možete kreirati stolove i raspoređivati goste povlačenjem s popisa na željeni stol."
                            long_desc="U 'Rasporedu sjedenja' dodajete stolove, određujete broj mjesta po stolu te raspoređujete goste iz popisa nesmještenih uzvanika. Svaki stol prikazuje popunjenost i popis dodijeljenih gostiju, a raspored možete mijenjati u bilo kojem trenutku. Na mobitelu je dostupan i pregled u obliku kartica radi lakšeg korištenja."
                        />
                        <FAQComponents
                            title="Kako dodati i potvrditi goste?"
                            short_desc="Gosta dodajete putem stranice 'Gosti', a potvrdu dolaska označavate ručno kada Vam gost javi odgovor."
                            long_desc="Na stranici 'Gosti' dodajete novog gosta unosom osnovnih podataka (ime, kontakt i sl.). Kada gost potvrdi dolazak, tu informaciju označavate u aplikaciji, a nadzorna ploča automatski prikazuje omjer potvrđenih i ukupno pozvanih gostiju."
                        />
                        <FAQComponents
                            title="Koje sve dokumente mogu pohraniti i kako?"
                            short_desc="U 'Dokumentima' možete pohraniti ugovore, ponude i račune vezane uz organizaciju vjenčanja."
                            long_desc="Stranica 'Dokumenti' služi kao mjesto za pohranu svih važnih datoteka vezanih uz vjenčanje – ugovora s dobavljačima, ponuda, računa i slično. Datoteku dodajete jednostavnim uploadom, a u svakom trenutku je možete pregledati ili obrisati."
                        />
                        <FAQComponents
                            title="Kako pratiti budžet vjenčanja?"
                            short_desc="U 'Budžetu' unosite troškove i planirane iznose, a aplikacija automatski prati postotak iskorištenog budžeta."
                            long_desc="Na stranici 'Budžet' dodajete stavke troška s planiranim iznosom i iznosom koji je stvarno plaćen. Na temelju tih podataka aplikacija automatski izračunava postotak iskorištenog budžeta koji je vidljiv i na nadzornoj ploči, tako da uvijek imate pregled koliko ste potrošili u odnosu na plan."
                        />
                        <FAQComponents
                            title="Kako funkcioniraju zadaci?"
                            short_desc="Svaki zadatak ima kategoriju, prioritet, rok i osobu zaduženu za njega, a označava se kao gotov kad je izvršen."
                            long_desc="Prilikom dodavanja zadatka birate kategoriju (npr. Prostor, Ugostiteljstvo, Glazba), prioritet (Nizak, Srednji, Visok), rok dospijeća i osobu zaduženu za izvršenje. Na nadzornoj ploči vidite pregled nadolazećih zadataka, a na stranici 'Zadaci' ih možete označiti kao gotove ili urediti u bilo kojem trenutku."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FAQ;
