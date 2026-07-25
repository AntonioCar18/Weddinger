import { BadgeCheck, Phone, Star, MapPin } from "lucide-react";

const PartnersBlockPresentation = ({ icon_partners: Icon, title, desc, location, category, social, phone }) => {
    return (
        <div className="bg-white shadow rounded-2xl overflow-hidden space-between flex flex-col">
            <div className="relative w-full aspect-4/3 bg-[#B8926A1A] overflow-hidden">
                <div className="lg:flex hidden absolute top-3 left-3 items-center gap-2 bg-white rounded-2xl p-2 px-3 shadow-sm">
                    <Icon className="w-4 h-4 text-[#B8926A] shrink-0" />
                    <h2 className="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">
                        {category}
                    </h2>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-[#B8926A]" />
                </div>
            </div>

            <div className="p-5 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                    <h2 className="font-extrabold text-[16px] text-gray-900 truncate line-clamp-1">{title}</h2>
                        <BadgeCheck className="w-4 h-4 text-[#B8926A] shrink-0" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{location}</span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mt-1 line-clamp-3 min-h-[3lh]">
                    {desc}
                </p>
            </div>

            <div className="gap-2 p-5 bg-white flex flex-col lg:flex-row items-center justify-between border-t border-gray-100">
                <button className="cursor-pointer flex items-center gap-2 justify-center lg:justify-start rounded-2xl border border-gray-200 w-full lg:w-fit py-3 px-3 lg:py-3 text-sm text-gray-700 font-semibold"
                    onClick={() => window.location.href = `tel:${phone}`}
                >
                    <Phone className="w-6 h-6 text-gray-700 shrink-0" />
                </button>
                <div className="bg-[#B8926A] w-full justify-center flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-3 text-sm text-gray-700 font-semibold">
                    <button className="cursor-pointer w-full text-center text-sm font-semibold text-white transition-colors">
                        <a href={social || "#"}>Posjetite stranicu</a>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartnersBlockPresentation;