import { X, Euro } from "lucide-react";
import { useState } from "react";
import DeleteModal from "./deleteModal";
import ErrorModal from "./errorModal";

const EditItem = ({ item, onSave, onClose, onDelete, defaultPaid = false }) => {

    const [errorModal, setErrorModal] = useState(false);

    const [data, setData] = useState({
        id: item?.id,
        itemName: item?.item_title || "",
        itemCategory: item?.item_category || "",
        totalPrice: item?.item_amount || "",
        isPaid: (item?.item_deposit > 0 || defaultPaid) ? "Da" : "Ne",
        prePaidAmount: item?.item_deposit || "",
        itemNotes: item?.item_notes || ""
    });

    const HandleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => {
            let newData = { ...prev, [name]: value };
            if (name === "isPaid" && value === "Ne") {
                newData.prePaidAmount = "";
            }
            return newData;
        });
    };

    const setIsPaid = (value) => {
        setData(prev => ({
            ...prev,
            isPaid: value,
            prePaidAmount: value === "Ne" ? "" : prev.prePaidAmount
        }));
    };

    const HandleSubmit = async (e) => {
        e.preventDefault();

        const total = parseFloat(data.totalPrice) || 0;
        const deposit = parseFloat(data.prePaidAmount) || 0;

        if (data.isPaid === "Da" && deposit > total) {
            setErrorModal(true);
            return;
        }

        let status = "Na čekanju";

        if (deposit >= total && total > 0) {
            status = "Plaćeno";
        } else if (deposit > 0) {
            status = "Kapara";
        }

        const payload = {
            item_title: data.itemName,
            item_status: status,
            item_amount: total,
            deposit_amount: deposit,
            item_notes: data.itemNotes,
            item_category: data.itemCategory
        };

        await onSave(payload);
        onClose();
    };

    const handleDelete = (e) => {
        e.preventDefault();
        const itemId = data?.id;
        onDelete(itemId);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white flex flex-col w-full max-w-lg p-8 shadow-2xl rounded-2xl my-auto border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                            <Euro size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800">Uredi trošak</h2>
                    </div>
                    <button
                        type="button"
                        className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                        onClick={onClose}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={HandleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Naziv troška</label>
                        <input
                            type="text"
                            placeholder="Bend za salu.."
                            required
                            value={data.itemName}
                            onChange={HandleChange}
                            name="itemName"
                            className="w-full h-12 lg:h-14 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Kategorija</label>
                            <select
                                required
                                name="itemCategory"
                                value={data.itemCategory}
                                onChange={HandleChange}
                                className="w-full h-12 lg:h-14 bg-white border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] transition-all duration-200 text-sm lg:text-base text-gray-700 cursor-pointer appearance-none"
                            >
                                <option value="" disabled>Odaberite kategoriju..</option>
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
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Ukupna cijena</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0"
                                    required
                                    name="totalPrice"
                                    value={data.totalPrice}
                                    onChange={HandleChange}
                                    className="w-full h-12 lg:h-14 px-4 pr-10 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">€</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#B8926A]/20 bg-[#B8926A]/5 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <p className="text-sm font-semibold text-gray-700">Jeste li uplatili kaparu?</p>
                            <div className="inline-flex rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsPaid("Da")}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                                        data.isPaid === "Da"
                                            ? "bg-[#B8926A] text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Da
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPaid("Ne")}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                                        data.isPaid === "Ne"
                                            ? "bg-[#B8926A] text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Ne
                                </button>
                            </div>
                        </div>

                        {data.isPaid === "Da" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Uplaćena kapara</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="0"
                                        required
                                        name="prePaidAmount"
                                        value={data.prePaidAmount}
                                        onChange={HandleChange}
                                        className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">€</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Bilješka uz stavku</label>
                        <textarea
                            placeholder="Potrebno je uplatiti kaparu do 25. listopada.."
                            name="itemNotes"
                            rows={2}
                            value={data.itemNotes}
                            onChange={HandleChange}
                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition resize-none"
                        />
                    </div>

                    <div className="flex justify-end mt-2 gap-3">
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
                            Spremi
                        </button>
                    </div>
                </form>
            </div>
            {showDeleteModal && (
                <DeleteModal
                    onCancel={() => setShowDeleteModal(false)}
                    onDelete={handleDelete}
                    desc="Jeste li sigurni da želite obrisati ovu stavku budžeta? Ova akcija je nepovratna."
                    deleteText="Da, obriši stavku"
                />
            )}

            {errorModal && (
                <ErrorModal 
                    onCancel={() => setErrorModal(false)}
                    desc="Iznos kapare je veći od ukupnog iznosa usluge. Molimo Vas da to ispravite."
                />
            )}
        </div>
    );
}

export default EditItem;
