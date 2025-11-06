import { useState } from "react";
import "./App.css";
import AddMember from "./Add-Member-Component/AddMember.jsx";
import MemberChoreList from "./Member-Chore-List-Component/MemberChoreList.jsx";
import ChoreList from './Chore-List-Component/ChoreList.jsx';

function App() {
  const [members, setMembers] = useState([]);

  const handleAddMember = (newMember) => {
    setMembers(prev => {
      const exists = prev.find(m => m.id === newMember.id);
      if (exists) {
        // Update existing member's name
        return prev.map(m =>
          m.id === newMember.id ? { ...m, name: newMember.name } : m
        );
      } else {
        // Add new member if not in the list
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

export default App;
