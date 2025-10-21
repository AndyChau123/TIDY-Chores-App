import React, { useState } from "react";
import "./AddMember.css";

function AddMember() {

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
    if (updated[index].name.trim() === "") return;
    updated[index].isEditing = false;
    updated[index].isAdded = true;
    setMembers(updated);
  };

return (
  //Allows user to edit names
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
            //Allows user to save edited name
            <h3
              className={`AddUser${member.id}`}
              onClick={() => editMemberName(index)}
              style={{ cursor: "pointer" }}
            >
              {member.name ? member.name : `User #${member.id}`}
            </h3> // Clickable header that nows becomes a button
          )} 

          {/* Show "Add Member" button only if not added yet */}
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
