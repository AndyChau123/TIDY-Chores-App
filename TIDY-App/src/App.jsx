import { useState, useEffect } from "react";
import { loadMembersFromDB } from "./firebaseHelper.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import AddMember from "./Add-Member-Component/AddMember.jsx";
import MemberChoreList from "./Member-Chore-List-Component/MemberChoreList.jsx";
import ChoreList from "./Chore-List-Component/ChoreList.jsx";
import LoginPage from "./Login-Page/LoginPage.jsx";
import TidyLogo from "./assets/TidyLogo.png";

function AppContent() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        return prev.map((m) =>
          m.id === newMember.id ? { ...m, name: newMember.name } : m
        );
      } else {
        return [...prev, newMember];
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

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="logo" tabIndex={0} aria-label="TIDY logo">
          <img src={TidyLogo} alt="TIDY logo" className="logo__img" />
        </div>

        <AddMember
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          existingMembers={members}
        />
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
