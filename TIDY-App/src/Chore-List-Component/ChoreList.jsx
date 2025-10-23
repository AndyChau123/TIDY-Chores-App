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
    dueDate: null,
    priority: "medium",
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function formatDateShort(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
  } catch {
    return dateStr;
  }
}

function ChoreList() {
  const [expanded, setExpanded] = useState(true);
  const [chores, setChores] = useState(seed.map(toChoreObject));

  const priorityColors = {
    low: "#D1FAE5",
    medium: "#FEF3C7",
    high: "#FECACA",
  };

  function handleAdd(newChore) {
    setChores((prev) => [newChore, ...prev]);
    setExpanded(true);
  }

  function toggleComplete(id) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  }

  // NEW: remove chore by id
  function removeChore(id) {
    setChores((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className={`chore-list-container ${expanded ? "expanded" : "collapsed"}`}>
      <div className="chore-list-header">
        <h2>Chores:</h2>
      </div>

      <div className="chore-list-add">
        <AddChore onAdd={handleAdd} />
      </div>

      {expanded && (
        <ul className="chore-list">
          {chores.map((chore) => {
            const displayDue = formatDateShort(chore.dueDate);
            return (
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

                    <div className="chore-item__content">
                      <div className="chore-item__title">{chore.title}</div>

                      <div className="chore-item__meta">
                        {displayDue ? (
                          <span className="due" title={chore.dueDate}>
                            {displayDue}
                          </span>
                        ) : null}

                        <span
                          className="priority-badge"
                          style={{ backgroundColor: priorityColors[chore.priority] }}
                          title={`Priority: ${chore.priority}`}
                        >
                          {chore.priority}
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* delete button — stop propagation so label/checkbox don't toggle */}
                  <button
                    className="chore-item__remove"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeChore(chore.id); }}
                    aria-label={`Delete ${chore.title}`}
                    title="Delete chore"
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ChoreList;
