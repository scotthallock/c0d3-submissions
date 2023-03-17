import React from 'react';
import KanbanBoard from './KanbanBoard.js';
import defaultItems from './defaultItems.js';

const { useState, useEffect } = React;

function KanbanApp() {
  const store = localStorage["items"];
  const [items, setItems] = useState((store && JSON.parse(store)) || defaultItems);

  useEffect(() => {
    localStorage["items"] = JSON.stringify(items);
  });

  const handleMoveItem = (colNum, itemNum, dir) => {
    const nextItems = [...items];
    const removedItem = nextItems[colNum].splice(itemNum, 1)[0];

    let newColNum = colNum;
    if (dir === "LEFT") newColNum--;
    else newColNum++;
    nextItems[newColNum].push(removedItem);
    setItems(nextItems);
  };

  const handleDeleteItem = (colNum, itemNum) => {
    const nextItems = [...items];
    nextItems[colNum].splice(itemNum, 1);
    setItems(nextItems);
  };

  const handleEditItem = (colNum, itemNum) => {
    const nextItems = [...items];
    nextItems[colNum][itemNum].editing = true;
    setItems(nextItems);
  };

  const handleSaveItem = (colNum, itemNum, newContent) => {
    const nextItems = [...items];
    nextItems[colNum][itemNum].text = newContent;
    nextItems[colNum][itemNum].editing = false;
    setItems(nextItems);
  };

  const handleAddItem = (colNum, text, color) => {
    const newItem = {
      id: 'idk',
      text: text,
      color: color || "yellow",
      time: Date.now()
    };
    const nextItems = [...items];
    nextItems[colNum].push(newItem);
    setItems(nextItems);
  };

  return (
    <KanbanBoard
      items={items}
      moveItem={handleMoveItem}
      deleteItem={handleDeleteItem}
      editItem={handleEditItem}
      saveItem={handleSaveItem}
      addItem={handleAddItem}
    />
  );
}

export default KanbanApp;