import React, { useState } from 'react';

// ============================================================================
// REUSABLE MODAL COMPONENT
// ============================================================================
// This component creates a fullscreen overlay with a centered content area
// Props:
//   - isOpen: boolean to show/hide modal
//   - onClose: function to call when closing
//   - title: string for modal header
//   - children: content to display inside modal
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
        {/* Modal Header with Title and Close Button */}
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

          {/* Close Button - Top Right Corner */}
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

        {/* Modal Body - Content Area */}
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-content::-webkit-scrollbar {
          width: 12px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 8px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 8px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// SHOP MODAL CONTENT
// ============================================================================
// Placeholder structure for shop items and currency display
// Ready for Firebase integration
// Props:
//   - coinIcon: optional image source for coin icon
// ============================================================================
export function ShopContent({ coinIcon }) {
  return (
    <div style={{ color: '#f1f5f9' }}>
      {/* Currency Display Section */}
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
          {/* Coin Icon - Replace with your own image */}
          {coinIcon ? (
            <img src={coinIcon} alt="Coin" style={{ width: '32px', height: '32px' }} />
          ) : (
            <span style={{ fontSize: '32px' }}>🪙</span>
          )}
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Your Balance</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#fbbf24' }}>
              1,250 Coins
            </p>
          </div>
        </div>
      </div>

      {/* Shop Items Section - Placeholder for Firebase Data */}
      <div>
        <h3 style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🛒 Shop Items
        </h3>

        {/* Grid of placeholder shop items */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {[1, 2, 3].map((item) => (
            <div key={item} style={{
              backgroundColor: '#334155',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #475569',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
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
                🎁
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Item {item}</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>
                Description goes here
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>
                  {100 * item} 🪙
                </span>
                <button style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  Buy
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
// QUEST MODAL CONTENT
// ============================================================================
// Placeholder structure for quest list from Firebase
// Ready for dynamic quest data integration
// ============================================================================
export function QuestContent() {
  return (
    <div style={{ color: '#f1f5f9' }}>

      {/* Quest List Section - Placeholder for Firebase Data */}
      <div>

        {/* List of placeholder quests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { title: 'Daily Challenge', reward: 100, progress: 75, type: 'daily' },
            { title: 'Weekly Goal', reward: 500, progress: 40, type: 'weekly' },
            { title: 'Completion Goal', reward: 2000, progress: 20, type: 'monthly' }
          ].map((quest, index) => (
            <div key={index} style={{
              backgroundColor: '#334155',
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #475569',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                    {quest.title}
                  </h4>
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
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Progress</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#c084fc' }}>
                    {quest.progress}%
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
                    width: `${quest.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #c084fc 100%)',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              <button style={{
                width: '100%',
                background: quest.progress === 100 ? '#10b981' : '#475569',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: quest.progress === 100 ? 'pointer' : 'not-allowed',
                opacity: quest.progress === 100 ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (quest.progress === 100) {
                  e.currentTarget.style.background = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (quest.progress === 100) {
                  e.currentTarget.style.background = '#10b981';
                }
              }}
              >
                {quest.progress === 100 ? 'Claim Reward' : 'In Progress'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SHOP BUTTON COMPONENT
// ============================================================================
// Props:
//   - onClick: function to open shop modal
//   - icon: optional image source for shop icon
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
      {/* Shop Icon - Replace with your own image */}
      {icon ? (
        <img src={icon} alt="Shop" style={{ width: '20px', height: '20px' }} />
      ) : (
        <span>🛒</span>
      )}
      Shop
    </button>
  );
}

// ============================================================================
// QUESTS BUTTON COMPONENT
// ============================================================================
// Props:
//   - onClick: function to open quests modal
//   - icon: optional image source for quest icon
// ============================================================================
export function QuestsButton({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #ff293b 0%, #ff858f 100%)',
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
      {/* Quest Icon - Replace with your own image */}
      {icon ? (
        <img src={icon} alt="Quests" style={{ width: '20px', height: '20px' }} />
      ) : (
        <span>📜</span>
      )}
      Quests
    </button>
  );
}
