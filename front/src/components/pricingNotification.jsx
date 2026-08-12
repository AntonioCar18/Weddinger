import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

const PricingNotification = () => {
    const queryClient = useQueryClient();

    const { data: userData } = useQuery ({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await fetch ("/api/me", {credentials: 'include'});
            if (!response.ok) throw new Error ("Server Error");
            const data = await response.json();
            return data.user;
        },
    });

    if (!userData) return null;
    if (userData.pricing_onboarding) return null;

    const dismiss = async () => {
        try {
            const response = await fetch ("/api/me/pricing-onboarding", {
                method: "PUT",
                headers: {"Content-Type": "application/json" },
                credentials: 'include',
            });
            if (!response.ok) {throw new Error("Greška prilikom slanja potvrde.");}
            queryClient.invalidateQueries(['user-profile']);
        } catch (error) {
            console.error("Greška prilikom slanja potvrde.", error)
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-7 shadow-xl">
                <h2 className="font-display text-lg font-bold text-gray-900 mb-3"> 🎉 Započni sa korištenjem besplatnog perioda</h2>
                <div className="text-sm text-gray-600 leading-relaxed space-y-2.5 mb-6">
                    <p>Prije nego krenete ispunjavati Weddinger sa svojim podacima, dužni smo Vas i ovim putem obavijestiti da se <strong className="text-gray-800">Weddinger naplaćuje.</strong></p>
                    <p>Tarifa za korištenje aplikacije Weddnger je <strong className="text-gray-800">jednokratno 30 €</strong>. Nakon registracije imate <strong className="text-gray-800">3 dana besplatnog pristupa</strong> svim funkcionalnostima.</p>
                    <p>Nakon isteka probnog razdoblja, ako uplata nije izvršena, pristup se privremeno gasi. Ponuda za plaćanje vrijedi <strong className="text-gray-800">7 dana</strong> od registracije, a u slučaju da uplata ne stigne ni do tada, račun se <strong className="text-gray-800">trajno briše.</strong></p>
                    {userData.solo_offer_pdf_url && (
                        <p>Budući da ste se registrirali, ponuda s podacima za plaćanje već Vam je poslana na email — za svaki slučaj, ovdje je ponovno prilažemo: <a href={userData.solo_offer_pdf_url} target="_blank" rel="noopener noreferrer" className="text-[#B8926A] font-semibold hover:underline">preuzmite ponudu</a>.</p>
                    )}
                    <p>Više informacija možete pročitati u člancima 9. i 11. <a href="/terms" target="_blank" className="text-[#B8926A] font-semibold hover:underline">Uvjeta korištenja</a>.</p>
                </div>
                <button
                    onClick={dismiss}
                    className="cursor-pointer w-full bg-linear-to-br from-[#c39d76] to-[#8B6B47] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-[#B8926A]/20 hover:shadow-lg active:scale-97 transition-all duration-200"
                >
                    Razumijem
                </button>
            </div>
        </div>
    );
}

export default PricingNotification;
