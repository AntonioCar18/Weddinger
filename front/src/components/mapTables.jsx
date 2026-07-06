import React from "react";
import TableCard from "./cardTable";

const WeddingMap = ({ tables, allGuests, onDrop, onRemoveGuest, onEditTable }) => {
    const handleDragOver = (e) => e.preventDefault();

    const getOccupancy = (tableId) => {
        return allGuests
            .filter(g => g.table_id === tableId)
            .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 lg:p-10">
            {tables.map((table) => {
                const guestsAtTable = allGuests.filter(g => g.table_id === table.id);
                const occupancy = getOccupancy(table.id);

                return (
                    <div key={table.id} className="h-full">
                        <TableCard
                            table={table}
                            onClick={() => onEditTable(JSON.parse(JSON.stringify(table)))}
                            guestsAtTable={guestsAtTable}
                            totalCount={occupancy}
                            onDragOver={handleDragOver}
                            onRemoveGuest={onRemoveGuest}
                            onDrop={(e) => {
                                const guestId = Number(e.dataTransfer.getData("guestId"));
                                const guest = allGuests.find(g => g.id === guestId);
                                const guestSize = 1 + (guest?.plus_one ? 1 : 0);

                                if (occupancy + guestSize > table.capacity) {
                                    alert(`Stol ${table.table_number} je popunjen.`);
                                    return;
                                }
                                onDrop(e, table.id);
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default WeddingMap;