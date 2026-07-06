import { useState } from "react";
import weddingerLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Dashboard from "./dashboard";

const LoginPage = () => {

    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [partnerOne, setPartnerOne] = useState("");
    const [partnerTwo, setPartnerTwo] = useState("");


    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (email.trim() === "" || password.trim() === "") {
            alert("Molim popunite oba polja.");
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
                localStorage.setItem("user", JSON.stringify(data.user));
                // Navigate to Dashboard
                navigate("/dashboard");
            } else {
                alert(data.detail || "Prijava nije uspjela, molim pokušajte ponovo.");
            }
        } catch (error) {
            alert("Došlo je do greške na poslužitelju. Molim pokušajte ponovo.");
        }
    };

    const handleRegister = async () => {
        if (partnerOne.trim() === "" || partnerTwo.trim() === "" || email.trim() === "" || password.trim() === "") {
            alert("Molim popunite sva polja.");
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    partner_one: partnerOne, 
                    partner_two: partnerTwo,
                    email, 
                    password 
                }),
            });

            const data =  await response.json();

            if (response.ok) {
                alert("Registracija uspješna! Sada se možete prijaviti.");
                setIsLogin(true);
            } else {
                alert(data.detail || "Registracija nije uspjela, molim pokušajte ponovo.");
            }
        } catch (error) {
            alert("Došlo je do greške na poslužitelju. Molim pokušajte ponovo.");
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
                <div>
                    <img 
                        src={weddingerLogo}
                        alt="Weddinger Logo" 
                        className="w-48 mx-auto mb-6"
                    />
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dobrodošli u Weddinger!</h1>
                    <p className="text-gray-500 mt-1">
                        {isLogin ? "Unesite svoje podatke za prijavu" : "Registrirajte se kako biste koristili naše usluge"}
                    </p>
                </div>

                <div className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Ime mladenke</label>
                                <input 
                                    className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" 
                                    type="text"
                                    value={partnerOne}
                                    onChange={(e) => setPartnerOne(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Ime mladoženje</label>
                                <input 
                                    className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" 
                                    type="text"
                                    value={partnerTwo}
                                    onChange={(e) => setPartnerTwo(e.target.value)}
                                />
                            </div>
                        </>
                    )}
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
                        <input 
                            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 transition" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    className="cursor-pointer bg-[#B8926A] hover:bg-[#A37F58] shadow-amber-700/10 text-white font-medium rounded-lg py-2.5 px-4 mt-8 active:scale-[0.98] transition duration-200 w-full shadow-md" 
                    onClick={isLogin ? handleLogin : handleRegister}
                >
                    {isLogin ? "Prijavi se" : "Registriraj se"}
                </button> 
            </div>
        </div>
    );
}

export default LoginPage;