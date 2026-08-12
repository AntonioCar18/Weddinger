import { X, ListPlus } from "lucide-react";
import { useState } from "react";

const AddTask = ({ onClose, onSave, partners }) => {
    const [taskData, setTaskData] = useState({
        task_name: "",
        task_owner: "",
        task_category: "Prostor", // Početna vrijednost prema listi
        task_priority: "Srednji",
        task_due_date: "",
        task_notes: "",
        task_is_completed: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskData.task_name.trim()) return alert("Naziv zadatka je obavezan!");
        onSave(taskData);
    };

    const selectArrowStyle = {
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1em'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col w-full max-w-lg p-8 shadow-2xl rounded-2xl my-auto border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                            <ListPlus size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800">Novi zadatak</h2>
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
                        <label className="text-sm font-semibold text-gray-600">Naziv zadatka *</label>
                        <input
                            type="text"
                            name="task_name"
                            required
                            value={taskData.task_name}
                            onChange={handleChange}
                            placeholder="npr. Priprema dekoracija"
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Zadužena osoba</label>
                        <select
                            name="task_owner"
                            value={taskData.task_owner}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                            style={selectArrowStyle}
                        >
                            <option value="">Odaberi osobu</option>
                            {partners?.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 items-center">
                        <div className="flex min-w-0 flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-600">Kategorija *</label>
                            <select
                                name="task_category"
                                value={taskData.task_category}
                                onChange={handleChange}
                                required
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                                style={selectArrowStyle}
                            >
                                <option value="Prostor">Prostor</option>
                                <option value="Ugostiteljstvo">Ugostiteljstvo</option>
                                <option value="Dekoracije">Dekoracije</option>
                                <option value="Glazba">Glazba</option>
                                <option value="Administracija">Administracija</option>
                                <option value="Ostalo">Ostalo</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-600">Datum dospijeća *</label>
                            <input
                                type="date"
                                name="task_due_date"
                                min={new Date().toISOString().split('T')[0]}
                                value={taskData.task_due_date}
                                onChange={handleChange}
                                style={{ WebkitAppearance: 'none', lineHeight: '3rem' }}
                                className="w-full max-w-full h-12 bg-white border box-border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition outline-hidden text-gray-700 block"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Prioritet *</label>
                        <select
                            name="task_priority"
                            value={taskData.task_priority}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                            style={selectArrowStyle}
                            required
                        >
                            <option value="Visok">Visok</option>
                            <option value="Srednji">Srednji</option>
                            <option value="Nizak">Nizak</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Bilješke</label>
                        <textarea
                            name="task_notes"
                            value={taskData.task_notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Dodatne napomene.."
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-semibold transition cursor-pointer"
                    >
                        Odustani
                    </button>
                    <button
                        type="submit"
                        className="px-7 py-3 bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white font-semibold rounded-xl shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200 cursor-pointer"
                    >
                        Spremi
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddTask;
