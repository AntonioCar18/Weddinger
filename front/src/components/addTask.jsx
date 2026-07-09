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

                <h1 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Novi zadatak</h1>
                
                <div className="flex flex-col space-y-4">
                    {/* Naziv */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Naziv zadatka*</label>
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

                    {/* Vlasnik */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Zadužena osoba</label>
                        <select 
                            name="task_owner"
                            value={taskData.task_owner}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition appearance-none"
                        >
                            <option value="">Odaberi osobu</option>
                            {partners?.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kategorija i Datum */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Kategorija*</label>
                            <select
                                name="task_category"
                                value={taskData.task_category}
                                onChange={handleChange}
                                required
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition appearance-none"
                            >
                                <option value="Prostor">Prostor</option>
                                <option value="Ugostiteljstvo">Ugostiteljstvo</option>
                                <option value="Dekoracije">Dekoracije</option>
                                <option value="Glazba">Glazba</option>
                                <option value="Administracija">Administracija</option>
                                <option value="Ostalo">Ostalo</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Datum dospijeća*</label>
                            <input 
                                type="date"
                                name="task_due_date"
                                min={new Date().toISOString().split('T')[0]}
                                value={taskData.task_due_date}
                                onChange={handleChange}
                                className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition outline-hidden text-gray-700"
                                required
                            />
                        </div>
                    </div>

                    {/* Prioritet */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Prioritet*</label>
                        <select
                            name="task_priority"
                            value={taskData.task_priority}
                            onChange={handleChange}
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition appearance-none"
                            required
                        >
                            <option value="Visok">Visok</option>
                            <option value="Srednji">Srednji</option>
                            <option value="Nizak">Nizak</option>
                        </select>
                    </div>

                    {/* Bilješke */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Bilješke</label>
                        <textarea 
                            name="task_notes"
                            value={taskData.task_notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Dodatne napomene..."
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 hover:text-gray-800 font-semibold transition cursor-pointer">Odustani</button>
                    <button type="submit" className="px-7 py-3 bg-[#B8926A] text-white font-semibold rounded-xl hover:bg-[#a07b5c] shadow-md transition cursor-pointer">Spremi</button>
                </div>
            </form>
        </div>
    );
}

export default AddTask;