import { useState, useEffect } from "react";
import { loadMembersFromDB } from "./firebaseHelper.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import AddMember from "./Add-Member-Component/AddMember.jsx";
import MemberChoreList from "./Member-Chore-List-Component/MemberChoreList.jsx";
import ChoreList from "./Chore-List-Component/ChoreList.jsx";
import LoginPage from "./Login-Page/LoginPage.jsx";
import Currency from "./Currency-Component/Currency.jsx";
import TidyLogo from "./assets/TidyLogo.png";
// import {
//   getUserCurrency,
//   getUserQuests,
//   claimQuestReward,
//   initializeDailyQuests,
//   initializeWeeklyQuests,
//   getClaimableQuests
// } from './questCurrencyHelper';


// Import the modal components from the artifact
// (You'll need to create a new file called ShopQuestModals.jsx with the modal code)
import { Modal, ShopContent, QuestContent, ShopButton, QuestsButton } from "./Shop-Quest-Component/ShopQuestModals.jsx";

function AppContent() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState("current-user-id"); // Replace with actual user ID from auth
  const [currency, setCurrency] = useState(0);

  // ============================================================================
  // MODAL STATE MANAGEMENT
  // Controls visibility of Shop and Quests modals
  // ============================================================================
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);

  // Load members from Firestore when page loads or refreshes
  useEffect(() => {
    async function loadMembers() {
      const storedMembers = await loadMembersFromDB();
      console.log("Loaded from Firestore:", storedMembers);
      setMembers(storedMembers);
      setLoading(false);
    }
    loadMembers();
  }, []);

  // Add or update member in local state
  const handleAddMember = (newMember) => {
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === newMember.id);
      if (exists) {
        // When updating member name, preserve existing chores
        return prev.map((m) =>
          m.id === newMember.id ? { ...m, name: newMember.name, chores: m.chores || [] } : m
        );
      } else {
        // When adding new member, use their chores from Firebase or empty array
        return [...prev, { ...newMember, chores: newMember.chores || [] }];
      }
    });
  };

  // Remove member from state
  const handleRemoveMember = (memberId) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // Update chores for one member
  const handleUpdateMemberChores = (memberId, updatedChores) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, chores: updatedChores } : m
      )
    );
  };

  // Load currency when component mounts
  useEffect(() => {
    async function loadUserData() {
      const balance = await getUserCurrency(userId);
      setCurrency(balance);
    }
    loadUserData();
  }, [userId]);

  // Refresh currency after any transaction
  async function refreshCurrency() {
    const balance = await getUserCurrency(userId);
    setCurrency(balance);
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="logo" tabIndex={0} aria-label="TIDY logo">
          <img src={TidyLogo} alt="TIDY logo" className="logo__img" />
        </div>

        {/* ============================================================================
            SHOP AND QUESTS BUTTONS - Positioned above Currency
            Click these to open the respective modal windows
            ============================================================================ */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ShopButton onClick={() => setIsShopOpen(true)} />
          <QuestsButton onClick={() => setIsQuestsOpen(true)} />
        </div>

        <AddMember
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          existingMembers={members}
        />

        <Currency userId="current-user-id" />
      </div>

      <div className="app-content">
        <div className="chore-list-section">
          <ChoreList />
        </div>

        <div className="member-chore-section">
          <MemberChoreList
            members={members}
            onUpdateMemberChores={handleUpdateMemberChores}
          />
        </div>
      </div>

      {/* ============================================================================
          MODAL WINDOWS - Hidden until user clicks Shop or Quests button
          ============================================================================ */}

      {/* SHOP MODAL - Opens when isShopOpen is true */}
      <Modal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        title="🛒 Shop"
      >
        <ShopContent />
      </Modal>

      {/* QUESTS MODAL - Opens when isQuestsOpen is true */}
      <Modal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        title="📜 Quests"
      >
        <QuestContent />
      </Modal>
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
