import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { encode } from "base64-arraybuffer";

const loadFont = async (fontPath) => {
    const response = await fetch(fontPath);
    const buffer = await response.arrayBuffer();
    return encode(buffer);
};

const ExportTablesToPDF = async (guests, tables) => {
    if (!tables || !Array.isArray(tables)) return;

    const doc = new jsPDF();

    // Učitavanje fontova
    const robotoRegularBase64 = await loadFont("/fonts/Roboto/static/Roboto-Regular.ttf");
    const robotoBoldBase64 = await loadFont("/fonts/Roboto/static/Roboto-Bold.ttf");

    doc.addFileToVFS("Roboto-Regular.ttf", robotoRegularBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFileToVFS("Roboto-Bold.ttf", robotoBoldBase64);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
    doc.setFont("Roboto", "normal");

    // Naslov
    doc.setFont("Roboto", "bold");
    doc.setFontSize(18);
    doc.setTextColor(50);
    doc.text('Raspored gostiju po stolovima', 14, 20);

    let currentY = 30;

    // Petlja po parovima stolova
    for (let i = 0; i < tables.length; i += 2) {
        const leftTable = tables[i];
        const rightTable = tables[i + 1];

        // Provjera prostora za novu stranicu
        if (currentY > 220) {
            doc.addPage();
            currentY = 20;
        }

        const startY = currentY;

        // Lijeva kolona
        autoTable(doc, {
            startY: startY,
            margin: { left: 14, right: 115 },
            head: [[`Stol br. ${leftTable.table_number}`]],
            body: guests
            .filter(g => g.table_id === leftTable.id)
            .map(g => {
                let imeRedak = g.name;
                if (g.plus_one && g.plus_one_name) {
                    imeRedak += `\n${g.plus_one_name}`;
                }
                return [imeRedak];
            }),
            theme: 'grid',
            headStyles: { fillColor: [184, 146, 106], font: "Roboto", fontStyle: "bold" },
            styles: { fontSize: 10, font: "Roboto", cellPadding: 2 }
        });

        const leftHeight = doc.lastAutoTable.finalY;

        // Desna kolona (ako postoji)
        if (rightTable) {
            autoTable(doc, {
                startY: startY,
                margin: { left: 115, right: 14 },
                head: [[`Stol br. ${rightTable.table_number}`]],
                // ... i potpuno isto za desnu tablicu
                body: guests
                .filter(g => g.table_id === rightTable.id)
                .map(g => {
                let imeRedak = g.name;
                if (g.plus_one && g.plus_one_name) {
                    imeRedak += `\n${g.plus_one_name}`;
                }
                return [imeRedak];
            }),
                theme: 'grid',
                headStyles: { fillColor: [184, 146, 106], font: "Roboto", fontStyle: "bold" },
                styles: { fontSize: 10, font: "Roboto", cellPadding: 2 }
            });
        }

        const rightHeight = doc.lastAutoTable.finalY;

        // Pomakni se na dno najduže tablice u paru + razmak
        currentY = Math.max(leftHeight, rightHeight) + 10;
    }

    doc.save(`raspored_stolova_${new Date().toISOString().split('T')[0]}.pdf`);
};

export default ExportTablesToPDF;