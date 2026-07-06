const TableBudget = ({ Icon, category, title, amount, paid, status, notes, onEdit }) => {
    return (
        <div 
        onClick={onEdit}
        className="mb-4 border border-gray-100 rounded-xl p-8 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
            <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr] gap-4 items-center">
                <div className="flex items-center gap-4 ">
                    <div className="p-3 bg-gray-100 rounded-lg text-[#B8926A] w-fit">
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
                    <p className="font-medium text-green-600">{paid} €</p>
                </div>

                <div className="flex md:flex-col justify-between md:justify-center md:text-center items-center md:items-center gap-2 md:gap-1">
                    <p className="text-[11px] text-gray-400">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        status === 'Plaćeno' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {status}
                    </span>
                </div>
            </div>
            {notes && (
    <div className="mt-4 pt-3 border-t border-gray-50 italic line-clamp-2 md:line-clamp-1">
        <span className="font-bold text-gray-400 uppercase text-[10px] mr-2">
            Bilješka:
        </span>
        
        <span className="text-[12px] text-gray-600 font-sans leading-tight">
            {notes}
        </span>
    </div>
)}
        </div>
    );
}

export default TableBudget;