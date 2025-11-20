import React, { useState } from "react";
import "./ChoreList.css";
import AddChore from "../Add-Chore-Component/AddChore.jsx";

const seed = [
  "Wash dishes",
  "Vacuum living room",
  "Take out trash",
  "Laundry",
  "Clean bathroom",
];

function toChoreObject(title, idx) {
  return {
    id: `seed_${idx}`,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function ChoreList() {
  const [chores, setChores] = useState(seed.map(toChoreObject));

  function handleAdd(newChore) {
    setChores((prev) => [newChore, ...prev]);
  }

  function toggleComplete(id) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  }

  function removeChore(id) {
    setChores((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="chore-list-container">
      <div className="chore-list-header">
        <h2>Chores</h2>
      </div>

      <AddChore onAdd={handleAdd} />

      <ul className="chore-list">
        {chores.map((chore) => (
          <li
            key={chore.id}
            className={`chore-item ${chore.completed ? "done" : ""}`}
          >
            <div className="chore-item__row">
              <label className="chore-item__label">
                <input
                  type="checkbox"
                  className="chore-item__checkbox"
                  checked={chore.completed}
                  onChange={() => toggleComplete(chore.id)}
                  aria-label={`Mark ${chore.title} complete`}
                />
                <div className="chore-item__title">{chore.title}</div>
              </label>

              <button
                className="chore-item__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeChore(chore.id);
                }}
                aria-label={`Delete ${chore.title}`}
                title="Delete chore"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChoreList;
