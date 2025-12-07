import React, { useState, useEffect } from 'react';
import { deductCurrency } from '../questCurrencyHelper';

// ============================================================================
// REUSABLE MODAL COMPONENT
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '85vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'zoomIn 0.3s ease-out',
          border: '2px solid #334155'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderBottom: '2px solid #334155',
          position: 'sticky',
          top: 0,
          backgroundColor: '#1e293b',
          zIndex: 10
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {title}
          </h2>

          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-content::-webkit-scrollbar { width: 12px; }
        .modal-content::-webkit-scrollbar-track { background: #0f172a; border-radius: 8px; }
        .modal-content::-webkit-scrollbar-thumb { background: #475569; border-radius: 8px; }
        .modal-content::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
}

// ============================================================================
// SHOP MODAL CONTENT - CONNECTED TO FIREBASE
// ============================================================================
export function ShopContent({ userId, currency, onPurchase, coinIcon }) {
  const [purchasing, setPurchasing] = useState(null);

  // Sample shop items - Replace with Firebase data later
  const shopItems = [
    { id: 1, name: 'Power Up', description: 'Complete chores 2x faster', price: 100, emoji: '⚡' },
    { id: 2, name: 'Gold Star', description: 'Show off your achievement', price: 200, emoji: '⭐' },
    { id: 3, name: 'Time Skip', description: 'Skip waiting time', price: 300, emoji: '⏰' },
    { id: 4, name: 'Double Coins', description: 'Earn 2x coins for 1 day', price: 400, emoji: '💰' },
    { id: 5, name: 'Avatar Frame', description: 'Unique profile frame', price: 500, emoji: '🖼️' },
    { id: 6, name: 'Mystery Box', description: 'Random reward', price: 600, emoji: '🎁' },
  ];

  async function handlePurchase(item) {
    if (purchasing) return; // Prevent double-click

    setPurchasing(item.id);

    try {
      const result = await deductCurrency(userId, item.price);

      if (result.success) {
        alert(`✅ Purchase Successful!\n\nYou bought: ${item.name}\nNew balance: ${result.newBalance} coins`);
        onPurchase(); // Refresh currency in parent
      } else {
        alert(`❌ ${result.message}\n\nYou need ${item.price - currency} more coins!`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('❌ Error processing purchase');
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <div style={{ color: '#f1f5f9' }}>
      {/* Currency Display */}
      <div style={{
        backgroundColor: '#0f172a',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '32px',
        border: '2px solid #fbbf24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {coinIcon ? (
            <img src={coinIcon} alt="Coin" style={{ width: '32px', height: '32px' }} />
          ) : (
            <span style={{ fontSize: '32px' }}>🪙</span>
          )}
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Your Balance</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#fbbf24' }}>
              {currency} Coins
            </p>
          </div>
        </div>
      </div>

      {/* Shop Items Grid */}
      <div>
        <h3 style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🛒 Available Items
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {shopItems.map((item) => (
            <div key={item.id} style={{
              backgroundColor: '#334155',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #475569',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: purchasing === item.id ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#475569';
            }}
            >
              <div style={{
                width: '100%',
                height: '120px',
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {item.emoji}
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{item.name}</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>
                {item.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>
                  {item.price} 🪙
                </span>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={purchasing === item.id || currency < item.price}
                  style={{
                    background: currency >= item.price ? '#10b981' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: currency >= item.price ? 'pointer' : 'not-allowed',
                    opacity: purchasing === item.id ? 0.6 : 1
                  }}
                >
                  {purchasing === item.id ? 'Buying...' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUEST MODAL CONTENT - CONNECTED TO FIREBASE
// ============================================================================
export function QuestContent({ userId, quests, loading, onClaimReward, onRefresh }) {
  if (loading) {
    return (
      <div style={{ color: '#f1f5f9', textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Loading quests...</p>
      </div>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <div style={{ color: '#f1f5f9', textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
        <h3>No Quests Available</h3>
        <p style={{ color: '#94a3b8' }}>Complete chores to unlock new quests!</p>
      </div>
    );
  }

  const activeQuests = quests.filter(q => !q.isClaimed);
  const completedQuests = quests.filter(q => q.isClaimed);

  return (
    <div style={{ color: '#f1f5f9' }}>
      {/* Quest Progress Header */}
      <div style={{
        backgroundColor: '#0f172a',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '2px solid #8b5cf6'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#c084fc' }}>
          📊 Quest Progress
        </h3>
        <p style={{ margin: 0, color: '#94a3b8' }}>
          {activeQuests.length} active quest{activeQuests.length !== 1 ? 's' : ''} |
          {' '}{completedQuests.length} completed
        </p>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📜 Active Quests
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeQuests.map((quest) => {
              const progressPercent = Math.min(100, Math.round((quest.currentProgress / quest.targetValue) * 100));
              const isComplete = quest.isCompleted;

              return (
                <div key={quest.id} style={{
                  backgroundColor: '#334155',
                  padding: '24px',
                  borderRadius: '12px',
                  border: isComplete ? '2px solid #10b981' : '2px solid #475569',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isComplete ? '#059669' : '#8b5cf6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isComplete ? '#10b981' : '#475569';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                        {quest.title}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94a3b8' }}>
                        {quest.description}
                      </p>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: quest.type === 'daily' ? '#3b82f6' :
                                       quest.type === 'weekly' ? '#10b981' :
                                       quest.type === 'monthly' ? '#f59e0b' : '#8b5cf6',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {quest.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Reward</p>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>
                        {quest.reward} 🪙
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                        Progress: {quest.currentProgress} / {quest.targetValue}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#c084fc' }}>
                        {progressPercent}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      backgroundColor: '#1e293b',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        background: isComplete
                          ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(90deg, #8b5cf6 0%, #c084fc 100%)',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  <button
                    onClick={() => onClaimReward(quest.id)}
                    disabled={!isComplete}
                    style={{
                      width: '100%',
                      background: isComplete ? '#10b981' : '#475569',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: isComplete ? 'pointer' : 'not-allowed',
                      opacity: isComplete ? 1 : 0.6,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (isComplete) {
                        e.currentTarget.style.background = '#059669';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isComplete) {
                        e.currentTarget.style.background = '#10b981';
                      }
                    }}
                  >
                    {isComplete ? '🎉 Claim Reward' : 'In Progress'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quests Section */}
      {completedQuests.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '20px',
            marginBottom: '16px',
            color: '#94a3b8'
          }}>
            ✅ Completed Quests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedQuests.map((quest) => (
              <div key={quest.id} style={{
                backgroundColor: '#1e293b',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                opacity: 0.7
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px' }}>{quest.title}</span>
                  <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>
                    ✓ Claimed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================
export function ShopButton({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.5)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(59, 130, 246, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(59, 130, 246, 0.5)';
      }}
    >
      {icon ? (
        <img src={icon} alt="Shop" style={{ width: '20px', height: '20px' }} />
      ) : (
        <span>🛒</span>
      )}
      Shop
    </button>
  );
}

export function QuestsButton({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px -2px rgba(139, 92, 246, 0.5)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(139, 92, 246, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(139, 92, 246, 0.5)';
      }}
    >
      {icon ? (
        <img src={icon} alt="Quests" style={{ width: '20px', height: '20px' }} />
      ) : (
        <span>📜</span>
      )}
      Quests
    </button>
  );
}
