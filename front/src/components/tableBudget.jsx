import { Check } from "lucide-react";

const statusStyles = {
    "Plaćeno": "bg-[#e4f3ea] text-[#3b7a5a]",
    "Kapara": "bg-[#fbead2] text-[#b8752f]",
    "Na čekanju": "bg-[#f5f1ea] text-[#8a8378]",
};

const TableBudget = ({ Icon, category, title, amount, paid, status, notes, onEdit, onCycleStatus }) => {
    return (
        <div
            onClick={onEdit}
            className="mb-4 border border-[#efe9e0] rounded-2xl p-8 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
            <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr] gap-4 items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#B8926A]/10 rounded-xl text-[#8B6B47] w-fit">
                        <Icon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] text-gray-400 uppercase font-bold tracking-wider">{category}</span>
                        <h3 className="font-semibold text-gray-800">{title}</h3>
                    </div>
                </div>

                <div className="flex md:flex-col justify-between md:justify-start md:text-left gap-2 md:gap-0">
                    <p className="text-[11px] text-gray-400">Vrijednost</p>
                    <p className="font-bold text-gray-800">{amount} €</p>
                </div>

                <div className="flex md:flex-col justify-between md:justify-start md:text-left gap-2 md:gap-0">
                    <p className="text-[11px] text-gray-400">Uplaćeno</p>
                    <p className="font-medium text-[#3b7a5a]">{paid} €</p>
                </div>

                <div className="flex md:flex-col justify-between md:justify-center md:text-center items-center md:items-center gap-2 md:gap-1">
                    <p className="text-[11px] text-gray-400">Status</p>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onCycleStatus(); }}
                        title="Klikni za promjenu statusa"
                        className={`cursor-pointer px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-opacity hover:opacity-80 ${statusStyles[status] || statusStyles["Na čekanju"]}`}
                    >
                        {status}
                    </button>
                </div>
            </div>
            {notes && (
                <div className="mt-4 pt-3 border-t border-gray-50 italic line-clamp-2 md:line-clamp-1">
                    <span className="font-bold text-gray-400 uppercase text-[10px] mr-2">Bilješka:</span>
                    <span className="text-[12px] text-gray-600 font-sans leading-tight">{notes}</span>
                </div>
            )}
        </div>
    );
}

export default TableBudget;