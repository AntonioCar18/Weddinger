import { useState } from "react";

const AddItem = ({onSave, onClose}) => {

    const [data, setData] = useState({
        itemName: "",
        itemCategory: "Svi",
        totalPrice: "",
        isPaid: "Ne",
        status: "",
        prePaidAmount: "",
        notes: ""
    });

    const HandleChange = (e) => {
        const {name, value} = e.target;
        console.log("Mijenjam:", name, "u", value);
        setData(prev => {
        let newData = { ...prev, [name]: value };
        
        if (name === "isPaid" && value === "Ne") {
            newData.prePaidAmount = ""; 
        }
        
        return newData;
    });
    };

    const HandleSubmit = async (e) => {
        e.preventDefault();

        let status = "Na čekanju";
        const total = parseFloat(data.totalPrice) || 0;
        const deposit = parseFloat(data.prePaidAmount) || 0;

        if (deposit >= total && total > 0) {
            status = "Plaćeno";
        } else if (deposit > 0) {
            status = "Kapara";
        }

        const payload = {
            item_title: data.itemName,
            item_category: data.itemCategory,
            item_amount: total,
            item_status: status,
            deposit_amount: deposit,
            item_notes: data.notes
        };

        console.log("Šaljem payload na server:", payload);

        await onSave(payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white flex flex-col w-full max-w-lg p-8 shadow-2xl rounded-2xl my-auto border border-gray-100">
                <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Dodaj novi trošak</h2>
                <form onSubmit={HandleSubmit} className="flex flex-col space-y-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Naziv troška</label>
                    <input
                        type="text"
                        placeholder="Bend za salu.."
                        required
                        value={data.itemName}
                        onChange={HandleChange}
                        name="itemName"
                        className="w-full h-12 lg:h-14 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                    >
                    </input>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Odaberite kategoriju troška</label>
                    <select
                        required
                        name="itemCategory"
                        value={data.itemCategory}
                        onChange={HandleChange}
                        className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                    >
                        <option value="Svi">Sve kategorije..</option>
                        <option value="Glazba">Glazba</option>
                        <option value="Cvijeće">Cvijeće</option>
                        <option value="Fotograf">Fotograf</option>
                        <option value="Hrana i piće">Hrana i piće</option>
                        <option value="Prostor za svadbu">Prostor za svadbu</option>
                        <option value="Crkva - svećenik">Crkva - svećenik</option>
                        <option value="Nakit">Nakit</option>
                        <option value="Prijevoz">Prijevoz</option>
                        <option value="Gosti">Gosti</option>
                        <option value="Uređenje prostora">Uređenje prostora</option>
                        <option value="Pokloni">Pokloni</option>
                        <option value="Ostalo">Ostalo</option>
                    </select>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Ukupna cijena usluge [€]</label>
                    <input
                        type="text"
                        placeholder="Ukupna cijena.."
                        required
                        name="totalPrice"
                        value={data.totalPrice}
                        onChange={HandleChange}
                        className="w-full h-12 lg:h-14 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                    >
                    </input>
                    <div className="flex justify-between">
                    <div className="flex flex-col">
                        <p className="block text-sm font-semibold text-gray-600 mb-3">
                            Jeste li uplatili kaparu?
                        </p>
                        <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                            required
                            type="radio"
                            name="isPaid"
                            value="Da"
                            className="w-4 h-4 accent-[#B8926A] cursor-pointer"
                            checked = {data.isPaid === "Da"}
                            onChange = {HandleChange}
                            /><span className="text-gray-700">Da</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                            required
                            type="radio"
                            name="isPaid"
                            value="Ne"
                            className="w-4 h-4 accent-[#B8926A] cursor-pointer"
                            checked = {data.isPaid === "Ne"}
                            onChange = {HandleChange}
                            /><span className="text-gray-700">Ne</span>
                        </label>
                        </div>
                    </div>
                    {data.isPaid === "Da" && (
                    <div className="flex flex-col">
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Uplaćena kapara [€]</label>
                        <input
                            type="text"
                            placeholder="Iznos kapare.."
                            required
                            name="prePaidAmount"
                            value={data.prePaidAmount}
                            onChange={HandleChange}
                            className="w-full h-12 lg:h-14 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                        >
                        </input>
                    </div>
                    )}
                    </div>
                    <div className="flex flex-col gap-2 cursor-pointer mt-4">
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Bilješka uz stavku</label>
                        <textarea
                            name="notes"
                            placeholder="Potrebno je uplatiti kaparu do 25. Listopada.."
                            rows="2"
                            value={data.notes}
                            onChange={HandleChange}
                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                        >
                        </textarea>
                    </div>
                <div className="flex justify-end mt-6 gap-8">
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
                        Dodaj
                    </button>
                </div>
             </form>
            </div>
        </div>
    );
}

export default AddItem;