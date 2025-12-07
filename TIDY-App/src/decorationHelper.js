import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// ============================================================================
// DECORATION DEFINITIONS
// All available decorations with their metadata
// ============================================================================
export const DECORATIONS = {
  halloween: {
    id: "halloween",
    name: "Spooky Halloween",
    description: "Festive jack-o-lanterns, bats, and candy hang across your screen",
    price: 50,
    icon: "🎃",
    category: "halloween"
  },
  christmas_lights: {
    id: "christmas_lights",
    name: "Christmas Lights",
    description: "Festive lights border your screen",
    price: 75,
    icon: "🎄",
    category: "christmas"
  },
  snowflakes: {
    id: "snowflakes",
    name: "Falling Snowflakes",
    description: "Gentle snowflakes drift down your screen",
    price: 60,
    icon: "❄️",
    category: "winter"
  }
};

// ============================================================================
// GET USER DECORATIONS
// Returns { purchased: [...], active: "decoration_id" or null }
// ============================================================================
export async function getUserDecorations(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        purchased: data.decorations?.purchased || [],
        active: data.decorations?.active || null
      };
    }

    // Default if user doesn't exist
    return { purchased: [], active: null };
  } catch (error) {
    console.error("Error getting user decorations:", error);
    return { purchased: [], active: null };
  }
}

// ============================================================================
// PURCHASE DECORATION
// Adds decoration to user's purchased list (does NOT deduct currency - do that separately)
// ============================================================================
export async function purchaseDecoration(userId, decorationId) {
  try {
    const userRef = doc(db, "users", userId);
    const current = await getUserDecorations(userId);

    // Check if already purchased
    if (current.purchased.includes(decorationId)) {
      return { success: false, message: "Already owned" };
    }

    // Add to purchased list
    const newPurchased = [...current.purchased, decorationId];

    await setDoc(userRef, {
      decorations: {
        purchased: newPurchased,
        active: current.active
      }
    }, { merge: true });

    return { success: true, message: "Decoration purchased!" };
  } catch (error) {
    console.error("Error purchasing decoration:", error);
    return { success: false, message: "Error purchasing decoration" };
  }
}

// ============================================================================
// SET ACTIVE DECORATION
// Sets which decoration is currently displayed (or null to disable)
// ============================================================================
export async function setActiveDecoration(userId, decorationId) {
  try {
    const userRef = doc(db, "users", userId);
    const current = await getUserDecorations(userId);

    // If setting to a decoration (not null), verify it's purchased
    if (decorationId && !current.purchased.includes(decorationId)) {
      return { success: false, message: "Decoration not owned" };
    }

    await setDoc(userRef, {
      decorations: {
        purchased: current.purchased,
        active: decorationId
      }
    }, { merge: true });

    return { success: true, message: decorationId ? "Decoration applied!" : "Decoration removed" };
  } catch (error) {
    console.error("Error setting active decoration:", error);
    return { success: false, message: "Error applying decoration" };
  }
}

// ============================================================================
// CHECK IF DECORATION IS PURCHASED
// ============================================================================
export async function isDecorationPurchased(userId, decorationId) {
  const decorations = await getUserDecorations(userId);
  return decorations.purchased.includes(decorationId);
}

// ============================================================================
// GET ALL SHOP DECORATIONS
// Returns array of all decorations with purchase status
// ============================================================================
export async function getShopDecorations(userId) {
  const userDecorations = await getUserDecorations(userId);

  return Object.values(DECORATIONS).map(decoration => ({
    ...decoration,
    isPurchased: userDecorations.purchased.includes(decoration.id),
    isActive: userDecorations.active === decoration.id
  }));
}
