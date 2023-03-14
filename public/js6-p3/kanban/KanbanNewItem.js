const KanbanNewItem = (props) => { 
  const { colNum, addItem } = props;

  const colors = ["green", "yellow", "orange", "red"];
  const [color, setColor] = useState(colors[0]);
  const textAreaRef = useRef(null);

  const handleSelectColor = (selectedColor) => {
    console.log(selectedColor);
    setColor(selectedColor);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formJson = Object.fromEntries(formData.entries());
    addItem(colNum, formJson.newItemText, formJson.newItemColor); // from "name" props
    textAreaRef.current.value = ''; // clear <textarea>
  };

  const radioButtons = colors.map((color, i) => {
    return (
      <div key={"" + i + colNum}>
        <input
          id={"input" + i + "-" + colNum}
          type="radio"
          className="color-input"
          name="newItemColor"
          value={color}
          defaultChecked={i === 0}
        />
        <label
          htmlFor={"input" + i + "-" + colNum}
          className={"color-input " + color}
          onClick={() => handleSelectColor(color)}
        ></label>
      </div>
    );
  });

  return (
    <div className={"new-item " + color}>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="radio-group">
            {radioButtons}
          </div> 
          <button className="new-item-submit" type="submit">
            <span className={"material-symbols-outlined"}>add</span>
          </button>
        </div>
        <textarea ref={textAreaRef} name="newItemText" type="text" />
      </form>
    </div>
  );
}