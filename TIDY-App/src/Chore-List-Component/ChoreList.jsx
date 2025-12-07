import React, { useState, useEffect } from "react";
import "./ChoreList.css";
import AddChore from "../Add-Chore-Component/AddChore.jsx";
import {
  loadMainChores,
  saveMainChores,
  updateMainChores,
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

function ChoreList({ userId = "current-user-id", onQuestUpdate }) {
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
    // Ensure new chore has completedAt and completedBefore fields initialized
    const choreWithTimestamp = {
      ...newChore,
      completedAt: null,
      completedBefore: false  // Initialize as never completed
    };

    const updated = [choreWithTimestamp, ...chores];
    setChores(updated);
    await saveMainChores(updated);
  }

  // ============================================================================
  // FIXED: Toggle complete with timestamp tracking and quest integration
  // ============================================================================
  async function toggleComplete(id) {
    // Find the old chore to check completedBefore status
    const oldChore = chores.find(c => c.id === id);

    // Use helper function to properly toggle with timestamp
    const updated = chores.map((c) =>
      c.id === id ? toggleChoreCompletion(c) : c
    );

    // Update local state FIRST for responsive UI
    setChores(updated);

    // Save to Firebase
    await updateMainChores(updated);

    // Check if this is a FIRST-TIME completion
    const newChore = updated.find(c => c.id === id);
    const isFirstTimeCompletion =
      newChore.completed === true &&
      newChore.completedBefore === true &&
      oldChore?.completedBefore !== true;

    if (isFirstTimeCompletion) {
      console.log(`First-time completion detected: ${newChore.title}`);

      try {
        // Award coins (50 per chore)
        await addCurrency(userId, 50);

        // Update quest progress
        await onChoreCompleted(userId);

        // Notify parent to refresh quests/currency if callback provided
        if (onQuestUpdate) {
          onQuestUpdate();
        }

        // Show success message
        alert(`✅ Chore completed!\n+50 coins earned!`);
      } catch (error) {
        console.error("Error processing chore completion rewards:", error);
      }
    }
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
