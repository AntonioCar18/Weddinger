import { useState } from "react";

const AddGuest = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        plus_one: false,
        plus_one_name: "",
        phone: "",
        menu_type: "Standard",
        menu_type_plus_one: "Standard",
        table_number: "",
        notes: ""
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
            table_number: formData.table_number ? parseInt(formData.table_number, 10) : null,
            plus_one_name: formData.plus_one ? formData.plus_one_name : ""
        };
        onSave(payload);
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

                <h1 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Novi gost</h1>
                
                <div className="flex flex-col space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Ime i prezime *</label>
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

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Broj mobitela</label>
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
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Tip menija</label>
                            <select
                                name="menu_type"
                                value={formData.menu_type}
                                onChange={handleChange}
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center',
                                    backgroundSize: '1em'
                                }}
                            >
                                <option value="Standard">Standard</option>
                                <option value="Vegetarijanski">Vegetarijanski</option>
                                <option value="Veganski">Veganski</option>
                                <option value="Bez glutena">Bez glutena</option>
                                <option value="Dječji">Dječji</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Broj stola</label>
                            <input 
                                type="number" 
                                name="table_number"
                                disabled
                                readOnly
                                value={formData.table_number}
                                onChange={handleChange}
                                placeholder="npr. 4" 
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <input
                            type="checkbox"
                            id="plus_one"
                            name="plus_one"
                            checked={formData.plus_one}
                            onChange={handleChange}
                            className="w-5 h-5 text-[#B8926A] border-gray-200 rounded-md focus:ring-[#B8926A]/20 focus:border-[#B8926A] cursor-pointer accent-[#B8926A]"
                        />
                        <label htmlFor="plus_one" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                            Dolazi s pratnjom?
                        </label>
                    </div>

                    {formData.plus_one && (
                        <div>
                        <div className="transition-all duration-200">
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Ime i prezime pratnje</label>
                            <input 
                                type="text" 
                                name="plus_one_name"
                                value={formData.plus_one_name}
                                onChange={handleChange}
                                placeholder="Ime i prezime pratitelja" 
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition mb-2" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Tip menija</label>
                            <select
                                name="menu_type_plus_one"
                                value={formData.menu_type_plus_one}
                                onChange={handleChange}
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 outline-hidden transition cursor-pointer appearance-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center',
                                    backgroundSize: '1em'
                                }}
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

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-3">Napomene / Alergije</label>
                        <textarea 
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Dodatne napomene o gostu..."
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl overflow-x-hidden „focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition resize-none"
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
                        Spremi
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddGuest;