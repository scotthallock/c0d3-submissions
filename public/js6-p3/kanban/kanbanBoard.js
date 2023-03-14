const { useState } = React;

const ITEMS = [
  [
      {
          text: "The Eurasian carp or European carp (Cyprinus carpio), widely known as the common carp, is a widespread freshwater fish of eutrophic waters in lakes and large rivers in Europe and Asia.",
          color: "green",
          editing: false,
      },
      {
          text: "The common carp is native to Europe and Asia and has been introduced to every part of the world except the poles.",
          color: "yellow",
          editing: false,
      }
  ],
  [
      {
          text: "They are the third most frequently introduced fish species worldwide.",
          color: "orange",
          editing: false,
      },
      {
          text: "Their history as a farmed fish dates back to Roman times.",
          color: "red",
          editing: false,
      }
  ],
  [
      {
          text: "The original common carp was found in the inland delta of the Danube River about 2000 years ago and was torpedo-shaped and golden-yellow in colour.",
          color: "yellow",
          editing: false,
      },
      {
          text: "It had two pairs of barbels and a mesh-like scale pattern.",
          color: "orange",
          editing: false,
      },
      {
        text: "The common carp's native range also extends to the Black Sea, Caspian Sea, and Aral Sea.",
        color: "yellow",
        editing: false,
      }
  ],
  [
      {
          text: "The mouth of the carp is downwards-turned, with two pairs of barbels, the ones on the bottom being larger.",
          color: "orange",
          editing: false,
      },
      {
          text: "Common carp can grow to very large sizes if given adequate space and nutrients.",
          color: "green",
          editing: false,
      },
      {
        text: "The largest recorded carp, caught by British angler, Colin Smith, in 2013 at Etang La Saussaie Fishery, France, weighed 45.59 kilograms (100.5 lb).",
        color: "red",
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
  const [color, setColor] = useState("green");

  const handleSelectColor = (selectedColor) => {
    console.log(selectedColor);
    setColor(selectedColor);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formJson = Object.fromEntries(formData.entries());
    const newItemText = formJson["content"]; // from the 'name' prop
    const newItemColor = formJson["color-input"];
    addItem(colNum, newItemText, newItemColor);
  };

  return (
    <div className={"new-item " + color}>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="radio-group">
            <input id={"input1-" + colNum} type="radio" className="color-input" name="color-input" value="green" defaultChecked/>
            <label htmlFor={"input1-" + colNum} className="color-input green" onClick={() => handleSelectColor("green")}></label>
            <input id={"input2-" + colNum} type="radio" className="color-input" name="color-input" value="yellow"/>
            <label htmlFor={"input2-" + colNum} className="color-input yellow" onClick={() => handleSelectColor("yellow")}></label>
            <input id={"input3-" + colNum} type="radio" className="color-input" name="color-input" value="orange"/>
            <label htmlFor={"input3-" + colNum} className="color-input orange" onClick={() => handleSelectColor("orange")}></label>
            <input id={"input4-" + colNum} type="radio" className="color-input" name="color-input" value="red"/>
            <label htmlFor={"input4-" + colNum} className="color-input red" onClick={() => handleSelectColor("red")}></label> 
          </div> 
          <button className="new-item-submit" type="submit">
            <span className={"material-symbols-outlined"}>add</span>
          </button>
        </div>
        <textarea name="content" type="text" />
      </form>
    </div>
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
};

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);
