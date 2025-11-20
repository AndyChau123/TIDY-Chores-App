import React, { useState } from "react";
import "./AddMember.css";

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

  const saveMemberName = (index) => {
    const updated = [...members];
    const name = updated[index].name.trim();
    if (name === "") return;

    updated[index].isEditing = false;
    updated[index].isAdded = true;
    setMembers(updated);

    onAddMember({ id: updated[index].id, name, chores: [] });
  };

  const cancelEdit = (index) => {
    const updated = [...members];
    // If member was already added, just close the edit mode
    if (updated[index].isAdded) {
      updated[index].isEditing = false;
    } else {
      // If member was never added, reset everything
      updated[index].name = "";
      updated[index].isEditing = false;
    }
    setMembers(updated);
  };

  const removeMember = (index) => {
    const updated = [...members];
    const memberId = updated[index].id;

    // Reset the member slot
    updated[index] = {
      id: memberId,
      name: "",
      isEditing: false,
      isAdded: false,
    };
    setMembers(updated);

    // Notify parent to remove from the member list
    onRemoveMember(memberId);
  };

  const isMemberInList = (memberId) => {
    return existingMembers.some(m => m.id === memberId);
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
                <button className="SaveButton" onClick={() => saveMemberName(index)}>
                  Save
                </button>
                <button className="CancelEditButton" onClick={() => cancelEdit(index)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
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
