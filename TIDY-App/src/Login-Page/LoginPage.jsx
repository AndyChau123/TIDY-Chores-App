import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./LoginPage.css";

import TidyLogo from "../assets/TidyLogo.png";

// ============================================================================
// GENERATE RANDOM FAMILY CODE
// Format: TIDY-XXXXXX (6 alphanumeric characters)
// ============================================================================
function generateFamilyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
  let code = 'TIDY-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function LoginPage() {
  const [loginCode, setLoginCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ============================================================================
  // SIGNUP OVERLAY STATE
  // ============================================================================
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // ============================================================================
  // CODE DISPLAY STATE (after successful signup)
  // ============================================================================
  const [showCodeDisplay, setShowCodeDisplay] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  // ============================================================================
  // LOGIN WITH FAMILY CODE
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const codeToCheck = loginCode.toUpperCase().trim();

    try {
      // Look up the family code in Firestore
      const familiesRef = collection(db, 'families');
      const q = query(familiesRef, where('code', '==', codeToCheck));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid code. Please try again.");
        setLoginCode("");
        return;
      }

      // Get the family data
      const familyDoc = querySnapshot.docs[0];
      const familyData = familyDoc.data();

      // Store family info in localStorage
      localStorage.setItem('familyId', familyDoc.id);
      localStorage.setItem('familyCode', codeToCheck);
      localStorage.setItem('familyName', familyData.name || 'My Family');

      console.log('Logged in with family code:', codeToCheck);
      navigate("/app");

    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setLoginCode("");
    }
  };

  // ============================================================================
  // SIGNUP - CREATE NEW FAMILY
  // ============================================================================
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      setSignupLoading(false);
      return;
    }

    try {
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;
      console.log('Auth account created:', user.email);

      // 2. Generate unique family code with robust duplicate checking
      let newCode = generateFamilyCode();
      let codeIsUnique = false;
      let attempts = 0;
      const maxAttempts = 20;

      while (!codeIsUnique && attempts < maxAttempts) {
        try {
          const familiesRef = collection(db, 'families');
          const q = query(familiesRef, where('code', '==', newCode));
          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            codeIsUnique = true;
            console.log(`Generated unique code: ${newCode} (attempt ${attempts + 1})`);
          } else {
            console.log(`Code ${newCode} already exists, generating new one...`);
            newCode = generateFamilyCode();
            attempts++;
          }
        } catch (queryError) {
          console.error('Error checking code uniqueness:', queryError);
          // Generate a new code and try again
          newCode = generateFamilyCode();
          attempts++;
        }
      }

      if (!codeIsUnique) {
        throw new Error('Could not generate unique code. Please try again.');
      }

      // 3. Create family document in Firestore
      const familyId = user.uid;
      await setDoc(doc(db, 'families', familyId), {
        code: newCode,
        name: familyName || 'My Family',
        ownerEmail: signupEmail,
        ownerUid: user.uid,
        createdAt: new Date().toISOString(),
        currency: 100,
        members: [],
        settings: {
          theme: 'default',
          notifications: true
        }
      });

      // 4. Store in localStorage for app access
      localStorage.setItem('familyId', familyId);
      localStorage.setItem('familyCode', newCode);
      localStorage.setItem('familyName', familyName || 'My Family');

      // 5. Sign out of Firebase Auth (we use code-based access)
      await signOut(auth);

      // 6. Show the generated code
      setGeneratedCode(newCode);
      setShowSignup(false);
      setShowCodeDisplay(true);

      console.log('Family created with code:', newCode);

    } catch (err) {
      console.error('Signup error:', err);

      switch (err.code) {
        case 'auth/email-already-in-use':
          setSignupError('This email is already registered.');
          break;
        case 'auth/invalid-email':
          setSignupError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setSignupError('Password is too weak. Use at least 6 characters.');
          break;
        case 'auth/operation-not-allowed':
          setSignupError('Email/Password sign-in is not enabled. Please contact the app administrator.');
          break;
        default:
          setSignupError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setSignupLoading(false);
    }
  };

  // ============================================================================
  // COPY CODE TO CLIPBOARD
  // ============================================================================
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = generatedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ============================================================================
  // CONTINUE TO APP (after seeing code)
  // ============================================================================
  const continueToApp = () => {
    navigate('/app');
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={TidyLogo} alt="Tidy Logo" />
      </div>
      <div className="login-box">
        <h2>Welcome</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your access code"
            value={loginCode}
            onChange={(e) => {
              setLoginCode(e.target.value.toUpperCase());
              setError("");
            }}
            required
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit">Login</button>
        </form>

        {/* Link to open signup overlay */}
        <div className="signup-link">
          <span>Don't have a code? </span>
          <button
            type="button"
            className="link-button"
            onClick={() => setShowSignup(true)}
          >
            Create a Family
          </button>
        </div>
      </div>

      {/* ========================================================================
          SIGNUP OVERLAY
          ======================================================================== */}
      {showSignup && (
        <div className="overlay">
          <div className="overlay-content">
            <button
              className="overlay-close"
              onClick={() => {
                setShowSignup(false);
                setSignupError("");
                setSignupEmail("");
                setSignupPassword("");
                setFamilyName("");
              }}
            >
              ×
            </button>

            <h2>Create Your Family</h2>
            <p className="overlay-subtitle">Sign up to get your unique family access code</p>

            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Family Name (e.g., The Smiths)"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={signupLoading}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={signupEmail}
                onChange={(e) => {
                  setSignupEmail(e.target.value);
                  setSignupError("");
                }}
                required
                disabled={signupLoading}
              />
              <input
                type="password"
                placeholder="Create Password (min 6 characters)"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value);
                  setSignupError("");
                }}
                required
                disabled={signupLoading}
                minLength={6}
              />

              {signupError && <div className="login-error">{signupError}</div>}

              <button type="submit" disabled={signupLoading}>
                {signupLoading ? 'Creating...' : 'Create Family'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          CODE DISPLAY OVERLAY (after successful signup)
          ======================================================================== */}
      {showCodeDisplay && (
        <div className="overlay">
          <div className="overlay-content code-display-content">
            <div className="success-icon">🎉</div>
            <h2>Family Created!</h2>
            <p className="overlay-subtitle">
              Share this code with your family members:
            </p>

            <div className="code-display-box">
              <span className="generated-code">{generatedCode}</span>
              <button
                className="copy-button"
                onClick={copyToClipboard}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>

            <div className="code-warning">
              <p>⚠️ <strong>Save this code!</strong></p>
              <p>You'll need it to log in and share with family members.</p>
            </div>

            <button onClick={continueToApp}>
              Continue to App →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
