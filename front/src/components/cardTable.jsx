import React from "react";
import { X, Users, Edit3 } from "lucide-react";

const TableCard = ({ table, onClick, guestsAtTable, totalCount, onDragOver, onDrop, onRemoveGuest }) => {
    // Vizualni status ovisno o popunjenosti
    const isFull = totalCount >= table.capacity;
    const progress = Math.min((totalCount / table.capacity) * 100, 100);

    return (
        <div
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`p-5 rounded-2xl w-full h-full bg-white border transition-all duration-300 flex flex-col shadow-sm hover:shadow-lg ${
                isFull ? "border-red-200" : "border-gray-100 hover:border-[#B8926A]/50"
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                        Stol {table.table_number}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium truncate max-w-37.5">
                        {table.table_notes || "Nema napomene"}
                    </p>
                </div>
                <button 
                    onClick={onClick}
                    className="cursor-pointer p-2 text-gray-300 hover:text-[#B8926A] hover:bg-[#B8926A]/10 rounded-lg transition-colors"
                >
                    <Edit3 size={16} />
                </button>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider">
                    <span>Popunjenost</span>
                    <span>{totalCount} / {table.capacity}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${isFull ? "bg-red-400" : "bg-[#B8926A]"}`}
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto min-h-12.5">
                {guestsAtTable.map(g => (
                    <div 
                        key={g.id} 
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("guestId", g.id);
                            e.currentTarget.classList.add("opacity-50");
                        }}
                        onDragEnd={(e) => e.currentTarget.classList.remove("opacity-50")}
                        className="group flex items-center justify-between bg-gray-50 hover:bg-white hover:border-[#B8926A]/20 border border-gray-100 p-2.5 rounded-xl transition-all cursor-grab active:cursor-grabbing"
                    >
                        <div className="truncate text-sm text-gray-700 font-semibold">
                            {g.name}
                            {g.plus_one && g.plus_one_name && (
                                <span className="block text-[10px] text-gray-400 font-normal mt-0.5">
                                    + {g.plus_one_name}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemoveGuest(g.id); }}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableCard;