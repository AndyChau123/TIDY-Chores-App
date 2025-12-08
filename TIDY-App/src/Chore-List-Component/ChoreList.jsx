import React, { useState, useEffect } from "react";
import "./ChoreList.css";
import AddChore from "../Add-Chore-Component/AddChore.jsx";
import {
  loadMainChores,
  saveMainChores,
  updateMainChores,
  getUserName,
  saveUserName,
} from "../firebaseHelper";

// Import quest and currency functions
import {
  addCurrency,
  onChoreCompleted
} from '../questCurrencyHelper';

// ============================================================================
// HELPER FUNCTION - Properly toggles chore with timestamp and completedBefore flag
// ============================================================================
function toggleChoreCompletion(chore) {
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

function ChoreList({ userId = "current-user-id", familyId, onQuestUpdate }) {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use familyId if provided, otherwise fall back to userId
  const effectiveFamilyId = familyId || userId;

  // ============================================================================
  // USER NAME STATE
  // ============================================================================
  const [userName, setUserName] = useState("Chores");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    async function load() {
      if (!effectiveFamilyId) {
        setLoading(false);
        return;
      }

      try {
        // Load chores FOR THIS FAMILY
        const stored = await loadMainChores(effectiveFamilyId);
        setChores(stored);

        // Load user name
        const name = await getUserName(effectiveFamilyId);
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error("Error loading data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [effectiveFamilyId]);

  // ============================================================================
  // NAME EDITING FUNCTIONS
  // ============================================================================
  function handleNameClick() {
    setNameInput(userName === "Chores" ? "" : userName);
    setIsEditingName(true);
  }

  async function handleNameSave() {
    const trimmedName = nameInput.trim();
    const newName = trimmedName || "Chores";

    setUserName(newName);
    setIsEditingName(false);

    try {
      await saveUserName(effectiveFamilyId, newName);
    } catch (error) {
      console.error("Error saving user name:", error);
    }
  }

  function handleNameKeyPress(e) {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  }

  // ============================================================================
  // CHORE FUNCTIONS
  // ============================================================================

  // Add a chore
  async function handleAdd(newChore) {
    // Ensure new chore has completedAt and completedBefore fields initialized
    const choreWithTimestamp = {
      ...newChore,
      completedAt: null,
      completedBefore: false  // Initialize as never completed
    };

    const updated = [choreWithTimestamp, ...chores];
    setChores(updated);
    await saveMainChores(effectiveFamilyId, updated);
  }

  // Toggle complete with timestamp tracking and quest integration
  async function toggleComplete(id) {
    // Find the old chore to check completedBefore status
    const oldChore = chores.find(c => c.id === id);

    // Use helper function to properly toggle with timestamp
    const updated = chores.map((c) =>
      c.id === id ? toggleChoreCompletion(c) : c
    );

    // Update local state FIRST for responsive UI
    setChores(updated);

    // Save to Firebase WITH familyId
    await updateMainChores(effectiveFamilyId, updated);

    // Check if this is a FIRST-TIME completion
    const newChore = updated.find(c => c.id === id);
    const isFirstTimeCompletion =
      newChore.completed === true &&
      newChore.completedBefore === true &&
      oldChore?.completedBefore !== true;

    if (isFirstTimeCompletion) {
      console.log(`First-time completion detected: ${newChore.title}`);

      try {
        // Update quest progress
        await onChoreCompleted(effectiveFamilyId);

        // Notify parent to refresh quests/currency if callback provided
        if (onQuestUpdate) {
          onQuestUpdate();
        }

        // Show success message
        alert(`✅ Chore completed!`);
      } catch (error) {
        console.error("Error processing chore completion rewards:", error);
      }
    }
  }

  // Remove a chore
  async function removeChore(id) {
    const updated = chores.filter((c) => c.id !== id);
    setChores(updated);
    await updateMainChores(effectiveFamilyId, updated);
  }

  if (loading) return <p>Loading chores...</p>;

  return (
    <div className="chore-list-container">
      <div className="chore-list-header">
        {isEditingName ? (
          <input
            type="text"
            className="name-edit-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyPress}
            autoFocus
            placeholder="Enter your name"
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '4px 8px',
              outline: 'none',
              width: '100%',
              maxWidth: '200px'
            }}
          />
        ) : (
          <h2
            onClick={handleNameClick}
            style={{
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            title="Click to edit name"
            onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
            onMouseLeave={(e) => e.target.style.color = ''}
          >
            {userName === "Chores" ? "Chores" : `${userName}`}
          </h2>
        )}
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
