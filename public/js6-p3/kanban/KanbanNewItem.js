const KanbanNewItem = (props) => { 
  const { colNum, addItem } = props;

  const [color, setColor] = useState("green");

  const handleSelectColor = (selectedColor) => {
    console.log(selectedColor);
    setColor(selectedColor);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formJson = Object.fromEntries(formData.entries());
    addItem(colNum, formJson.newItemText, formJson.newItemColor); // from 'name' props
  };

  return (
    <div className={"new-item " + color}>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="radio-group">
            <input
              id={"input1-" + colNum}
              type="radio"
              className="color-input"
              name="newItemColor"
              value="green"
              defaultChecked
            />
            <label
              htmlFor={"input1-" + colNum}
              className="color-input green"
              onClick={() => handleSelectColor("green")}
            ></label>
            <input
              id={"input2-" + colNum}
              type="radio"
              className="color-input"
              name="newItemColor"
              value="yellow"
            />
            <label
              htmlFor={"input2-" + colNum}
              className="color-input yellow"
              onClick={() => handleSelectColor("yellow")}
            ></label>
            <input
              id={"input3-" + colNum}
              type="radio"
              className="color-input"
              name="newItemColor"
              value="orange"
            />
            <label
              htmlFor={"input3-" + colNum}
              className="color-input orange"
              onClick={() => handleSelectColor("orange")}
            ></label>
            <input
              id={"input4-" + colNum}
              type="radio"
              className="color-input"
              name="newItemColor"
              value="red"
            />
            <label
              htmlFor={"input4-" + colNum}
              className="color-input red"
              onClick={() => handleSelectColor("red")}
            ></label> 
          </div> 
          <button className="new-item-submit" type="submit">
            <span className={"material-symbols-outlined"}>add</span>
          </button>
        </div>
        <textarea name="newItemText" type="text" />
      </form>
    </div>
  );
}