const DashboardComponents = ({ desc, icon: Icon, value, total, unit = "" }) => {
    return (
        <div className="flex flex-col bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-center w-10 h-10 bg-[#B8926A]/60 rounded-xl text-white shadow-sm">
                <Icon className="w-4 h-4" />
            </div>

            <div className="flex items-baseline gap-1 mt-4">
                <span className="text-2xl font-extrabold text-gray-800">{value}</span>
                <span className="text-sm text-gray-500">
                    / {total} {unit}
                </span>
            </div>

            <div className="mt-2">
                <p className="text-sm font-medium text-gray-600 truncate">{desc}</p>
            </div>
        </div>
    )
}

export default DashboardComponents;