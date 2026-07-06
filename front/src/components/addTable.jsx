import { useState } from "react";

const AddTable = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        capacity: 10,
        notes: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            capacity: parseInt(formData.capacity),
            notes: formData.notes
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col w-full max-w-lg p-8 shadow-2xl rounded-2xl relative my-auto border border-gray-100">
                
                <button 
                    type="button"
                    onClick={onClose} 
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl font-medium transition cursor-pointer"
                >
                    &times;
                </button>

                <h1 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Dodaj novi stol</h1>
                
                <div className="flex flex-col space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Broj mjesta za stolom *</label>
                        <input 
                            type="number" 
                            name="capacity"
                            required
                            min="1"
                            value={formData.capacity}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Napomena (opcionalno)</label>
                        <textarea 
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="npr. Stol pokraj ulaza..."
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-3 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-semibold transition cursor-pointer"
                    >
                        Odustani
                    </button>
                    <button 
                        type="submit" 
                        className="px-7 py-3 bg-[#B8926A] text-white font-semibold rounded-xl hover:bg-[#a07b5c] shadow-md shadow-[#B8926A]/10 transform hover:-translate-y-0.5 transition duration-200 cursor-pointer"
                    >
                        Spremi stol
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTable;