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

// ============================================================================
// USER NAME FUNCTIONS
// ============================================================================

/**
 * Get user's display name
 * @param {string} familyId - The family's ID
 * @returns {Promise<string|null>} The user's name or null
 */
export async function getUserName(familyId) {
  try {
    const userRef = doc(db, "users", familyId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data().displayName || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user name:", error);
    return null;
  }
}

/**
 * Save user's display name
 * @param {string} familyId - The family's ID
 * @param {string} name - The name to save
 */
export async function saveUserName(familyId, name) {
  try {
    const userRef = doc(db, "users", familyId);
    await setDoc(userRef, { displayName: name }, { merge: true });
  } catch (error) {
    console.error("Error saving user name:", error);
    throw error;
  }
}

// ============================================================================
// MEMBER FUNCTIONS (FAMILY-SCOPED)
// Members are now stored under: users/{familyId}/members/{memberId}
// ============================================================================

/**
 * Save or update a member for a specific family
 * @param {string} familyId - The family's ID
 * @param {object} member - The member object to save
 */
export async function saveMemberToDB(familyId, member) {
  if (!familyId) {
    console.error("saveMemberToDB: familyId is required");
    throw new Error("familyId is required");
  }

  if (!member || !member.id) {
    console.error("saveMemberToDB: member with id is required");
    throw new Error("member with id is required");
  }

  const memberRef = doc(db, "users", familyId, "members", member.id.toString());
  await setDoc(memberRef, member, { merge: true });
}

/**
 * Remove a member from a specific family
 * @param {string} familyId - The family's ID
 * @param {string} memberId - The member's ID to remove
 */
export async function removeMemberFromDB(familyId, memberId) {
  if (!familyId) {
    console.error("removeMemberFromDB: familyId is required");
    throw new Error("familyId is required");
  }

  const memberRef = doc(db, "users", familyId, "members", memberId.toString());
  await deleteDoc(memberRef);
}

/**
 * Update chores for a specific member in a family
 * @param {string} familyId - The family's ID
 * @param {string} memberId - The member's ID
 * @param {array} chores - The updated chores array
 */
export async function updateChoresInDB(familyId, memberId, chores) {
  if (!familyId) {
    console.error("updateChoresInDB: familyId is required");
    throw new Error("familyId is required");
  }

  try {
    const memberRef = doc(db, "users", familyId, "members", memberId.toString());
    await updateDoc(memberRef, { chores });
  } catch (error) {
    console.error("Error updating chores:", error);
    throw error;
  }
}

/**
 * Complete a chore for a member
 * @param {string} familyId - The family's ID
 * @param {string} memberId - The member's ID
 * @param {string} choreId - The chore's ID
 * @param {number} currencyReward - Currency to award (default 10)
 */
export async function completeChore(familyId, memberId, choreId, currencyReward = 10) {
  if (!familyId) {
    console.error("completeChore: familyId is required");
    return { success: false, message: "familyId is required", newChores: [] };
  }

  try {
    const memberRef = doc(db, "users", familyId, "members", memberId.toString());
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

    // Award currency to family
    await addCurrency(familyId, currencyReward);

    // Trigger quest progress
    await onChoreCompleted(familyId);

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

/**
 * Load all members for a specific family
 * @param {string} familyId - The family's ID
 * @returns {Promise<array>} Array of member objects
 */
export async function loadMembersFromDB(familyId) {
  if (!familyId) {
    console.error("loadMembersFromDB: familyId is required");
    return [];
  }

  try {
    const membersRef = collection(db, "users", familyId, "members");
    const snapshot = await getDocs(membersRef);
    const list = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
    return list;
  } catch (error) {
    console.error("Error loading members:", error);
    return [];
  }
}

// ============================================================================
// MAIN CHORES FUNCTIONS (FAMILY-SCOPED)
// Main chores are now stored under: users/{familyId}/mainChores/chores
// ============================================================================

/**
 * Load main chores for a specific family
 * @param {string} familyId - The family's ID
 * @returns {Promise<array>} Array of main chores
 */
export async function loadMainChores(familyId) {
  if (!familyId) {
    console.error("loadMainChores: familyId is required");
    return [];
  }

  try {
    const ref = doc(db, "users", familyId, "mainChores", "chores");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data().chores || [];
    }
    return [];
  } catch (error) {
    console.error("Error loading main chores:", error);
    return [];
  }
}

/**
 * Save main chores for a specific family
 * @param {string} familyId - The family's ID
 * @param {array} chores - Array of chores to save
 */
export async function saveMainChores(familyId, chores) {
  if (!familyId) {
    console.error("saveMainChores: familyId is required");
    throw new Error("familyId is required");
  }

  const ref = doc(db, "users", familyId, "mainChores", "chores");
  await setDoc(ref, { chores }, { merge: true });
}

/**
 * Update main chores for a specific family
 * @param {string} familyId - The family's ID
 * @param {array} chores - Array of chores to update
 */
export async function updateMainChores(familyId, chores) {
  if (!familyId) {
    console.error("updateMainChores: familyId is required");
    throw new Error("familyId is required");
  }

  const ref = doc(db, "users", familyId, "mainChores", "chores");
  await updateDoc(ref, { chores });
}
