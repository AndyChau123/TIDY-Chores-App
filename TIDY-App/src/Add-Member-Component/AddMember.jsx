import React, { useState, useEffect } from "react";
import "./AddMember.css";
import { saveMemberToDB, removeMemberFromDB } from "../firebaseHelper";

function AddMember({ onAddMember, onRemoveMember, existingMembers }) {
  const [members, setMembers] = useState([
    { id: 2, name: "", isEditing: false, isAdded: false },
    { id: 3, name: "", isEditing: false, isAdded: false },
    { id: 4, name: "", isEditing: false, isAdded: false },
  ]);

  // Sync local state with existingMembers from Firebase, modify users accordingly
  useEffect(() => {
    setMembers((prev) => {
      return prev.map((member) => {
        const existingMember = existingMembers.find((m) => m.id === member.id);
        if (existingMember) {
          return {
            id: member.id,
            name: existingMember.name,
            isEditing: false,
            isAdded: true,
          };
        }
        return member;
      });
    });
  }, [existingMembers]);

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

    // Preserves chores for updating an existing added member's name
    const existingMember = existingMembers.find((m) => m.id === updated[index].id);
    const newMember = {
      id: updated[index].id,
      name,
      chores: existingMember?.chores || [],
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
      // If member exists, restore their name from existingMembers
      const existingMember = existingMembers.find((m) => m.id === updated[index].id);
      if (existingMember) {
        updated[index].name = existingMember.name;
      }
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