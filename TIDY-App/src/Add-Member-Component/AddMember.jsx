import React, { useState } from "react";
import "./AddMember.css";

function AddMember({ onAddMember }) {
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
              <button className="SaveButton" onClick={() => saveMemberName(index)}>
                Save
              </button>
            </div>
          ) : (
            <h3
              className={`AddUser${member.id}`}
              onClick={() => editMemberName(index)}
              style={{ cursor: "pointer" }}
            >
              {member.name ? member.name : `User #${member.id}`}
            </h3>
          )}

          {!member.isAdded && (
            <button
              className={`UserButton${member.id}`}
              onClick={() => editMemberName(index)}
            >
              Add Member
              <br />+
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AddMember;