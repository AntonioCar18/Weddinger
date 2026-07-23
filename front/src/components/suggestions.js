export const allSuggestions = [
    {
        id: 1,
        title: "Popis gostiju",
        desc: "Obzirom da nisi dodao goste, možda bi trebao početi s time.",
        icon: "👥",
        condition: (data) => (data?.guests || 0) === 0,
    },
    {
        id: 2,
        title: "Budžet",
        desc: "Obzirom da nisi dodao niti jednu stavku u budžet, možda bi trebao početi s time.",
        icon: "💰",
        condition: (data) => (data?.budget || 0) === 0,
    },
    {
        id: 3,
        title: "Dodaj prvi zadatak",
        desc: "Vidimo da još uvijek nisi dodao svoj prvi zadatak, dodaj ga i kreni sa ispunjavanjem obveza.",
        icon: "📝",
        condition: (data) => (data?.tasks?.length || 0) === 0,
    },
    {
        id: 4,
        title: "Raspored po stolovima",
        desc: "Obzirom da ste već započeli sa dodavanjem ljudi, predlažemo da počnete dodavati stolove, a potom i raspoređivati goste.",
        icon: "🪑",
        condition: (data) => (data?.guests || 0) > 0 && (data?.tables || 0) === 0,
    },
    {
        id: 5,
        title: "Završi svoj prvi zadatak",
        desc: "Vidimo da još uvijek nisi završio svoj prvi zadatak, završi ga i kreni sa ispunjavanjem obveza.",
        icon: "✅",
        condition: (data) => (data?.tasks?.length || 0) > 0 && (data?.tasks?.filter(t => t.is_completed).length || 0) === 0,
    },
    {
        id: 6,
        title: "Dodaj još gostiju",
        desc: "Trenutačno imaš samo par gostiju na popisu — dodaj ostatak kako bi lakše planirao/la raspored i budžet.",
        icon: "📋",
        condition: (data) => (data?.guests || 0) > 0 && (data?.guests || 0) < 5,
    },
    {
        id: 7,
        title: "Skoro gotovo!",
        desc: "Odlično napreduješ — preostalo je još samo par zadataka do potpune spremnosti.",
        icon: "🎉",
        condition: (data) => {
            const total = data?.tasks?.length || 0;
            const done = data?.tasks?.filter(t => t.is_completed).length || 0;
            return total > 0 && done < total && done / total >= 0.8;
        },
    },
    {
        id: 8,
        title: "Sve je spremno",
        desc: "Svi zadaci su dovršeni — provjeri još jednom budžet i goste kako bi bio/la sigurna da ništa ne nedostaje.",
        icon: "🥂",
        condition: (data) => {
            const total = data?.tasks?.length || 0;
            const done = data?.tasks?.filter(t => t.is_completed).length || 0;
            return total > 0 && done === total;
        },
    },
];