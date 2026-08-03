const DocumentBlock = ({ number, format, icon_format }) => {
    const Icon = icon_format
    return (
        <div className="flex p-8 shadow bg-white rounded-2xl items-center gap-4">
            <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47] shrink-0">
                <Icon className="w-6 h-6 text-[#B8926A]"/>
            </div>
            <div className="flex flex-col">
                <p className="text-2xl font-extrabold text-gray-800">{number}</p>
                <p className="text-sm text-gray-500">{format}</p>
            </div>
        </div>
    );
};

export default DocumentBlock;