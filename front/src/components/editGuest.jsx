import { X, Pencil } from "lucide-react";
import { useState } from "react";

const EditGuest = ({ guest, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: guest.name || "",
        plus_one: guest.plus_one || false,
        plus_one_name: guest.plus_one_name || "",
        phone: guest.phone || "",
        menu_type: guest.menu_type || "Standard",
        menu_type_plus_one: guest.menu_type_plus_one || "Standard",
        table_number: guest.table_number || "",
        notes: guest.notes || "",
        status: guest.status || "Na čekanju"
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert("Ime i prezime gosta je obavezno!");

        const payload = {
            ...formData,
            table_number: formData.table_number !== "" ? parseInt(formData.table_number, 10) : null,
            plus_one_name: formData.plus_one ? formData.plus_one_name : ""
        };

        onSave(payload);
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
                            <Pencil size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800">Uredi gosta</h2>
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
                        <label className="text-sm font-semibold text-gray-600">Ime i prezime *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="npr. Marko Horvat"
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Broj mobitela</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="npr. 091 234 5678"
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Tip menija</label>
                            <select
                                name="menu_type"
                                value={formData.menu_type}
                                onChange={handleChange}
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                                style={selectArrowStyle}
                            >
                                <option value="Standard">Standard</option>
                                <option value="Vegetarijanski">Vegetarijanski</option>
                                <option value="Veganski">Veganski</option>
                                <option value="Bez glutena">Bez glutena</option>
                                <option value="Dječji">Dječji</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Broj stola</label>
                            <input
                                type="number"
                                disabled
                                readOnly
                                name="table_number"
                                value={formData.table_number}
                                onChange={handleChange}
                                placeholder="Dodjeljuje se"
                                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 placeholder-gray-400 outline-hidden transition cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="plus_one"
                            name="plus_one"
                            checked={formData.plus_one}
                            onChange={handleChange}
                            className="w-5 h-5 text-[#B8926A] border-gray-200 rounded-md focus:ring-[#B8926A]/20 focus:border-[#B8926A] cursor-pointer accent-[#B8926A]"
                        />
                        <label htmlFor="plus_one" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                            Dolazi s pratnjom (Plus One)?
                        </label>
                    </div>

                    {formData.plus_one && (
                        <div className="rounded-2xl border border-[#B8926A]/20 bg-[#B8926A]/5 p-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-600">Ime i prezime pratnje</label>
                                <input
                                    type="text"
                                    name="plus_one_name"
                                    value={formData.plus_one_name}
                                    onChange={handleChange}
                                    placeholder="Ime i prezime pratitelja"
                                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-600">Tip menija</label>
                                <select
                                    name="menu_type_plus_one"
                                    value={formData.menu_type_plus_one}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                                    style={selectArrowStyle}
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Vegetarijanski">Vegetarijanski</option>
                                    <option value="Veganski">Veganski</option>
                                    <option value="Bez glutena">Bez glutena</option>
                                    <option value="Dječji">Dječji</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Napomene / Alergije</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Dodatne napomene o gostu.."
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition resize-none"
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

export default EditGuest;
