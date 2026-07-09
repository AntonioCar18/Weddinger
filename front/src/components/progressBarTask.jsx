const ProgressBarTask = ({ category, done, total, progress }) => {
    return (
        <div className="w-full">
            {/* Header sekcija - koristimo malo nježniju sivu za tekst */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{category}</h3>
                <p className="text-sm text-gray-500 font-medium">
                    {progress}% <span className="text-gray-400">({done}/{total})</span>
                </p>
            </div>

            {/* Progress bar - s mekim zaobljenjima i laganom pozadinom */}
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                <div
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    className="h-full bg-[#B8926A] rounded-full transition-all duration-500 ease-out"
                />
            </div>
        </div>
    );
};

export default ProgressBarTask;