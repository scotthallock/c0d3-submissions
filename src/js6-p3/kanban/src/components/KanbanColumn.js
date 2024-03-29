import React from 'react';
import KanbanItem from './KanbanItem.js';
import KanbanNewItem from './KanbanNewItem.js';

function KanbanColumn(props) {
  const {
    columnName, columnItems, colNum, moveItem,
    editItem, saveItem, deleteItem, addItem
  } = props;

  const itemComponents = columnItems.map((item, i) => {
    return (
      <KanbanItem
        key={i}
        itemId={item.id}
        color={item.color}
        content={item.text}
        editing={item.editing}
        colNum={colNum}
        itemNum={i}
        moveItem={moveItem}
        editItem={editItem}
        saveItem={saveItem}
        deleteItem={deleteItem}
      />
    );
  });

  return (
    <div className="kanban-column">
      <h1>{columnName}</h1>
      <div className="items">
        {itemComponents}
        <KanbanNewItem
          colNum={colNum}
          addItem={addItem}
        />
      </div>
    </div>
  );
}

export default KanbanColumn;