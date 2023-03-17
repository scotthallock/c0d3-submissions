import React from 'react';

function KanbanItem(props) {
  const {
    color, content, colNum, itemNum,
    moveItem, editItem, editing, saveItem,
    deleteItem
  } = props;

  let newContent = content;

  const handleKeyUp = (e) => {
    newContent = e.currentTarget.textContent;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      saveItem(colNum, itemNum, newContent);
    }
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
        tabIndex={-1}
        contentEditable={editing}
        suppressContentEditableWarning={true}
        onKeyDown={(e) => handleKeyDown(e)}
        onKeyUp={(e) => handleKeyUp(e)}
      >
        {content}
      </div>
      <div className="menu">
        <button
          onClick={() => moveItem(colNum, itemNum, "LEFT")}
          disabled={colNum === 0}
        >
          <span className="material-symbols-outlined">west</span>
        </button>
        <button
          onClick={() => moveItem(colNum, itemNum, "RIGHT")}
          disabled={colNum === 3}
        >
          <span className="material-symbols-outlined">east</span>
        </button>
        <button
          onClick={handleEditClick}
          className={editing ? "editing" : ""}
        >
          <span className={"material-symbols-outlined"}>edit</span>
        </button>
        <button
          onClick={() => deleteItem(colNum, itemNum)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}

export default KanbanItem;