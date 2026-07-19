export const allSuggestions = [
    { id: 1, title: "Popis gostiju", desc: "Obzirom da nisi dodao goste, možda bi trebao početi s time.", icon: "👥", condition: (data) => (data?.guests || 0) === 0},
    { id: 2, title: "Budžet", desc: "Obzirom da nisi dodao niti jednu stavku u budžet, možda bi trebao početi s time.", icon: "💰", condition: (data) => (data?.budget || 0) === 0},
    { id: 3, title: "Raspored po stolovima", desc: "Obzirom da ste već započeli sa dodavanjem ljudi, predlažemo da počnete dodavati stolove, a potom i raspoređivati goste po istima.", icon: "🪑", condition: (data) => (data?.guests || 0) > 0 && (data?.tables || 0) === 0},
    { id: 4, title: "Dodaj prvi zadatak", desc: "Vidimo da još uvijek nisi dodao svoj prvi zadatak, dodaj ga i kreni sa ispunjavanjem obveza", icon: "📝", condition: (data) => (data?.tasks.length || 0) === 0},
    { id: 5, title: "Završi svoj prvi zadatak", desc: "Vidimo da još uvijek nisi završio svoj prvi zadatak, završi ga i kreni sa ispunjavanjem obveza", icon: "✅", condition: (data) => (data?.tasks.length || 0) > 0 && (data?.tasks.filter(t => t.is_completed).length || 0) === 0},
];