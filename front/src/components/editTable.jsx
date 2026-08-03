import { X, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import DeleteModal from "./deleteModal";

const EditTable = ({ initialData, onClose, onSave, onDelete, occupancy }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        if(tableId){
            onDelete(tableId);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col w-full max-w-lg p-8 shadow-2xl rounded-2xl my-auto border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                            <Pencil size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800">Uredi stol br. {initialData?.table_number}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Broj mjesta za stolom *</label>
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

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Napomena (opcionalno)</label>
                        <textarea
                        name="table_notes"
                        value={formData.table_notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl font-semibold transition cursor-pointer"
                    >
                        Obriši
                    </button>
                    <button
                        type="submit"
                        className="px-7 py-3 bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white font-semibold rounded-xl shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 cursor-pointer"
                    >
                        Spremi stol
                    </button>
                </div>
            </form>
            {showDeleteModal && (
                <DeleteModal
                    onCancel={() => setShowDeleteModal(false)}
                    onDelete={handleDelete}
                    desc="Jeste li sigurni da želite obrisati ovaj stol? Ova akcija je nepovratna."
                    deleteText="Da, obriši stol"
                />
            )}
        </div>
    );
};

export default EditTable;
