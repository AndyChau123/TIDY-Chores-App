import { db } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  collection,
} from "firebase/firestore";

import { onChoreCompleted, addCurrency } from "./questCurrencyHelper";

// Save or update a member
export async function saveMemberToDB(member) {
  await setDoc(doc(db, "members", member.id.toString()), member, {
    merge: true,
  });
}

// Remove a member
export async function removeMemberFromDB(memberId) {
  await deleteDoc(doc(db, "members", memberId.toString()));
}

export async function updateChoresInDB(memberId, chores, userId = null) {
  try {
    // Update the member's chores in Firebase
    await updateDoc(doc(db, "members", memberId.toString()), { chores });

    // If userId is provided and a chore was completed, trigger quest updates
    if (userId) {
      // Count completed chores (assuming chores have a 'completed' property)
      const completedChores = chores.filter(chore => chore.completed);

      // If there are completed chores, trigger quest progress
      if (completedChores.length > 0) {
        await onChoreCompleted(userId);
      }
    }
  } catch (error) {
    console.error("Error updating chores:", error);
    throw error;
  }
}

// Compelete Chore
export async function completeChore(memberId, choreId, userId, currencyReward = 10) {
  try {
    // Get the member's current chores
    const memberRef = doc(db, "members", memberId.toString());
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      throw new Error("Member not found");
    }

    const member = memberSnap.data();
    const updatedChores = member.chores.map(chore => {
      if (chore.id === choreId) {
        return { ...chore, completed: true, completedAt: new Date().toISOString() };
      }
      return chore;
    });

    // Update chores in database
    await updateDoc(memberRef, { chores: updatedChores });

    // Award currency to user
    await addCurrency(userId, currencyReward);

    // Trigger quest progress
    await onChoreCompleted(userId);

    return {
      success: true,
      message: `Chore completed! +${currencyReward} coins`,
      newChores: updatedChores
    };
  } catch (error) {
    console.error("Error completing chore:", error);
    return {
      success: false,
      message: "Error completing chore",
      newChores: []
    };
  }
}

// Load ALL members (Option A)
export async function loadMembersFromDB() {
  const snapshot = await getDocs(collection(db, "members"));
  const list = [];
  snapshot.forEach((doc) => list.push(doc.data()));
  return list;
}

export async function loadMainChores() {
  const ref = doc(db, "main", "chores");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().chores || [];
  }
  return []; // default if no chores yet
}

export async function saveMainChores(chores) {
  const ref = doc(db, "main", "chores");
  await setDoc(ref, { chores }, { merge: true });
}

export async function updateMainChores(chores) {
  const ref = doc(db, "main", "chores");
  await updateDoc(ref, { chores });
}
