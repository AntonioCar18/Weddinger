const progressBarTask = (done, total, progress) => {
    return (
            <><div className="flex justify-between items-center gap-4">
            <h3 className="font-semibold text-gray-700">Venue</h3>
            <p>{progress}% ({done}/{total})</p>
        </div><div className="mt-2 h-4 w-full bg-gray-300 rounded-xl">
                <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-[#B8926A] rounded-xl"
                >
                </div>
            </div></>
    );
}

export default progressBarTask;