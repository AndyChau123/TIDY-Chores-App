import React, { useState } from "react";
import "./MemberChoreList.css";
import { updateChoresInDB } from "../firebaseHelper";

// ============================================================================
// HELPER FUNCTION - Properly toggles chore with timestamp and completedBefore flag
// ============================================================================
export function toggleChoreCompletion(chore) {
  if (chore.completed) {
    // Unchecking - remove completed status and timestamp
    // BUT keep completedBefore flag so it won't count again
    return {
      ...chore,
      completed: false,
      completedAt: null  // Clear the timestamp
      // completedBefore stays TRUE if it was ever completed before
    };
  } else {
    // Checking - mark as complete with NEW unique timestamp
    return {
      ...chore,
      completed: true,
      completedAt: new Date().toISOString(),  // Add unique timestamp
      completedBefore: true  // Mark that this chore has been completed at least once
    };
  }
}

function MemberChoreList({ members, onUpdateMemberChores, userId }) {
  const priorityColors = {
    low: "#D1FAE5",
    medium: "#FEF3C7",
    high: "#FECACA",
  };

  const [inputs, setInputs] = useState({});

  async function handleAddChore(memberId) {
    const choreTitle = inputs[memberId]?.trim();
    if (!choreTitle) return;

    const newChore = {
      id: `${memberId}_${Date.now()}`,
      title: choreTitle,
      completed: false,
      completedAt: null,
      completedBefore: false,  // Initialize as never completed
      createdAt: new Date().toISOString(),
    };

    const member = members.find((m) => m.id === memberId);
    const updated = [newChore, ...(member.chores || [])];

    onUpdateMemberChores(memberId, updated);
    try {
      await updateChoresInDB(memberId, updated);
    } catch (error) {
      console.error("Error adding chore to Firestore:", error);
      alert("Failed to add chore. Check console for details.");
    }

    setInputs({ ...inputs, [memberId]: "" });
  }

  // ============================================================================
  // FIXED: Now uses toggleChoreCompletion to add timestamps and completedBefore
  // ============================================================================
  async function toggleComplete(memberId, choreId) {
    const member = members.find((m) => m.id === memberId);

    // Use the helper function to properly toggle with timestamp and flag
    const updated = member.chores.map((c) =>
      c.id === choreId ? toggleChoreCompletion(c) : c
    );

    // This will trigger App.jsx's handleUpdateMemberChores
    // which checks for new completions (completedBefore = false) and updates quests
    onUpdateMemberChores(memberId, updated);

    // Note: updateChoresInDB is called in App.jsx's handleUpdateMemberChores
    // so we don't need to call it here to avoid duplicate calls
  }

  async function removeChore(memberId, choreId) {
    const member = members.find((m) => m.id === memberId);
    const updated = member.chores.filter((c) => c.id !== choreId);

    onUpdateMemberChores(memberId, updated);
    try {
      await updateChoresInDB(memberId, updated);
    } catch (error) {
      console.error("Error removing chore from Firestore:", error);
      alert("Failed to remove chore. Check console for details.");
    }
  }

  return (
    <div className="member-chore-lists">
      {members.map((member) => (
        <div key={member.id} className="member-chore-box">
          <div className="chore-list-container expanded">
            <div className="chore-list-header">
              <h2>{member.name || `Member ${member.id}`}</h2>
            </div>

            <div className="chore-list-add">
              <input
                type="text"
                placeholder="Add chore"
                value={inputs[member.id] || ""}
                onChange={(e) =>
                  setInputs({ ...inputs, [member.id]: e.target.value })
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddChore(member.id);
                  }
                }}
              />
              <button onClick={() => handleAddChore(member.id)}>Add</button>
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
                        <div className="chore-item__title">
                          {chore.title}
                          {chore.completedBefore && !chore.completed && (
                            <small style={{
                              marginLeft: '8px',
                              color: '#6b7280',
                              fontSize: '11px'
                            }}>
                              (previously completed)
                            </small>
                          )}
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default MemberChoreList;
