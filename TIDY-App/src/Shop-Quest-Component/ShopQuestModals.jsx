import React, { useState, useEffect } from "react";
import {
  DECORATIONS,
  getUserDecorations,
  purchaseDecoration,
  setActiveDecoration,
  getShopDecorations
} from "../decorationHelper";
import { deductCurrency } from "../questCurrencyHelper";

// ============================================================================
// MODAL COMPONENT
// Reusable modal wrapper
// ============================================================================
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          color: '#000000'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#000000' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px 8px',
              borderRadius: '8px'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// SHOP BUTTON
// ============================================================================
export function ShopButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
      }}
    >
      🛒 Shop
    </button>
  );
}

// ============================================================================
// QUESTS BUTTON
// ============================================================================
export function QuestsButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        backgroundColor: '#f59e0b',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
      }}
    >
      📜 Quests
    </button>
  );
}

// ============================================================================
// SHOP CONTENT
// Displays decoration items for purchase and application
// ============================================================================
export function ShopContent({ userId, currency, onPurchase, onDecorationChange }) {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("decorations");

  useEffect(() => {
    loadDecorations();
  }, [userId]);

  async function loadDecorations() {
    setLoading(true);
    try {
      const shopItems = await getShopDecorations(userId);
      setDecorations(shopItems);
    } catch (error) {
      console.error("Error loading decorations:", error);
    }
    setLoading(false);
  }

  async function handlePurchase(decoration) {
    if (currency < decoration.price) {
      alert("❌ Not enough coins!");
      return;
    }

    try {
      // Deduct currency
      const deductResult = await deductCurrency(userId, decoration.price);
      if (!deductResult.success) {
        alert(`❌ ${deductResult.message}`);
        return;
      }

      // Add to purchased
      const purchaseResult = await purchaseDecoration(userId, decoration.id);
      if (purchaseResult.success) {
        alert(`🎉 ${decoration.name} purchased!`);
        await loadDecorations();
        if (onPurchase) onPurchase();
      } else {
        alert(`❌ ${purchaseResult.message}`);
      }
    } catch (error) {
      console.error("Error purchasing decoration:", error);
      alert("❌ Error purchasing decoration");
    }
  }

  async function handleApply(decoration) {
    try {
      // If already active, deactivate it
      const newActiveId = decoration.isActive ? null : decoration.id;
      const result = await setActiveDecoration(userId, newActiveId);

      if (result.success) {
        await loadDecorations();
        if (onDecorationChange) {
          onDecorationChange(newActiveId);
        }
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Error applying decoration:", error);
      alert("❌ Error applying decoration");
    }
  }

  if (loading) {
    return <p style={{ textAlign: 'center', color: '#374151' }}>Loading shop...</p>;
  }

  return (
    <div style={{ color: '#000000' }}>
      {/* Currency Display */}
      <div style={{
        backgroundColor: '#fef3c7',
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 'bold', color: '#92400e' }}>Your Balance:</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d97706' }}>
          {currency} 🪙
        </span>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setActiveTab("decorations")}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            backgroundColor: activeTab === "decorations" ? '#8b5cf6' : '#e5e7eb',
            color: activeTab === "decorations" ? 'white' : '#000000'
          }}
        >
          🎨 Decorations
        </button>
      </div>

      {/* Decorations Tab */}
      {activeTab === "decorations" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {decorations.map((decoration) => (
            <div
              key={decoration.id}
              style={{
                border: decoration.isActive ? '2px solid #10b981' : '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: decoration.isActive ? '#ecfdf5' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{decoration.icon}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000000' }}>{decoration.name}</span>
                    {decoration.isActive && (
                      <span style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0', color: '#4b5563', fontSize: '14px' }}>
                    {decoration.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {!decoration.isPurchased ? (
                    <>
                      <span style={{ fontWeight: 'bold', color: '#d97706' }}>
                        {decoration.price} 🪙
                      </span>
                      <button
                        onClick={() => handlePurchase(decoration)}
                        disabled={currency < decoration.price}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: currency >= decoration.price ? '#10b981' : '#9ca3af',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: currency >= decoration.price ? 'pointer' : 'not-allowed',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        Buy
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{
                        color: '#10b981',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        ✓ Owned
                      </span>
                      <button
                        onClick={() => handleApply(decoration)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: decoration.isActive ? '#ef4444' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        {decoration.isActive ? 'Remove' : 'Apply'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QUEST CONTENT
// Displays quests and claim buttons
// ============================================================================
export function QuestContent({ userId, quests, loading, onClaimReward, onRefresh }) {
  if (loading) {
    return <p style={{ textAlign: 'center', color: '#374151' }}>Loading quests...</p>;
  }

  const activeQuests = quests.filter(q => !q.isClaimed);
  const completedQuests = quests.filter(q => q.isClaimed);

  return (
    <div style={{ color: '#000000' }}>
      {/* Active Quests */}
      <h3 style={{ marginBottom: '12px', color: '#000000' }}>Active Quests</h3>

      {activeQuests.length === 0 ? (
        <p style={{ color: '#4b5563', textAlign: 'center', padding: '20px' }}>
          No active quests. Check back later!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {activeQuests.map((quest) => (
            <div
              key={quest.id}
              style={{
                border: quest.isCompleted ? '2px solid #10b981' : '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: quest.isCompleted ? '#ecfdf5' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#000000' }}>{quest.title}</span>
                    <span style={{
                      backgroundColor: quest.type === 'daily' ? '#dbeafe' : '#fef3c7',
                      color: quest.type === 'daily' ? '#1d4ed8' : '#92400e',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {quest.type}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0', color: '#4b5563', fontSize: '14px' }}>
                    {quest.description}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      marginBottom: '4px',
                      color: '#000000'
                    }}>
                      <span>Progress</span>
                      <span>{quest.currentProgress} / {quest.targetValue}</span>
                    </div>
                    <div style={{
                      backgroundColor: '#e5e7eb',
                      borderRadius: '8px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: quest.isCompleted ? '#10b981' : '#3b82f6',
                        height: '100%',
                        width: `${Math.min((quest.currentProgress / quest.targetValue) * 100, 100)}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '16px' }}>
                  <span style={{ fontWeight: 'bold', color: '#d97706' }}>
                    +{quest.reward} 🪙
                  </span>
                  {quest.isCompleted && !quest.isClaimed && (
                    <button
                      onClick={() => onClaimReward(quest.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      Claim!
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <>
          <h3 style={{ marginBottom: '12px', color: '#000000' }}>Completed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completedQuests.map((quest) => (
              <div
                key={quest.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  opacity: 0.7
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#4b5563' }}>{quest.title}</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                    ✓ Claimed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#e5e7eb',
          color: '#000000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '100%',
          fontWeight: 'bold'
        }}
      >
        🔄 Refresh Quests
      </button>
    </div>
  );
}
