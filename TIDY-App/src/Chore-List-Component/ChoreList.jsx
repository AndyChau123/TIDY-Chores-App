import React, { useState } from "react";
import "./ChoreList.css";

const chores = [
  "Wash dishes",
  "Vacuum living room",
  "Take out trash",
  "Laundry",
  "Clean bathroom",
];

function ChoreList() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`chore-list-container ${expanded ? "expanded" : "collapsed"}`}>
      <div className="chore-list-header">
        <h2>Chores:</h2>
        <button onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "\u25C0" : "\u25B6"}
        </button>
      </div>
      {expanded && (
        <ul className="chore-list">
          {chores.map((chore, idx) => (
            <li key={idx}>{chore}</li>
          ))}
        </ul>
      )}
      {/* <AddChore /> will go here in the future */}
    </div>
  );
}

export default ChoreList;
