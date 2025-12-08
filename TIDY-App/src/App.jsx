import { useState, useEffect } from "react";
import {
  loadMembersFromDB,
  updateChoresInDB,
  saveMemberToDB,
  removeMemberFromDB
} from "./firebaseHelper.js";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";
import AddMember from "./Add-Member-Component/AddMember.jsx";
import MemberChoreList from "./Member-Chore-List-Component/MemberChoreList.jsx";
import ChoreList from "./Chore-List-Component/ChoreList.jsx";
import LoginPage from "./Login-Page/LoginPage.jsx";
import Currency from "./Currency-Component/Currency.jsx";
import Decorations from "./Decorations-Component/Decorations.jsx";
import TidyLogo from "./assets/TidyLogo.png";

// Import quest and currency functions
import {
  getUserCurrency,
  getUserQuests,
  claimQuestReward,
  initializeDailyQuests,
  initializeWeeklyQuests,
  getClaimableQuests,
  addCurrency,
  onChoreCompleted
} from './questCurrencyHelper';

// Import decoration functions
import { getUserDecorations } from './decorationHelper';

// Import the modal components
import {
  Modal,
  ShopContent,
  QuestContent,
  ShopButton,
  QuestsButton
} from "./Shop-Quest-Component/ShopQuestModals.jsx";

function AppContent() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // FAMILY STATE (from localStorage)
  // ============================================================================
  const [familyId, setFamilyId] = useState(null);
  const [familyCode, setFamilyCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  // ============================================================================
  // CURRENCY STATE
  // ============================================================================
  const [currency, setCurrency] = useState(0);
  const [currencyLoading, setCurrencyLoading] = useState(true);

  // ============================================================================
  // QUEST STATE
  // ============================================================================
  const [quests, setQuests] = useState([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [claimableCount, setClaimableCount] = useState(0);

  // ============================================================================
  // DECORATION STATE
  // ============================================================================
  const [activeDecoration, setActiveDecoration] = useState(null);

  // ============================================================================
  // MODAL STATE MANAGEMENT
  // ============================================================================
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);

  // ============================================================================
  // CHECK AUTHENTICATION ON MOUNT
  // ============================================================================
  useEffect(() => {
    const storedFamilyId = localStorage.getItem('familyId');
    const storedFamilyCode = localStorage.getItem('familyCode');
    const storedFamilyName = localStorage.getItem('familyName');

    if (storedFamilyId) {
      setFamilyId(storedFamilyId);
      setFamilyCode(storedFamilyCode || '');
      setFamilyName(storedFamilyName || 'My Family');
      console.log('Family session found:', storedFamilyCode);
    } else {
      console.log('No family session, redirecting to login');
      navigate('/');
    }

    setAuthChecked(true);
  }, [navigate]);

  // ============================================================================
  // INITIALIZE USER DATA ON MOUNT
  // ============================================================================
  useEffect(() => {
    if (!familyId || !authChecked) return;

    async function initializeUser() {
      try {
        // Load members FOR THIS FAMILY
        const storedMembers = await loadMembersFromDB(familyId);
        console.log("Loaded members from Firestore:", storedMembers);
        setMembers(storedMembers);
        setLoading(false);

        // Load currency
        const balance = await getUserCurrency(familyId);
        setCurrency(balance);
        setCurrencyLoading(false);

        // Load quests
        const userQuests = await getUserQuests(familyId);

        // If user has no quests, initialize default quests
        if (userQuests.length === 0) {
          console.log("No quests found, initializing default quests...");
          await initializeDailyQuests(familyId);
          await initializeWeeklyQuests(familyId);

          // Reload quests after initialization
          const newQuests = await getUserQuests(familyId);
          setQuests(newQuests);
        } else {
          setQuests(userQuests);
        }

        // Count claimable quests
        const claimable = await getClaimableQuests(familyId);
        setClaimableCount(claimable.length);

        // Load active decoration
        const decorations = await getUserDecorations(familyId);
        setActiveDecoration(decorations.active);

        setQuestsLoading(false);
      } catch (error) {
        console.error("Error initializing user data:", error);
        setLoading(false);
        setCurrencyLoading(false);
        setQuestsLoading(false);
      }
    }

    initializeUser();
  }, [familyId, authChecked]);

  // ============================================================================
  // LOGOUT HANDLER
  // ============================================================================
  const handleLogout = () => {
    localStorage.removeItem('familyId');
    localStorage.removeItem('familyCode');
    localStorage.removeItem('familyName');
    navigate("/");
    console.log("Logged out successfully");
  };

  // ============================================================================
  // CURRENCY REFRESH FUNCTION
  // ============================================================================
  async function refreshCurrency() {
    if (!familyId) return;
    try {
      const balance = await getUserCurrency(familyId);
      setCurrency(balance);
    } catch (error) {
      console.error("Error refreshing currency:", error);
    }
  }

  // ============================================================================
  // QUEST REFRESH FUNCTION
  // ============================================================================
  async function refreshQuests() {
    if (!familyId) return;
    try {
      const userQuests = await getUserQuests(familyId);
      setQuests(userQuests);

      // Update claimable count
      const claimable = await getClaimableQuests(familyId);
      setClaimableCount(claimable.length);
    } catch (error) {
      console.error("Error refreshing quests:", error);
    }
  }

  // ============================================================================
  // HANDLE DECORATION CHANGE
  // ============================================================================
  function handleDecorationChange(decorationId) {
    setActiveDecoration(decorationId);
  }

  // ============================================================================
  // HANDLE QUEST CLAIM
  // ============================================================================
  async function handleClaimQuest(questId) {
    if (!familyId) return;
    try {
      const result = await claimQuestReward(familyId, questId);

      if (result.success) {
        alert(`🎉 ${result.message}\nYou earned ${result.reward} coins!`);

        // Refresh both currency and quests
        await refreshCurrency();
        await refreshQuests();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Error claiming quest:", error);
      alert("Error claiming quest reward");
    }
  }

  // ============================================================================
  // MEMBER MANAGEMENT FUNCTIONS
  // Now saves to family-specific collection
  // ============================================================================
  const handleAddMember = async (newMember) => {
    if (!familyId) return;

    try {
      // Update local state first for responsive UI
      setMembers((prev) => {
        const exists = prev.find((m) => m.id === newMember.id);
        if (exists) {
          return prev.map((m) =>
            m.id === newMember.id ? { ...m, name: newMember.name, chores: m.chores || [] } : m
          );
        } else {
          return [...prev, { ...newMember, chores: newMember.chores || [] }];
        }
      });

      // Save to Firebase under this family
      await saveMemberToDB(familyId, { ...newMember, chores: newMember.chores || [] });
      console.log("Member saved to family:", familyId);
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error adding member. Please try again.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!familyId) return;

    try {
      // Update local state first
      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      // Remove from Firebase
      await removeMemberFromDB(familyId, memberId);
      console.log("Member removed from family:", familyId);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Error removing member. Please try again.");
    }
  };

  // ============================================================================
  // HANDLE CHORE UPDATE - USING completedBefore FLAG
  // Now includes familyId in the update
  // ============================================================================
  const handleUpdateMemberChores = async (memberId, updatedChores) => {
    if (!familyId) return;

    try {
      const member = members.find(m => m.id === memberId);
      if (!member) {
        console.error("Member not found:", memberId);
        return;
      }

      const oldChores = member.chores || [];
      const newlyCompletedChores = [];

      updatedChores.forEach((newChore) => {
        const oldChore = oldChores.find(c => c.id === newChore.id);

        const isCompleted = newChore.completed === true;
        const wasNeverCompletedBefore = oldChore?.completedBefore !== true;
        const isNowMarkedAsCompletedBefore = newChore.completedBefore === true;

        if (isCompleted && wasNeverCompletedBefore && isNowMarkedAsCompletedBefore) {
          console.log(`First-time completion detected: ${newChore.title}`);
          newlyCompletedChores.push(newChore);
        }
      });

      // Update local state FIRST for responsive UI
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, chores: updatedChores } : m
        )
      );

      // Save to Firebase WITH familyId
      await updateChoresInDB(familyId, memberId, updatedChores);

      // Process ONLY first-time completed chores
      if (newlyCompletedChores.length > 0) {
        console.log(`Processing ${newlyCompletedChores.length} first-time completed chore(s)`);

        for (let i = 0; i < newlyCompletedChores.length; i++) {
          await onChoreCompleted(familyId);
        }

        // Refresh UI
        await refreshQuests();
        await refreshCurrency();

        const choreText = newlyCompletedChores.length === 1 ? 'chore' : 'chores';
        alert(`✅ ${newlyCompletedChores.length} ${choreText} completed!`);
      } else {
        console.log("No first-time completions detected");
      }

    } catch (error) {
      console.error('Error updating chores:', error);
      alert('Error updating chores. Please try again.');
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (!authChecked || !familyId) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img src={TidyLogo} alt="TIDY logo" style={{ width: '120px', marginBottom: '20px' }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ============================================================================
          DECORATIONS OVERLAY
          Renders the active decoration on top of everything
          ============================================================================ */}
      <Decorations activeDecoration={activeDecoration} />

      <div className="app-header">
        <div className="logo" tabIndex={0} aria-label="TIDY logo">
          <img src={TidyLogo} alt="TIDY logo" className="logo__img" />
        </div>

        {/* ============================================================================
            SHOP AND QUESTS BUTTONS
            Show badge on Quests button if there are claimable quests
            ============================================================================ */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
          <ShopButton onClick={() => setIsShopOpen(true)} />

          {/* Quests Button with Badge */}
          <div style={{ position: 'relative' }}>
            <QuestsButton onClick={() => setIsQuestsOpen(true)} />
            {claimableCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                animation: 'pulse 2s infinite'
              }}>
                {claimableCount}
              </div>
            )}
          </div>
        </div>

        <AddMember
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          existingMembers={members}
          familyId={familyId}
        />

        {/* Pass currency and loading state to Currency component */}
        <Currency
          userId={familyId}
          balance={currency}
          loading={currencyLoading}
          onRefresh={refreshCurrency}
        />

        {/* Family Info & Logout - Stacked vertically */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
          {/* Family Info Box */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            padding: '8px 12px',
            borderRadius: '8px',
            gap: '2px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}>
              {familyName}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#888',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}>
              {familyCode}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className="chore-list-section">
          <ChoreList
            userId={familyId}
            familyId={familyId}
            onQuestUpdate={() => {
              refreshQuests();
              refreshCurrency();
            }}
          />
        </div>

        <div className="member-chore-section">
          <MemberChoreList
            members={members}
            onUpdateMemberChores={handleUpdateMemberChores}
            userId={familyId}
            familyId={familyId}
          />
        </div>
      </div>

      {/* ============================================================================
          MODAL WINDOWS
          ============================================================================ */}

      {/* SHOP MODAL */}
      <Modal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        title="🛒 Shop"
      >
        <ShopContent
          userId={familyId}
          currency={currency}
          onPurchase={refreshCurrency}
          onDecorationChange={handleDecorationChange}
        />
      </Modal>

      {/* QUESTS MODAL */}
      <Modal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        title="📜 Quests"
      >
        <QuestContent
          userId={familyId}
          quests={quests}
          loading={questsLoading}
          onClaimReward={handleClaimQuest}
          onRefresh={refreshQuests}
        />
      </Modal>

      {/* Add pulse animation for notification badge */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/app" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}
