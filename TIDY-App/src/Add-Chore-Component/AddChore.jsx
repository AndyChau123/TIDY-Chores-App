import React, { useState } from "react";
import "./AddChore.css";

export default function AddChore({ onAdd }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  function reset() {
    setTitle('');
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a chore name.');
      return;
    }

    const newChore = {
      id: `chore_${Date.now()}`,
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    if (typeof onAdd === 'function') {
      try {
        onAdd(newChore);
      } catch (err) {
        console.error('onAdd threw an error:', err);
        setError('Failed to add chore — check console for details.');
        return;
      }
    }

    reset();
  }

  return (
    <form className="add-chore" onSubmit={handleSubmit} aria-label="Add a chore">
      <div className="add-chore__row">
        <label htmlFor="chore-title" className="add-chore__label">Chore</label>
        <input
          id="chore-title"
          className="add-chore__input"
          placeholder="e.g. Take out recycling"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          maxLength={120}
          autoComplete="off"
        />
      </div>

      {error && <div className="add-chore__error" role="alert">{error}</div>}

      <div className="add-chore__actions">
        <button type="submit" className="btn">Add chore</button>
      </div>
    </form>
  );
}
