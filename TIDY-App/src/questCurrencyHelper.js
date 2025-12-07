import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  increment,
  serverTimestamp,
} from "firebase/firestore";

// ============================================================================
// CURRENCY FUNCTIONS
// ============================================================================

/**
 * Get user's current currency balance
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} The user's coin balance
 */
export async function getUserCurrency(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data().currency || 0;
    }

    // If user doesn't exist, create them with 0 currency
    await setDoc(userRef, {
      currency: 0,
      createdAt: serverTimestamp()
    });
    return 0;
  } catch (error) {
    console.error("Error getting user currency:", error);
    return 0;
  }
}

/**
 * Add currency to user's balance
 * @param {string} userId - The user's ID
 * @param {number} amount - Amount to add (positive number)
 * @returns {Promise<number>} New balance
 */
export async function addCurrency(userId, amount) {
  try {
    const userRef = doc(db, "users", userId);

    // Use increment to safely update currency
    await updateDoc(userRef, {
      currency: increment(amount),
      lastCurrencyUpdate: serverTimestamp()
    });

    // Get the new balance
    const newBalance = await getUserCurrency(userId);
    return newBalance;
  } catch (error) {
    console.error("Error adding currency:", error);
    throw error;
  }
}

/**
 * Deduct currency from user's balance
 * @param {string} userId - The user's ID
 * @param {number} amount - Amount to deduct (positive number)
 * @returns {Promise<{success: boolean, newBalance: number, message: string}>}
 */
export async function deductCurrency(userId, amount) {
  try {
    const currentBalance = await getUserCurrency(userId);

    if (currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        message: "Insufficient funds"
      };
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currency: increment(-amount),
      lastCurrencyUpdate: serverTimestamp()
    });

    const newBalance = await getUserCurrency(userId);
    return {
      success: true,
      newBalance: newBalance,
      message: "Currency deducted successfully"
    };
  } catch (error) {
    console.error("Error deducting currency:", error);
    return {
      success: false,
      newBalance: 0,
      message: "Error processing transaction"
    };
  }
}

/**
 * Set user's currency to a specific amount
 * @param {string} userId - The user's ID
 * @param {number} amount - Amount to set
 */
export async function setCurrency(userId, amount) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currency: amount,
      lastCurrencyUpdate: serverTimestamp()
    });
  } catch (error) {
    console.error("Error setting currency:", error);
    throw error;
  }
}

// ============================================================================
// QUEST FUNCTIONS
// ============================================================================

/**
 * Quest object structure:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   type: 'daily' | 'weekly' | 'monthly' | 'special',
 *   reward: number,
 *   targetValue: number (e.g., complete 5 chores),
 *   currentProgress: number,
 *   isCompleted: boolean,
 *   isClaimed: boolean,
 *   expiresAt: timestamp (for daily/weekly/monthly),
 *   createdAt: timestamp
 * }
 */

/**
 * Get all quests for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of quest objects
 */
export async function getUserQuests(userId) {
  try {
    const questsRef = collection(db, "users", userId, "quests");
    const snapshot = await getDocs(questsRef);

    const quests = [];
    snapshot.forEach((doc) => {
      quests.push({ id: doc.id, ...doc.data() });
    });

    // Sort by type (daily first, then weekly) and then by order
    return quests.sort((a, b) => {
      // First sort by type
      const typeOrder = { daily: 1, weekly: 2, monthly: 3, special: 4 };
      const typeCompare = (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
      if (typeCompare !== 0) return typeCompare;

      // Then sort by order field
      return (a.order || 0) - (b.order || 0);
    });
  } catch (error) {
    console.error("Error getting user quests:", error);
    return [];
  }
}

/**
 * Get a specific quest by ID
 * @param {string} userId - The user's ID
 * @param {string} questId - The quest's ID
 * @returns {Promise<Object|null>} Quest object or null
 */
export async function getQuest(userId, questId) {
  try {
    const questRef = doc(db, "users", userId, "quests", questId);
    const questSnap = await getDoc(questRef);

    if (questSnap.exists()) {
      return { id: questSnap.id, ...questSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting quest:", error);
    return null;
  }
}

/**
 * Create a new quest for a user
 * @param {string} userId - The user's ID
 * @param {Object} questData - Quest data object
 * @returns {Promise<string>} Quest ID
 */
export async function createQuest(userId, questData) {
  try {
    const questId = questData.id || `quest_${Date.now()}`;
    const questRef = doc(db, "users", userId, "quests", questId);

    const newQuest = {
      ...questData,
      currentProgress: questData.currentProgress || 0,
      isCompleted: false,
      isClaimed: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(questRef, newQuest);
    return questId;
  } catch (error) {
    console.error("Error creating quest:", error);
    throw error;
  }
}

/**
 * Update quest progress
 * @param {string} userId - The user's ID
 * @param {string} questId - The quest's ID
 * @param {number} progressIncrement - Amount to increase progress by
 * @returns {Promise<Object>} Updated quest object
 */
export async function updateQuestProgress(userId, questId, progressIncrement = 1) {
  try {
    const questRef = doc(db, "users", userId, "quests", questId);
    const questSnap = await getDoc(questRef);

    if (!questSnap.exists()) {
      throw new Error("Quest not found");
    }

    const quest = questSnap.data();
    const newProgress = quest.currentProgress + progressIncrement;
    const isCompleted = newProgress >= quest.targetValue;

    await updateDoc(questRef, {
      currentProgress: newProgress,
      isCompleted: isCompleted,
      lastUpdated: serverTimestamp()
    });

    return {
      ...quest,
      currentProgress: newProgress,
      isCompleted: isCompleted
    };
  } catch (error) {
    console.error("Error updating quest progress:", error);
    throw error;
  }
}

/**
 * Claim quest reward
 * @param {string} userId - The user's ID
 * @param {string} questId - The quest's ID
 * @returns {Promise<{success: boolean, reward: number, message: string}>}
 */
export async function claimQuestReward(userId, questId) {
  try {
    const quest = await getQuest(userId, questId);

    if (!quest) {
      return { success: false, reward: 0, message: "Quest not found" };
    }

    if (!quest.isCompleted) {
      return { success: false, reward: 0, message: "Quest not completed yet" };
    }

    if (quest.isClaimed) {
      return { success: false, reward: 0, message: "Reward already claimed" };
    }

    // Mark quest as claimed
    const questRef = doc(db, "users", userId, "quests", questId);
    await updateDoc(questRef, {
      isClaimed: true,
      claimedAt: serverTimestamp()
    });

    // Add currency reward
    await addCurrency(userId, quest.reward);

    return {
      success: true,
      reward: quest.reward,
      message: "Reward claimed successfully!"
    };
  } catch (error) {
    console.error("Error claiming quest reward:", error);
    return { success: false, reward: 0, message: "Error claiming reward" };
  }
}

/**
 * Delete a quest
 * @param {string} userId - The user's ID
 * @param {string} questId - The quest's ID
 */
export async function deleteQuest(userId, questId) {
  try {
    const questRef = doc(db, "users", userId, "quests", questId);
    await deleteDoc(questRef);
  } catch (error) {
    console.error("Error deleting quest:", error);
    throw error;
  }
}

/**
 * Get active (unclaimed) quests
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of active quests
 */
export async function getActiveQuests(userId) {
  try {
    const quests = await getUserQuests(userId);
    return quests.filter(quest => !quest.isClaimed);
  } catch (error) {
    console.error("Error getting active quests:", error);
    return [];
  }
}

/**
 * Get completed but unclaimed quests
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of claimable quests
 */
export async function getClaimableQuests(userId) {
  try {
    const quests = await getUserQuests(userId);
    return quests.filter(quest => quest.isCompleted && !quest.isClaimed);
  } catch (error) {
    console.error("Error getting claimable quests:", error);
    return [];
  }
}

// ============================================================================
// DAILY QUEST INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize default daily quests for a user
 * @param {string} userId - The user's ID
 */
// ============================================================================
// DAILY QUEST INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize default daily quests for a user
 * Prevents duplicates by using fixed IDs and checking if they exist
 * @param {string} userId - The user's ID
 */
export async function initializeDailyQuests(userId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dailyQuests = [
    {
      id: "daily_1_chore",
      title: "Daily Challenge",
      description: "Complete 1 chore today",
      type: "daily",
      reward: 1,
      targetValue: 1,
      order: 1,  // Add order
      expiresAt: tomorrow
    },
    {
      id: "daily_3_chores",
      title: "Daily Challenge",
      description: "Complete 3 chores today",
      type: "daily",
      reward: 5,
      targetValue: 3,
      order: 2,  // Add order
      expiresAt: tomorrow
    }
  ];

  for (const quest of dailyQuests) {
    const existingQuest = await getQuest(userId, quest.id);
    if (!existingQuest) {
      await createQuest(userId, quest);
    }
  }
}

export async function initializeWeeklyQuests(userId) {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const weeklyQuests = [
    {
      id: "weekly_5_chores",
      title: "Weekly Goal",
      description: "Complete 5 chores this week",
      type: "weekly",
      reward: 3,
      targetValue: 5,
      order: 1,  // Add order
      expiresAt: nextWeek
    },
    {
      id: "weekly_10_chores",
      title: "Weekly Goal",
      description: "Complete 10 chores this week",
      type: "weekly",
      reward: 10,
      targetValue: 10,
      order: 2,  // Add order
      expiresAt: nextWeek
    },
    {
      id: "weekly_20_chores",
      title: "Weekly Goal",
      description: "Complete 20+ chores this week",
      type: "weekly",
      reward: 20,
      targetValue: 20,
      order: 3,  // Add order
      expiresAt: nextWeek
    }
  ];

  for (const quest of weeklyQuests) {
    const existingQuest = await getQuest(userId, quest.id);
    if (!existingQuest) {
      await createQuest(userId, quest);
    }
  }
}

/**
 * Trigger quest progress when a chore is completed
 * Call this function whenever a user completes a chore
 * @param {string} userId - The user's ID
 */
export async function onChoreCompleted(userId) {
  try {
    const activeQuests = await getActiveQuests(userId);

    // Update all active daily and weekly quests
    for (const quest of activeQuests) {
      if (quest.type === 'daily' || quest.type === 'weekly') {
        await updateQuestProgress(userId, quest.id, 1);
      }
    }
  } catch (error) {
    console.error("Error updating quests on chore completion:", error);
  }
}

// ============================================================================
// TRANSACTION HISTORY (Optional but useful)
// ============================================================================

/**
 * Log a currency transaction
 * @param {string} userId - The user's ID
 * @param {Object} transaction - Transaction details
 */
export async function logTransaction(userId, transaction) {
  try {
    const transactionId = `trans_${Date.now()}`;
    const transactionRef = doc(db, "users", userId, "transactions", transactionId);

    await setDoc(transactionRef, {
      ...transaction,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging transaction:", error);
  }
}

/**
 * Get user's transaction history
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of transactions
 */
export async function getTransactionHistory(userId) {
  try {
    const transactionsRef = collection(db, "users", userId, "transactions");
    const snapshot = await getDocs(transactionsRef);

    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    return transactions;
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return [];
  }
}
