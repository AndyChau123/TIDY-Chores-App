import React, { useState } from "react";
import "./MemberChoreList.css"; // NEW file

function MemberChoreList({ members, onUpdateMemberChores }) {
  const priorityColors = {
    low: "#D1FAE5",
    medium: "#FEF3C7",
    high: "#FECACA",
  };

  const [inputs, setInputs] = useState({});

  function handleAddChore(memberId) {
    const choreTitle = inputs[memberId]?.trim();
    if (!choreTitle) return;

    const newChore = {
      id: `${memberId}_${Date.now()}`,
      title: choreTitle,
      dueDate: null,
      priority: "medium",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const member = members.find((m) => m.id === memberId);
    const updated = [...(member.chores || []), newChore];
    onUpdateMemberChores(memberId, updated);

    setInputs({ ...inputs, [memberId]: "" });
  }

  function toggleComplete(memberId, choreId) {
    const member = members.find((m) => m.id === memberId);
    const updated = member.chores.map((c) =>
      c.id === choreId ? { ...c, completed: !c.completed } : c
    );
    onUpdateMemberChores(memberId, updated);
  }

  function removeChore(memberId, choreId) {
    const member = members.find((m) => m.id === memberId);
    const updated = member.chores.filter((c) => c.id !== choreId);
    onUpdateMemberChores(memberId, updated);
  }

  return (
    <div className="member-chore-lists">
      {members.map((member) => (
        <div key={member.id} className="member-chore-box">
          <div className="chore-list-container expanded">
            <div className="chore-list-header">
              <h2>{member.name || `Member ${member.id}`}</h2>
            </div>

            <ul className="chore-list">
              {(member.chores || []).map((chore) => (
                <li
                  key={chore.id}
                  className={`chore-item ${chore.completed ? "done" : ""}`}
                >
                  <div className="chore-item__row">
                    <label className="chore-item__label">
                      <input
                        type="checkbox"
                        checked={chore.completed}
                        onChange={() => toggleComplete(member.id, chore.id)}
                      />
                      <div className="chore-item__content">
                        <div className="chore-item__title">{chore.title}</div>
                        <div className="chore-item__meta">
                          <span
                            className="priority-badge"
                            style={{
                              backgroundColor: priorityColors[chore.priority],
                            }}
                          >
                            {chore.priority}
                          </span>
                        </div>
                      </div>
                    </label>
                    <button
                      className="chore-item__remove"
                      onClick={() => removeChore(member.id, chore.id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="chore-list-add">
              <input
                type="text"
                placeholder="Add chore"
                value={inputs[member.id] || ""}
                onChange={(e) =>
                  setInputs({ ...inputs, [member.id]: e.target.value })
                }
              />
              <button onClick={() => handleAddChore(member.id)}>Add</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MemberChoreList;
