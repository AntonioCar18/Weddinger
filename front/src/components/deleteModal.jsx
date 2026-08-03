import { AlertTriangle } from "lucide-react";

const DeleteModal = ({ onCancel, onDelete, desc, deleteText }) => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="absolute inset-0"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#efe9e0] shadow-2xl p-8">
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex shrink-0 bg-red-50 rounded-xl p-2.5">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-display text-xl text-gray-900">Potvrda brisanja</h2>
                        <p className="text-sm text-[#8a8378]">Ova akcija je nepovratna</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    {desc}
                </p>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="cursor-pointer bg-[#f5f1ea] text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#efe9e0] active:scale-97 transition-all duration-200"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={onDelete}
                        className="cursor-pointer bg-linear-to-br from-red-300 to-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-red-500/20 hover:shadow-lg active:scale-97 transition-all duration-200"
                    >
                        {deleteText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;