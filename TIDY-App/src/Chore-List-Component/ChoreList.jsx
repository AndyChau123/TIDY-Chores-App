import React, { useState, useEffect } from "react";
import "./ChoreList.css";
import AddChore from "../Add-Chore-Component/AddChore.jsx";
import {
  loadMainChores,
  saveMainChores,
  updateMainChores,
} from "../firebaseHelper";

function ChoreList() {
  const [chores, setChores] = useState([]);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stored = await loadMainChores();
        setChores(stored);
      } catch (error) {
        console.error("Error loading chores from Firestore:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Add a chore
  async function handleAdd(newChore) {
    const updated = [newChore, ...chores];
    setChores(updated);
    await saveMainChores(updated);
  }

  // Toggle complete
  async function toggleComplete(id) {
    const updated = chores.map((c) =>
      c.id === id ? { ...c, completed: !c.completed } : c
    );
    setChores(updated);
    await updateMainChores(updated);
  }

  // Remove a chore
  async function removeChore(id) {
    const updated = chores.filter((c) => c.id !== id);
    setChores(updated);
    await updateMainChores(updated);
  }

  if (loading) return <p>Loading chores...</p>;

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
