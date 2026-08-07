import { Lock, X, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const ForgetPassword = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [emailAddress, setEmailAddress] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [missingFieldsEmail, setMissingFieldsEmail] = useState(false);
    const [missingFieldCode, setMissingFieldCode] = useState(false);
    const [invalidEmailFormat, setInvalidEmailFormat] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const [requestError, setRequestError] = useState("");
    const [resetError, setResetError] = useState("");
    const [loadingReset, setLoadingReset] = useState(false);
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const requestResetCode = async () => {
        if (!emailAddress.trim()) {
            setMissingFieldsEmail(true);
            setInvalidEmailFormat(false);
            return;
        }
        if (!isValidEmail(emailAddress)) {
            setInvalidEmailFormat(true);
            setMissingFieldsEmail(false);
            return;
        }
        setMissingFieldsEmail(false);
        setInvalidEmailFormat(false);
        setRequestError("");
        setLoadingCode(true);

        try {
            const response = await fetch("/api/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: emailAddress }),
            });
            if (response.ok) {
                setStep(2);
            } else {
                setRequestError("Došlo je do greške, pokušajte ponovo.");
            }
        } catch (error) {
            setRequestError("Problem s povezivanjem na poslužitelj.");
        } finally {
            setLoadingCode(false);
        }
    };

    const handleNextStep = () => {
        if (code.trim().length < 6) {
            setMissingFieldCode(true);
            return;
        }
        setMissingFieldCode(false);
        setStep(step + 1);
    };

    const handleChange = async () => {
        if (password !== confirmPassword) {
            setPasswordMismatch(true);
            return;
        }
        setPasswordMismatch(false);
        setResetError("");
        setLoadingReset(true);

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: emailAddress, code, new_password: password }),
            });
            const data = await response.json();
            if (response.ok) {
                setStep(step + 1);
            } else {
                setResetError(data.detail || "Došlo je do greške na poslužitelju.");
            }
        } catch (error) {
            setResetError("Problem s povezivanjem na poslužitelj.");
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <form className="bg-white rounded-2xl w-full md:max-w-lg p-8 shadow-2xl border border-[#efe9e0]">
                <div className="flex flex-col gap-2">
                    {step === 1 && (
                        <>
                            <div className="flex items-center justify-between mb-4 pb-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                                        <Lock size={20} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-800">Zaboravili ste lozinku?</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm">It's fine, svakome se dogodi, jednostavno prati upute i resetiraj svoju lozinku. Za početak, unesite svoju mail adresu.</p>

                            <div className="flex flex-col gap-1.5 mt-4 mb-2">
                                <label className="text-sm font-semibold text-gray-600">Unesite registracijsku e-mail adresu</label>
                                <input
                                    type="email"
                                    value={emailAddress}
                                    required
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    placeholder="mail@domena.com"
                                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                />
                            </div>

                            {missingFieldsEmail && (
                                <p className="text-sm text-gray-500">Potrebno je upisati <span className="font-bold">registracijsku email adresu</span> prije odlaska na sljedeći korak.</p>
                            )}

                            {invalidEmailFormat && (
                                <p className="text-sm text-gray-500">Unesena adresa nije u ispravnom formatu (npr. <span className="font-bold">ime@domena.com</span>).</p>
                            )}

                            {requestError && (
                                <p className="text-sm text-red-500">{requestError}</p>
                            )}

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={requestResetCode}
                                    disabled={loadingCode}
                                    className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold rounded-xl px-6 py-3 shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
                                >
                                    {loadingCode ? "Šaljem..." : "Sljedeći korak"}
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                                        <Lock size={20} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-800">Ne brinite!</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm">Izmjena će biti izvršena brzo. Na mail smo Vam poslali kod koji morate upisati u polje. Ne zaboravi provjeriti spam u slučaju da ne vidiš mail.</p>

                            <div className="flex flex-col gap-1.5 mt-4 mb-2">
                                <label className="text-sm font-semibold text-gray-600">Unesite kod</label>
                                <input
                                    value={code}
                                    required
                                    maxLength={6}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="XXXXXX"
                                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                />
                            </div>

                            {missingFieldCode && (
                                <p className="text-sm text-gray-500">Potrebno je upisati <span className="font-bold">kod koji smo Vam poslali</span> prije odlaska na sljedeći korak. Također, provjerite jeste li upisali svih 6 znakova.</p>
                            )}

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="cursor-pointer text-gray-700 font-semibold px-2 py-3 active:scale-[0.98] transition-all duration-200"
                                >
                                    Nazad
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold rounded-xl px-6 py-3 shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                                >
                                    Sljedeći korak
                                </button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                                        <Lock size={20} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-800">Izmjena lozinke</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm">Unesite svoju novu lozinku, a potom ju i potvrdite.</p>

                            <div className="flex flex-col gap-1.5 mt-4 mb-2">
                                <label className="text-sm font-semibold text-gray-600">Unesite novu lozinku</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Unesite novu lozinku"
                                        className="w-full h-12 px-4 pr-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 mt-4 mb-2">
                                <label className="text-sm font-semibold text-gray-600">Potvrdite novu lozinku</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        required
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Potvrdite novu lozinku"
                                        className="w-full h-12 px-4 pr-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B8926A]/20 focus:border-[#B8926A] text-gray-700 placeholder-gray-400 outline-hidden transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(prev => !prev)}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {passwordMismatch && (
                                <p className="text-sm text-red-500">Lozinke se ne podudaraju.</p>
                            )}

                            {resetError && (
                                <p className="text-sm text-red-500">{resetError}</p>
                            )}

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="cursor-pointer text-gray-700 font-semibold px-2 py-3 active:scale-[0.98] transition-all duration-200"
                                >
                                    Nazad
                                </button>
                                <button
                                    type="button"
                                    onClick={handleChange}
                                    disabled={loadingReset}
                                    className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold rounded-xl px-6 py-3 shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
                                >
                                    {loadingReset ? "Spremam..." : "Promijeni lozinku"}
                                </button>
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                                        <CheckCircle2 size={20} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-800">Lozinka promijenjena</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm">Vaša lozinka je uspješno promijenjena. Sada se možete prijaviti novom lozinkom.</p>

                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer w-full mt-6 bg-linear-to-r from-[#c39d76] to-[#8B6B47] text-white font-semibold rounded-xl py-3 shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                            >
                                Natrag na prijavu
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default ForgetPassword;
