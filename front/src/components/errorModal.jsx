import { AlertTriangle, X } from "lucide-react";

const ErrorModal = ({ onCancel, desc }) => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="absolute inset-0"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#efe9e0] shadow-2xl p-8">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute top-5 right-5 cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-4 mb-5">
                    <div className="flex shrink-0 bg-red-50 rounded-xl p-2.5">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-display text-xl text-gray-900">Greška</h2>
                    </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    {desc}
                </p>
            </div>
        </div>
    );
};

export default ErrorModal;
