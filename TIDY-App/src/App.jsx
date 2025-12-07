import { useState, useEffect } from "react";
import { loadMembersFromDB, updateChoresInDB } from "./firebaseHelper.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // USER & CURRENCY STATE
  // ============================================================================
  const [userId] = useState("current-user-id"); // Replace with actual user ID from auth
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
  // INITIALIZE USER DATA ON MOUNT
  // ============================================================================
  useEffect(() => {
    async function initializeUser() {
      try {
        // Load members
        const storedMembers = await loadMembersFromDB();
        console.log("Loaded from Firestore:", storedMembers);
        setMembers(storedMembers);
        setLoading(false);

        // Load currency
        const balance = await getUserCurrency(userId);
        setCurrency(balance);
        setCurrencyLoading(false);

        // Load quests
        const userQuests = await getUserQuests(userId);

        // If user has no quests, initialize default quests
        if (userQuests.length === 0) {
          console.log("No quests found, initializing default quests...");
          await initializeDailyQuests(userId);
          await initializeWeeklyQuests(userId);

          // Reload quests after initialization
          const newQuests = await getUserQuests(userId);
          setQuests(newQuests);
        } else {
          setQuests(userQuests);
        }

        // Count claimable quests
        const claimable = await getClaimableQuests(userId);
        setClaimableCount(claimable.length);

        // Load active decoration
        const decorations = await getUserDecorations(userId);
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
  }, [userId]);

  // ============================================================================
  // CURRENCY REFRESH FUNCTION
  // ============================================================================
  async function refreshCurrency() {
    try {
      const balance = await getUserCurrency(userId);
      setCurrency(balance);
    } catch (error) {
      console.error("Error refreshing currency:", error);
    }
  }

  // ============================================================================
  // QUEST REFRESH FUNCTION
  // ============================================================================
  async function refreshQuests() {
    try {
      const userQuests = await getUserQuests(userId);
      setQuests(userQuests);

      // Update claimable count
      const claimable = await getClaimableQuests(userId);
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
    try {
      const result = await claimQuestReward(userId, questId);

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
  // ============================================================================
  const handleAddMember = (newMember) => {
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
  };

  const handleRemoveMember = (memberId) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // ============================================================================
  // HANDLE CHORE UPDATE - USING completedBefore FLAG
  // Only counts chores that have NEVER been completed before (completedBefore = false)
  // Once completedBefore is set to true, that chore can never trigger quest progress again
  //
  // FIXED: Now compares chores by ID instead of by index to prevent double-counting
  // when chores are added (which shifts indices)
  // ============================================================================
  const handleUpdateMemberChores = async (memberId, updatedChores) => {
    try {
      // Find newly completed chores that have NEVER been completed before
      // These are chores where:
      // 1. completed = true (currently checked)
      // 2. completedBefore = true (flag was just set)
      // 3. The OLD version had completedBefore = false (first time completion)

      const member = members.find(m => m.id === memberId);
      if (!member) {
        console.error("Member not found:", memberId);
        return;
      }

      const oldChores = member.chores || [];
      const newlyCompletedChores = [];

      // FIXED: Find chores by ID, not by index!
      // This prevents bugs when chores are added/removed and indices shift
      updatedChores.forEach((newChore) => {
        const oldChore = oldChores.find(c => c.id === newChore.id);

        // Check if this is a FIRST-TIME completion:
        // - New chore is completed
        // - New chore has completedBefore = true (just set)
        // - Old chore had completedBefore = false (or didn't exist)
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

      // Save to Firebase (this persists the completedBefore flag)
      await updateChoresInDB(memberId, updatedChores);

      // Process ONLY first-time completed chores
      if (newlyCompletedChores.length > 0) {
        console.log(`Processing ${newlyCompletedChores.length} first-time completed chore(s)`);

        // Update quest progress for each first-time completed chore
        for (let i = 0; i < newlyCompletedChores.length; i++) {
          await onChoreCompleted(userId);
        }

        // Refresh UI
        await refreshQuests();
        await refreshCurrency();

        // Show success message
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
        />

        {/* Pass currency and loading state to Currency component */}
        <Currency
          userId={userId}
          balance={currency}
          loading={currencyLoading}
          onRefresh={refreshCurrency}
        />
      </div>

      <div className="app-content">
        <div className="chore-list-section">
          <ChoreList
            userId={userId}
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
            userId={userId}
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
          userId={userId}
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
          userId={userId}
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
