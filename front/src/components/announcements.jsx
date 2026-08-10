import { useQueryClient, useQuery } from "@tanstack/react-query";
import announcementsData from "./announcementsData";
import { Sparkles } from "lucide-react";

const Announcements = ({page}) => {
    const queryClient = useQueryClient();

    const {data: userData } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await fetch("/api/me", {credentials: "include"});
            if (!response.ok) {throw new Error ("Greška prilikom dohvata podataka");}
            const data = await response.json();
            return data.user;
        },
    });

    if(!userData) return null;

    const seenAt = userData.seen_announcements?.[page];
    const registeredAt = userData.created_at;
    const relevant = announcementsData
        .filter(a => a.page === page && (!seenAt || new Date (a.date) > new Date(seenAt)))
        .filter(a => !registeredAt || new Date (a.date) > new Date (registeredAt))
        .sort((a, b) => new Date (a.date) - new Date (b.date))

    if (relevant.length === 0) return null;

    const dismiss = async () => {
        console.log("dismiss pozvan");
        try {
            const response = await fetch ("/api/me/announcement", {
                method: "PUT",
                headers: {"Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({page}),
            });
            if (!response.ok) {throw new Error("Greška prilikom slanja potvrde.");}
            queryClient.invalidateQueries(['user-profile']);
        } catch (error) {
            console.error("Greška prilikom slanja potvrde.", error)
        }
    };

    return (
        <div className="flex flex-col gap-2 mb-4">
            {relevant.map((item) => (
                <div key={item.id} className="flex items-start gap-3 bg-[#B8926A]/10 border border-[#B8926A]/30 rounded-2xl px-4 py-3.5">
                    <div className="flex-1 flex items-start gap-2">
                        <Sparkles className="hidden display:block w-5 h-5 text-[#B8926A]"/>
                        <div className="flex flex-col gap-0">
                            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                    <button onClick={dismiss} className="cursor-pointer text-gray-400 hover:text-gray-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Announcements;
