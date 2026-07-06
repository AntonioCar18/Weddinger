import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { encode } from "base64-arraybuffer";

const loadFont = async (fontPath) => {
    const response = await fetch(fontPath);
    const buffer = await response.arrayBuffer();
    return encode(buffer);
};

const ExportPDFBudget = async (items) => {
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
    doc.text('Troškovnik vjenčanja', 14, 22); 

    doc.setFont("Roboto", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Popis troškova po kategorijama', 14, 30);

    const tableColumn = [
        "Naziv stavke",
        "Kategorija",
        "Cijena [€]",
        "Kapara [€]",
        "Status"
    ];

    const tableRows = [];
    items.forEach(item => {     
        const itemData = [
            item.item_title,
            item.item_category,
            item.item_amount,
            item.item_deposit,
            item.item_status
        ];
        tableRows.push(itemData);
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

    doc.save(`popis_troškova_${new Date().toISOString().split('T')[0]}.pdf`);
};

export default ExportPDFBudget;