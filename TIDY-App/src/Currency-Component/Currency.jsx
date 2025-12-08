import React from 'react';
import './Currency.css'; // Your existing CSS file
import coinsIcon from '../assets/coins.png';

// ============================================================================
// UPDATED CURRENCY COMPONENT
// This component now receives currency data as props instead of fetching it
// ============================================================================

function Currency({ userId, balance, loading, onRefresh }) {
  // Show loading state while currency is being fetched
  if (loading) {
    return (
      <div className="currency-container">
        <div className="currency-display loading">
          <img src={coinsIcon} alt="Coins" className="currency-icon" />
          <span className="currency-amount">--</span>
          <span className="currency-label">Coins</span>
        </div>
      </div>
    );
  }

  return (
    <div className="currency-container">
      <div className="currency-display">
        <img src={coinsIcon} alt="Coins" className="currency-icon" />
        <span className="currency-amount">{balance || 0}</span>
        <span className="currency-label">Coins</span>
      </div>

      {/* Optional: Add a refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="currency-refresh-btn"
          title="Refresh balance"
        >
          ↻
        </button>
      )}
    </div>
  );
}

export default Currency;
