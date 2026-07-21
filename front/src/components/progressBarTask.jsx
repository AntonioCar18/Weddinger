const ProgressBarTask = ({ icon_category, category, done, total, progress }) => {
    
    const Icon = icon_category;
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 flex justify-center rounded-full">
                            {Icon ? <Icon className="w-4 h-4 text-[#8B6B47]" /> : null}
                        </div>
                    </div>
                    <h3 className="font-semibold text-[16px] text-gray-800 mb-1">{category}</h3>
                </div>
                <p className="text-sm text-[#8a8378] font-medium">
                    {progress}% <span className="text-[#a39d90]">({done}/{total})</span>
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