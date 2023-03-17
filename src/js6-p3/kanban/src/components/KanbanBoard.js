import React from 'react';
import KanbanColumn from './KanbanColumn.js';

function KanbanBoard(props) {
  const {
    items, moveItem, editItem, saveItem,
    deleteItem, addItem
  } = props;

  const headers = ["TO DO", "IN PROGRESS", "COMPLETE", "APPROVED"];

  const columnComponents = headers.map((_, i) => {
    return (
      <KanbanColumn
        key={i}
        columnName={headers[i]}
        columnItems={items[i]}
        colNum={i}
        moveItem={moveItem}
        editItem={editItem}
        saveItem={saveItem}
        deleteItem={deleteItem}
        addItem={addItem}
      />
    );
  });

  return (
    <div className="kanban-board">{columnComponents}</div>
  );
}

export default KanbanBoard;