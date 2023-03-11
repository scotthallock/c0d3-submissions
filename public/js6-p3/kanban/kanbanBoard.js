const { useState, useRef } = React;

const ITEMS = [
  [
      {
          id: 1,
          text: 'this is my first todo item',
          color: "green",
          editing: false,
      },
      {
          id: 2,
          text: 'this is my second todo item',
          color: "yellow",
          editing: false,
      }
  ],
  [
      {
          id: 3,
          text: 'this is my first in progress item',
          color: "orange",
          editing: false,
      },
      {
          id: 4,
          text: 'this is my second in progress item',
          color: "red",
          editing: false,
      }
  ],
  [
      {
          id: 5,
          text: 'this is my first complete item',
          color: "yellow",
          editing: false,
      },
      {
          id: 6,
          text: 'this is my second complete item',
          color: "orange",
          editing: false,
      }
  ],
  [
      {
          id: 7,
          text: 'this is my first in review item',
          color: "orange",
          editing: false,
      },
      {
          id: 8,
          text: 'this is my second in review item',
          color: "green",
          editing: false,
      }
  ]
];

const KanbanItem = ({ itemId, color, content, colNum, itemNum, moveItem, editItem, editing, saveItem, deleteItem }) => {
  let newContent = content;

  const handleInput = (e) => {
    newContent = e.currentTarget.textContent
  };

  const handleEditClick = () => {
    if (editing) {
      return saveItem(colNum, itemNum, newContent);
    }
    editItem(colNum, itemNum);
  };

  return (
    <div className={"kanban-item" + (editing ? " editing" : "") + " " + color}>
      <div
        className={"content" + (editing ? " editing" : "")}
        contentEditable={editing}
        suppressContentEditableWarning={true}
        onInput={(e) => handleInput(e)}
        onBlur={() => saveItem(colNum, itemNum, newContent)}
        value={content}
      >
        {content}
      </div>
      <div className="menu">
        <button onClick={() => moveItem(colNum, itemNum, "LEFT")} disabled={colNum === 0}>
          <span className="material-symbols-outlined">west</span>
        </button>
        <button onClick={() => moveItem(colNum, itemNum, "RIGHT")} disabled={colNum === 3}>
          <span className="material-symbols-outlined">east</span>
        </button>
        <button onClick={handleEditClick} className={editing ? "editing" : ""}>
          <span className={"material-symbols-outlined"}>edit</span>
        </button>
        <button onClick={() => deleteItem(colNum, itemNum)}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

const KanbanNewItem = ({ colNum, addItem }) => { 
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formJson = Object.fromEntries(formData.entries());

    const newItemText = formJson["input"]; // "input" comes from the name prop
    addItem(colNum, newItemText);
  };
  return (
    <form className="kanban-new-item" onSubmit={handleSubmit}>
      <input name="input" type="text" />
      <button className="new-item-submit" type="submit">Add</button>
    </form>
  );
};

const KanbanColumn = ({ columnName, columnItems, colNum, moveItem, editItem, saveItem, deleteItem, addItem }) => {
  const itemComponents =
    columnItems.map((item, i) => {
      return (
        <KanbanItem
          key={i} // need this?
          itemId={item.id}
          color={item.color}
          content={item.text}
          colNum={colNum}
          itemNum={i}
          moveItem={moveItem}
          editItem={editItem}
          editing={item.editing}
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
};

const KanbanBoard = ({ items, moveItem, editItem, saveItem, deleteItem, addItem }) => {
  const headers = ["TO DO", "IN PROGRESS", "COMPLETE", "APPROVED"];
  const columnComponents =
    items.map((_, i) => {
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

  return <div className="kanban-board">{columnComponents}</div>;
};

const App = () => {
  const [items, setItems] = useState(ITEMS);

  const handleMoveItem = (colNum, itemNum, dir) => {
    const nextItems = [...items];
    const removedItem = nextItems[colNum].splice(itemNum, 1)[0];
    if (dir === "LEFT") colNum--;
    else colNum++;
    nextItems[colNum].push(removedItem);
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
    console.log('saving');
  };

  const handleAddItem = (colNum, text) => {
    const newItem = {
      id: 'idk',
      text: text,
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
};

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);
