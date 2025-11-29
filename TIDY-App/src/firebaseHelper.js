import { db } from './firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";

// Save or update a member
export async function saveMemberToDB(member) {
  await setDoc(doc(db, "members", member.id.toString()), member, { merge: true });
}

// Remove a member
export async function removeMemberFromDB(memberId) {
  await deleteDoc(doc(db, "members", memberId.toString()));
}

// Update a member's chore list
export async function updateChoresInDB(memberId, chores) {
  await updateDoc(doc(db, "members", memberId.toString()), { chores });
}

// Load ALL members (Option A)
export async function loadMembersFromDB() {
  const snapshot = await getDocs(collection(db, "members"));
  const list = [];
  snapshot.forEach((doc) => list.push(doc.data()));
  return list;
}
