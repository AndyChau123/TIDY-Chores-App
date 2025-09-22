import React, { useState } from "react";
import "./AddMember.css";

function AddMember() {
  return (
    <div className="MemberName">
      <div className="User2">
        <h3 className="AddUser2">User #2</h3>
        <button className="UserButton2">Add Member
            <br /> +
        </button>
      </div>

      <div className="User3">
        <h3 className="AddUser3">User #3</h3>
        <button className="UserButton3">Add Member
            <br /> +
        </button>
      </div>

      <div className="User4">
        <h3 className="AddUser4">User #4</h3>
        <button className="UserButton4">Add Member
            <br /> +
        </button>
      </div>
    </div>
  );
}

export default AddMember;
