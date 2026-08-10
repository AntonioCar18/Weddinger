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

    const buildBody = (table) => guests
        .filter(g => g.table_id === table.id)
        .map(g => {
            let imeRedak = g.name;
            if (g.plus_one && g.plus_one_name) {
                imeRedak += `\n${g.plus_one_name}`;
            }
            return [imeRedak];
        });

    const tableOptions = {
        theme: 'grid',
        headStyles: { fillColor: [184, 146, 106], font: "Roboto", fontStyle: "bold" },
        styles: { fontSize: 10, font: "Roboto", cellPadding: 2 },
        // Ne cijepaj listu gostiju jednog stola nasred - ako ne stane, cijela tablica ide na novu stranicu
        pageBreak: 'avoid',
    };

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
        const pageBeforeLeft = doc.internal.getNumberOfPages();

        // Lijeva kolona
        autoTable(doc, {
            startY: startY,
            margin: { left: 14, right: 115 },
            head: [[`Stol br. ${leftTable.table_number}`]],
            body: buildBody(leftTable),
            ...tableOptions,
        });

        const leftEndPage = doc.internal.getNumberOfPages();
        const leftHeight = doc.lastAutoTable.finalY;

        let rightHeight = leftHeight;

        if (rightTable) {
            // Ako je lijeva tablica interno prebacila dokument na novu stranicu (jer se nije uklopila),
            // desna tablica mora krenuti na TOJ istoj novoj stranici, ne na staroj startY poziciji.
            const leftMovedPage = leftEndPage > pageBeforeLeft;
            const rightStartY = leftMovedPage ? 20 : startY;

            if (leftMovedPage) {
                doc.setPage(leftEndPage);
            }

            const pageBeforeRight = doc.internal.getNumberOfPages();

            // Desna kolona
            autoTable(doc, {
                startY: rightStartY,
                margin: { left: 115, right: 14 },
                head: [[`Stol br. ${rightTable.table_number}`]],
                body: buildBody(rightTable),
                ...tableOptions,
            });

            rightHeight = doc.lastAutoTable.finalY;

            const rightMovedPage = doc.internal.getNumberOfPages() > pageBeforeRight;
            if (rightMovedPage) {
                // Desna je sama otišla na novu stranicu (dok lijeva nije) - prati tu novu poziciju
                currentY = rightHeight + 10;
                continue;
            }
        }

        // Pomakni se na dno najduže tablice u paru + razmak
        currentY = Math.max(leftHeight, rightHeight) + 10;
    }

    doc.save(`raspored_stolova_${new Date().toISOString().split('T')[0]}.pdf`);
};

export default ExportTablesToPDF;