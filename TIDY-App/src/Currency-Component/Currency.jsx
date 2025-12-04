import React, { useState, useEffect } from "react";
import "./Currency.css";

// Import your currency icon here when you create it
// import CurrencyIcon from "../assets/CurrencyIcon.png";

function Currency({ userId }) {
  const [currencyAmount, setCurrencyAmount] = useState(0);

  // Load currency from Firebase when component mounts
  useEffect(() => {
    // TODO: Replace this with your Firebase call
    // async function loadCurrency() {
    //   const amount = await getCurrencyFromDB(userId);
    //   setCurrencyAmount(amount);
    // }
    // loadCurrency();

    // Temporary: Set initial currency for testing
    setCurrencyAmount(1250);
  }, [userId]);

  // Function to update currency (you'll connect this to Firebase)
  const updateCurrency = (newAmount) => {
    setCurrencyAmount(newAmount);
    // TODO: Save to Firebase
    // await saveCurrencyToDB(userId, newAmount);
  };

  return (
    <div className="currency-display">
      {/* Replace this div with your currency icon image when ready */}
      <div className="currency-icon" style={{
        backgroundColor: '#FFD700',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        $
      </div>
      {/* Uncomment when you have your icon:
      <img src={CurrencyIcon} alt="Currency" className="currency-icon" />
      */}
      <span className="currency-amount">{currencyAmount.toLocaleString()}</span>
    </div>
  );
}

export default Currency;
