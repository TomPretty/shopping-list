import React, { useState, useEffect, useRef } from "react";

function ItemsForm({ items, addItem }) {
  const [quantity, setQuantity] = useState("");
  const [name, setName] = useState("");

  const quantityInput = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();

    addItem(parseInt(quantity), name);
    resetState();
    quantityInput.current.focus();
  }

  function resetState() {
    setQuantity("");
    setName("");
  }

  function handleQuantityChange(event) {
    setQuantity(event.target.value);
  }

  function handleNameChange(event) {
    setName(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row align-items-center font-weight-bold">
        <label className="col-3" htmlFor="quantityInput">
          Quantity
        </label>
        <div className="col-1"></div>
        <label className="col-8" htmlFor="nameInput">
          Name
        </label>
      </div>

      <div className="row align-items-center">
        <div className="col-3">
          <input
            id="quantityInput"
            type="number"
            className="form-control"
            onChange={handleQuantityChange}
            value={quantity}
            ref={quantityInput}
          />
        </div>
        <div className="col-1 text-center">&times;</div>
        <div className="col-8">
          <input
            id="nameInput"
            type="text"
            list="completions"
            className="form-control"
            onChange={handleNameChange}
            value={name}
          />
          <datalist id="completions">
            {items.map((item, index) => {
              return <option value={item.name} key={index} />;
            })}
          </datalist>
        </div>
      </div>

      <button type="submit" hidden>
        Submit
      </button>
    </form>
  );
}

function ItemsList({ items, updateItem, removeItem }) {
  return (
    <ul className="list-group">
      {items.map((item, index) => {
        return (
          <ItemsListItem
            item={item}
            key={index}
            index={index}
            update={item => updateItem(index, item)}
            remove={() => removeItem(index)}
          />
        );
      })}
    </ul>
  );
}

function ItemsListItem({ item, update, remove }) {
  const [state, setState] = useState("showing"); // showing | editing-quantity | editing-name
  const [newName, setNewName] = useState(item.name);
  const [newQuantity, setNewQuantity] = useState(item.quantity);

  function handleSubmit(event) {
    event.preventDefault();

    update({ name: newName, quantity: newQuantity });
    setState("showing");
  }

  return (
    <li className="list-group-item">
      <div className="row align-items-center">
        <div className="col-2 text-right">
          {state === "editing-quantity" ? (
            <form onSubmit={handleSubmit}>
              <input
                className="form-control form-control-sm"
                type="number"
                value={newQuantity}
                onChange={e => setNewQuantity(e.target.value)}
                onBlur={() => setState("showing")}
                ref={newNameInput => newNameInput && newNameInput.focus()}
              />
              <button type="submit" hidden>
                Submit
              </button>
            </form>
          ) : (
            <div onClick={() => setState("editing-quantity")}>
              {item.quantity}
            </div>
          )}
        </div>

        <div className="col-2 text-center">&times;</div>

        <div className="col-6">
          {state === "editing-name" ? (
            <form onSubmit={handleSubmit}>
              <input
                className="form-control form-control-sm"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onBlur={() => setState("showing")}
                ref={newNameInput => newNameInput && newNameInput.focus()}
              />
              <button type="submit" hidden>
                Submit
              </button>
            </form>
          ) : (
            <div onClick={() => setState("editing-name")}>{item.name}</div>
          )}
        </div>

        <div className="col-2">
          <button className="btn btn-outline-danger btn-sm" onClick={remove}>
            &times;
          </button>
        </div>
      </div>
    </li>
  );
}

function CopyToClipboardButton({ items }) {
  const [text, setText] = useState("Copy to clipboard");

  function copyToClipboard() {
    let textArea = document.createElement("textarea");
    textArea.value = itemsToString();
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    setText("Copied!");
    setTimeout(() => setText("Copy to clipboard"), 2000);
  }

  function itemsToString() {
    return items.map(item => `${item.quantity} x ${item.name}`).join("\n");
  }

  return (
    <div className="" style={{ width: "175px" }}>
      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={copyToClipboard}
      >
        {text}
      </button>
    </div>
  );
}

function App() {
  const [items, setItems] = useState(
    JSON.parse(localStorage.getItem("items")) || []
  );

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  function addItem(quantity, name) {
    let id = items.findIndex(item => item.name === name);
    if (id >= 0) {
      let item = items[id];
      updateItem(id, { ...item, quantity: item.quantity + quantity });
    } else {
      addNewItem(quantity, name);
    }
  }

  function addNewItem(quantity, name) {
    setItems([...items, { quantity: quantity, name: name }]);
  }

  function updateItem(index, item) {
    var newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  }

  function removeItem(id) {
    setItems(items.filter((_, i) => i !== id));
  }

  function startNewList() {
    setItems([]);
  }

  return (
    <div className="App d-flex flex-column container mt-5">
      <header className="d-flex align-items-center">
        <span className="h1" role="img" aria-label="shopping cart">
          &#128722;
        </span>
        <h1 className="ml-4">Build My Shopping List</h1>
      </header>

      <div className="mt-3">
        <ItemsForm items={items} addItem={addItem} />
      </div>

      <div className="mt-4">
        <ItemsList
          items={items}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      </div>
      <div className="d-flex justify-content-between mt-4">
        <CopyToClipboardButton items={items} />

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={startNewList}
        >
          Start new list
        </button>
      </div>
    </div>
  );
}

export default App;
