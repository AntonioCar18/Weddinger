import { useState, useEffect } from "react";

const EditTable = ({ initialData, onClose, onSave, onDelete, occupancy }) => {
    const [formData, setFormData] = useState({
        capacity: initialData?.capacity || 10,
        table_notes: initialData?.table_notes || ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                capacity: initialData.capacity,
                table_notes: initialData.table_notes,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newCapacity = parseInt(formData.capacity, 10);

        if (newCapacity < occupancy) {
        alert(`Ne možete smanjiti kapacitet ispod ${occupancy} jer je toliko gostiju već raspoređeno za ovaj stol.`);
        return; // Prekida slanje
    }

        onSave({
            capacity: newCapacity,
            table_notes: formData.table_notes
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        const tableId = initialData?.id
        if(tableId && window.confirm("Jeste li sigurni da želite obrisati ovaj stol?")){
            onDelete(tableId);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col w-full max-w-lg p-8 shadow-2xl rounded-2xl relative my-auto border border-gray-200">
                <button 
                    type="button"
                    onClick={onClose} 
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl font-medium transition cursor-pointer"
                >
                    &times;
                </button>

                <h1 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Uredi stol br. {initialData?.table_number}</h1>
                
                <div className="flex flex-col space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Broj mjesta za stolom *</label>
                        <input 
                            type="number" 
                            name="capacity"
                            required
                            min={occupancy}
                            value={formData.capacity}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition"  
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Napomena (opcionalno)</label>
                        <textarea 
                        name="table_notes"
                        value={formData.table_notes}
                        onChange={handleChange}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button 
                        type="button" 
                        onClick={handleDelete} 
                        className="px-6 py-3 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-semibold transition cursor-pointer"
                    >
                        Obriši
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

export default EditTable;