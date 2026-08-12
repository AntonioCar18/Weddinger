import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQComponent = ({title, short_desc, long_desc}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col w-full gap-2">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between cursor-pointer"
            >
                <h2 className="text-md text-gray-800 font-bold">{title}</h2>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </div>
    
            {!isOpen && (
                <p className="text-gray-500 text-sm truncate">{short_desc}</p>
            )}
    
            {isOpen && (
                <>
                    <p className="text-sm text-gray-500 mt-2">{long_desc}</p>
                </>
            )}
        </div>
    );
};

export default FAQComponent;