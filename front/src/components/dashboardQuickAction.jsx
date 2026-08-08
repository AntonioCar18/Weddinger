const DashboardQuickAction = ({ icon: Icon, label, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="flex flex-col gap-1.5 border border-gray-200 rounded-2xl p-4 items-center justify-center cursor-pointer hover:bg-[#B8926A]/10 transition hover:shadow-lg hover:border-[#B8926A]/50">
            <Icon className="w-6 h-6 text-[#B8926A]" />
            <p className="text-xs font-semibold text-gray-600 truncate text-wrap text-center">{label}</p>
        </div>
    );
};

export default DashboardQuickAction;