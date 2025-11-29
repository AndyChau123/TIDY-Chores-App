import React, { useState } from "react";
import "./AddMember.css";
import { saveMemberToDB, removeMemberFromDB } from "../firebaseHelper";

function AddMember({ onAddMember, onRemoveMember, existingMembers }) {
  const [members, setMembers] = useState([
    { id: 2, name: "", isEditing: false, isAdded: false },
    { id: 3, name: "", isEditing: false, isAdded: false },
    { id: 4, name: "", isEditing: false, isAdded: false },
  ]);

  const editMemberName = (index) => {
    const updated = [...members];
    updated[index].isEditing = true;
    setMembers(updated);
  };

  const updateMemberName = (e, index) => {
    const updated = [...members];
    updated[index].name = e.target.value;
    setMembers(updated);
  };

  const saveMemberName = async (index) => {
    const updated = [...members];
    const name = updated[index].name.trim();
    if (name === "") return;

    const newMember = {
      id: updated[index].id,
      name,
      chores: [],
    };

    updated[index].isEditing = false;
    updated[index].isAdded = true;
    setMembers(updated);

    onAddMember(newMember);
    try {
      await saveMemberToDB(newMember);
    } catch (error) {
      console.error("Error saving member to Firestore:", error);
      alert("Failed to save member. Check console for details.");
    }
  };

  const cancelEdit = (index) => {
    const updated = [...members];
    if (updated[index].isAdded) {
      updated[index].isEditing = false;
    } else {
      updated[index].name = "";
      updated[index].isEditing = false;
    }
    setMembers(updated);
  };

  const removeMember = async (index) => {
    const updated = [...members];
    const memberId = updated[index].id;

    updated[index] = {
      id: memberId,
      name: "",
      isEditing: false,
      isAdded: false,
    };
    setMembers(updated);

    onRemoveMember(memberId);
    try {
      await removeMemberFromDB(memberId);
    } catch (error) {
      console.error("Error removing member from Firestore:", error);
      alert("Failed to remove member. Check console for details.");
    }
  };

  const isMemberInList = (memberId) => {
    return existingMembers.some((m) => m.id === memberId);
  };

  return (
    <div className="MemberName">
      {members.map((member, index) => (
        <div key={member.id} className={`User${member.id}`}>
          {member.isEditing ? (
            <div className="editMemberName">
              <input
                type="text"
                placeholder="Enter Member Name"
                value={member.name}
                onChange={(e) => updateMemberName(e, index)}
                className="NameInput"
              />
              <div className="button-group">
                <button
                  className="SaveButton"
                  onClick={() => saveMemberName(index)}
                >
                  Save
                </button>
                <button
                  className="CancelEditButton"
                  onClick={() => cancelEdit(index)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <h3
                  className={`AddUser${member.id}`}
                  onClick={() => editMemberName(index)}
                  style={{ cursor: "pointer" }}
                >
                  {member.name ? member.name : `User #${member.id}`}
                </h3>

                {isMemberInList(member.id) && (
                  <button
                    className="RemoveMemberButton"
                    onClick={() => removeMember(index)}
                    title="Remove member"
                    aria-label="Remove member"
                  >
                    ×
                  </button>
                )}
              </div>

              {!member.isAdded && (
                <button
                  className={`UserButton${member.id}`}
                  onClick={() => editMemberName(index)}
                >
                  Add Member
                  <br />+
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default AddMember;
