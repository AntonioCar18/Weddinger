import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { encode } from "base64-arraybuffer";

const loadFont = async (fontPath) => {
    const response = await fetch(fontPath);
    const buffer = await response.arrayBuffer();
    return encode(buffer);
};

const ExportGuestsToPDF = async (guests) => {
    const doc = new jsPDF();

    // Učitavamo i obični i podebljani font iz lokalnog foldera
    const robotoRegularBase64 = await loadFont("/fonts/Roboto/static/Roboto-Regular.ttf");
    const robotoBoldBase64 = await loadFont("/fonts/Roboto/static/Roboto-Bold.ttf");

    // Registracija običnog fonta
    doc.addFileToVFS("Roboto-Regular.ttf", robotoRegularBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

    // Registracija bold fonta (ključno je proslijediti "bold" na kraju)
    doc.addFileToVFS("Roboto-Bold.ttf", robotoBoldBase64);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

    // Postavljanje zadanog fonta na Roboto
    doc.setFont("Roboto", "normal");

    doc.setFont("Roboto", "bold");
    doc.setFontSize(18);
    doc.text('Popis uzvanika na vjenčanju', 14, 22); 

    doc.setFont("Roboto", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Ukupno uzvanika: ' + (guests?.length + (guests?.filter(g => g.plus_one).length || 0)), 14, 30);

    const tableColumn = [
        "Ime i prezime",
        "Ime i prezime pratnje",
        "Meni",
        "Broj telefona",
        "Napomena"
    ];

    const tableRows = [];
    guests.forEach(guest => {
        let meniColumn = "";
        const ime = guest.name.split('')[0];
        const meni = guest.menu_type;
        if(guest.plus_one){
            const ime_gost = guest.plus_one_name.split('')[0];
            const meni_gost = guest.menu_type_plus_one || "Standard";
            meniColumn = `${ime}: ${meni} \n${ime_gost}: ${meni_gost}`;
        }
        else{
            meniColumn = `${ime}: ${meni}`;
        }
        const guestData = [
            guest.name,
            guest.plus_one_name || "N/A",
            meniColumn,
            guest.phone || "N/A",
            guest.notes || "N/A"
        ];
        tableRows.push(guestData);
    });

    autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        headStyles: { 
            fillColor: [184, 146, 106], 
            textColor: [255, 255, 255],
            fontStyle: "bold",
            font: "Roboto"
        },
        styles: { fontSize: 10, cellPadding: 3, font: "Roboto" },
        alternateRowStyles: { fillColor: [252, 251, 250] } 
    });

    doc.save(`popis_gostiju_${new Date().toISOString().split('T')[0]}.pdf`);
};

export default ExportGuestsToPDF;