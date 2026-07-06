import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
    const [auth, setAuth] = useState("loading");
    const location = useLocation(); // Slušamo promjenu rute

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/me", { credentials: 'include' });
                if (response.ok) {
                    setAuth("authorized");
                } else {
                    setAuth("unauthorized");
                }
            } catch {
                setAuth("unauthorized");
            }
        };

        checkAuth();
    }, [location]); // <--- KLJUČ: Svaki put kad se promijeni URL, ponovno provjeri!

    if (auth === "loading") return <div>Učitavam...</div>;
    
    // Ako nije autoriziran, ovo će te TRENUTNO izbaciti van, bez obzira na Sidebar
    return auth === "authorized" ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;