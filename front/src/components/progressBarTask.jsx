const ProgressBarTask = ({ icon_category, category, done, total, progress }) => {

    const Icon = icon_category;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {Icon && <Icon className="w-4 h-4 text-[#8B6B47] shrink-0" />}
                    <h3 className="font-semibold text-[16px] text-gray-800 truncate">{category}</h3>
                </div>
                <p className="text-sm text-[#8a8378] font-medium whitespace-nowrap shrink-0">
                    {Math.round(progress)}% <span className="text-[#a39d90] sm:hidden">({done}/{total})</span>
                </p>
            </div>

            <div className="h-2.5 w-full bg-[#f1ece3] rounded-full overflow-hidden">
                <div
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    className="h-full bg-linear-to-r from-[#c39d76] to-[#8B6B47] rounded-full transition-all duration-700 ease-out"
                />
            </div>
        </div>
    );
};

export default ProgressBarTask;