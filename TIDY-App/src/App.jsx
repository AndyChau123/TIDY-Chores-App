import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AddMember from "./Add-Member-Component/AddMember.jsx";
import MemberChoreList from "./Member-Chore-List-Component/MemberChoreList.jsx";
import ChoreList from "./Chore-List-Component/ChoreList.jsx";
import LoginPage from "./Login-Page/LoginPage.jsx";

function AppContent() {
  const [members, setMembers] = useState([]);

  const handleAddMember = (newMember) => {
    setMembers(prev => {
      const exists = prev.find(m => m.id === newMember.id);
      if (exists) {
        return prev.map(m =>
          m.id === newMember.id ? { ...m, name: newMember.name } : m
        );
      } else {
        return [...prev, newMember];
      }
    });
  };

  const handleUpdateMemberChores = (memberId, updatedChores) => {
    setMembers(prev =>
      prev.map(m =>
        m.id === memberId ? { ...m, chores: updatedChores } : m
      )
    );
  };

  return (
    <>
      <AddMember onAddMember={handleAddMember} />
      <ChoreList />
      <MemberChoreList
        members={members}
        onUpdateMemberChores={handleUpdateMemberChores}
      />
    </>
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
