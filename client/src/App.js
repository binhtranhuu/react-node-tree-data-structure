import React, { useEffect, useState } from "react";
import axios from "axios";
import arrayToTree from "array-to-tree";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [listCategories, setListCategories] = useState([]);

  useEffect(() => {
    getListCategories();
  }, []);

  const getListCategories = async () => {
    const { data } = await axios.get(
      "http://localhost:8000/api/category/get-all"
    );
    setListCategories(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await axios.post("http://localhost:8000/api/category", {
      name,
      parent,
    });
    console.log(data);
  };

  const test = (arr) => {
    let arrNew = [];
    for (let i = 0; i < arr.length; i++) {
      const item = {
        key: arr[i]._id,
        title: arr[i].name,
        parent: arr[i].parent,
      };
      arrNew.push(item);
    }
    return arrNew;
  };

  const tree = arrayToTree(test(listCategories), {
    parentProperty: "parent",
    customID: "key",
  });

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category</label>
          <br />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            name="category"
          />

          <div>
            <label>Parent category</label>
            <br />
            <select
              onChange={(e) => setParent(e.target.value)}
              type="text"
              name="category"
            >
              <option>Please select</option>
              {listCategories.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit">Create</button>
      </form>
      <br />
      <div>
        <ul>
          {listCategories.map((c) => (
            <li key={c._id}>{c.name}</li>
          ))}
        </ul>
      </div>
      <hr />
      <h1>Test category</h1>
      {JSON.stringify(tree)}
    </div>
  );
}

export default App;
