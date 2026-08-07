import { useState } from "react";
import weddingerLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Dashboard from "./dashboard";
import Onboarding from "./onboarding";
import LoginModal from "../components/loginModal";
import ForgetPassword from "../components/forgetPassword";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {

    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
    const [registrationError, setRegistrationError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [forgetPasswordOpen, setForgetPasswordOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // registracija: 1 = email/lozinka, 2 = unos koda, 3 = uspjeh
    const [registerStep, setRegisterStep] = useState(1);
    const [code, setCode] = useState("");
    const [missingFieldCode, setMissingFieldCode] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [verifyLoading, setVerifyLoading] = useState(false);

    const resetToLogin = () => {
        setIsLogin(true);
        setRegisterStep(1);
        setRegisterEmail("");
        setRegisterPassword("");
        setCode("");
    };

    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (email.trim() === "" || password.trim() === "") {
            setMissingFieldsModalOpen(true);
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                const response = await fetch("/api/me", {
                    method: "GET",
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("user", JSON.stringify(data.user));

                    if (!data.user.onboarding_completed) {
                        navigate("/onboarding");
                    } else {
                        navigate("/dashboard");
                    }
                } else {
                    navigate("/dashboard");
                }
            } else {
                setLoginError(data.detail || "Prijava nije uspjela, molim pokušajte ponovo.");
            }
        } catch (error) {
            alert("Došlo je do greške na poslužitelju. Molim pokušajte ponovo.");
        }
    };

    const handleRegister = async () => {
        if (registerEmail.trim() === "" || registerPassword.trim() === "") {
            setMissingFieldsModalOpen(true);
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: registerEmail,
                    password: registerPassword
                }),
            });

            const data =  await response.json();

            if (response.ok) {
                setRegisterStep(2);
            } else {
                setRegistrationError(data.detail || "");
                setRegisterModalOpen(true);
            }
        } catch (error) {
            alert("Došlo je do greške na poslužitelju. Molim pokušajte ponovo.");
        }
    };

    const handleVerifyEmail = async () => {
        if (code.trim().length < 6) {
            setMissingFieldCode(true);
            return;
        }
        setMissingFieldCode(false);
        setVerifyError("");
        setVerifyLoading(true);

        try {
            const response = await fetch("/api/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: registerEmail, code }),
            });
            const data = await response.json();
            if (response.ok) {
                setRegisterStep(3);
            } else {
                setVerifyError(data.detail || "Kod je netočan ili je istekao.");
            }
        } catch (error) {
            setVerifyError("Problem s povezivanjem na poslužitelj.");
        } finally {
            setVerifyLoading(false);
        }
    };

    return (
        <div
            className={`w-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 ${
                isLogin
                    ? "fixed left-0 top-0 h-dvh overflow-hidden"
                    : "min-h-dvh overflow-y-auto"
            }`}
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920')" }}
        >
            <div className={`bg-white rounded-2xl p-8 flex flex-col shadow-xl max-w-md w-full ${
                isLogin ? "h-auto max-h-full overflow-hidden" : "my-8"
            }`}>
                {(isLogin || registerStep === 1) && (
                    <div className="flex w-full border-b border-gray-200 mb-6">
                        <button
                            className={`flex-1 py-2 text-center font-medium ${isLogin ? "border-b-2 border-[#B8926A] text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Prijava
                        </button>
                        <button
                            className={`flex-1 py-2 text-center font-medium ${!isLogin ? "border-b-2 border-[#B8926A] text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Registracija
                        </button>
                    </div>
                )}
                <div>
                    <img
                        src={weddingerLogo}
                        alt="Weddinger Logo"
                        className="w-48 mx-auto mb-6"
                    />
                </div>

                {isLogin && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">Dobrodošli u Weddinger!</h1>
                            <p className="text-gray-500 mt-1">Unesite svoje podatke za prijavu</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Adresa E-pošte</label>
                                <input
                                    className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Lozinka</label>
                                <div className="relative">
                                    <input
                                        className="w-full border border-gray-300 rounded-lg py-2 pl-4 pr-11 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="text-right mt-2">
                            <button
                                type="button"
                                onClick={() => setForgetPasswordOpen(true)}
                                className="text-sm text-[#B8926A] font-semibold hover:underline cursor-pointer"
                            >
                                Zaboravili ste lozinku?
                            </button>
                        </div>

                        <button
                            className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] shadow-amber-700/10 text-white font-medium rounded-lg py-2.5 px-4 mt-6 active:scale-[0.98] transition duration-200 w-full shadow-md"
                            onClick={handleLogin}
                        >
                            Prijavi se
                        </button>
                    </>
                )}

                {!isLogin && registerStep === 1 && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">Dobrodošli u Weddinger!</h1>
                            <p className="text-gray-500 mt-1">Registrirajte se kako biste koristili naše usluge</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Adresa E-pošte</label>
                                <input
                                    className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition"
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Lozinka</label>
                                <div className="relative">
                                    <input
                                        className="w-full border border-gray-300 rounded-lg py-2 pl-4 pr-11 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition"
                                        type={showPassword ? "text" : "password"}
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 mt-6">
                            <p>Registracijom prihvaćate naše <a href="/terms" target="_blank" className="font-bold">uvjete korištenja</a> i <a href="/privacy" target="_blank" className="font-bold">politiku privatnosti</a>. Ako ste se već registrirali, možete se <a href="#" className="font-bold" onClick={() => setIsLogin(true)}>prijaviti</a>.</p>
                        </div>

                        <button
                            className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] shadow-amber-700/10 text-white font-medium rounded-lg py-2.5 px-4 mt-6 active:scale-[0.98] transition duration-200 w-full shadow-md"
                            onClick={handleRegister}
                        >
                            Registriraj se
                        </button>
                    </>
                )}

                {!isLogin && registerStep === 2 && (
                    <>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Potvrdite svoj email</h1>
                            <p className="text-gray-500 mt-1 text-sm">Poslali smo kod na <span className="font-semibold text-gray-700">{registerEmail}</span>. Provjerite spam ako ga ne vidite.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Unesite kod</label>
                            <input
                                value={code}
                                required
                                maxLength={6}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="XXXXXX"
                                className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition"
                            />
                        </div>

                        {missingFieldCode && (
                            <p className="text-sm text-gray-500 mt-2">Potrebno je upisati <span className="font-bold">kod koji smo Vam poslali</span>, provjerite jeste li upisali svih 6 znakova.</p>
                        )}

                        {verifyError && (
                            <p className="text-sm text-red-500 mt-2">{verifyError}</p>
                        )}

                        <button
                            className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] shadow-amber-700/10 text-white font-medium rounded-lg py-2.5 px-4 mt-6 active:scale-[0.98] transition duration-200 w-full shadow-md disabled:opacity-60"
                            onClick={handleVerifyEmail}
                            disabled={verifyLoading}
                        >
                            {verifyLoading ? "Provjeravam..." : "Potvrdi kod"}
                        </button>
                    </>
                )}

                {!isLogin && registerStep === 3 && (
                    <>
                        <div className="text-center mb-2">
                            <h1 className="text-2xl font-bold text-gray-800">Račun potvrđen!</h1>
                            <p className="text-gray-500 mt-1 text-sm">Vaš račun je uspješno potvrđen. Sada se možete prijaviti.</p>
                        </div>

                        <button
                            className="cursor-pointer bg-linear-to-r from-[#c39d76] to-[#8B6B47] shadow-amber-700/10 text-white font-medium rounded-lg py-2.5 px-4 mt-6 active:scale-[0.98] transition duration-200 w-full shadow-md"
                            onClick={resetToLogin}
                        >
                            Natrag na prijavu
                        </button>
                    </>
                )}
            </div>
            {missingFieldsModalOpen && (
                <LoginModal
                    icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
                    onCancel={() => setMissingFieldsModalOpen(false)}
                    desc="Molim popunite oba polja. Prilikom registracije/prijave potrebno je popuniti oba polja kako bi se ista mogla izvršiti."
                />
            )}
            {registerModalOpen && (
                <LoginModal
                    icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
                    onCancel={() => setRegisterModalOpen(false)}
                    desc={`Registracija nije uspjela. Povratne informacije sustava - ${registrationError}.`}
                />
            )}
           {loginError && (
                <LoginModal
                    icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
                    onCancel={() => setLoginError("")}
                    desc={`Prijava nije uspjela, molim pokušajte ponovo. Povratne informacije sustava - ${loginError}`}
                />
            )}
            {forgetPasswordOpen && (
                <ForgetPassword onClose={() => setForgetPasswordOpen(false)} />
            )}
        </div>
    );
}

export default LoginPage;
