import React from 'react';

const PartnersBlock = ({ title, count, icon_partners }) => {
    const Icon = icon_partners;
    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-4 h-4 text-[#8B6B47] shrink-0" />}
                <h2 className="min-w-0 flex-1 text-[12px] lg:text-[12px] text-gray-500 font-medium uppercase tracking-wider truncate">
                    {title}
                </h2>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">
                {count}
            </p>
        </div>
    );
};

export default PartnersBlock;