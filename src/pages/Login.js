import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaSms } from "react-icons/fa";
import { magic } from "../lib/magic";

const Login = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");

  const logMagicState = async (label) => {
    try {
      console.log(`=== MAGIC STATE ${label} ===`);
      console.log("Magic instance:", magic);
      console.log("Magic instance ID/reference:", magic.constructor.name);

      const isLoggedIn = await magic.user.isLoggedIn();
      console.log("Is logged in:", isLoggedIn);

      if (isLoggedIn) {
        try {
          const metadata = await magic.user.getInfo();
          console.log("Current user metadata:", metadata);
          console.log("User email:", metadata.email);
          console.log("User issuer:", metadata.issuer);
        } catch (metadataErr) {
          console.error("Error getting user metadata:", metadataErr);
        }
      } else {
        console.log("No current user session");
      }

      // Try to get ID token if logged in
      if (isLoggedIn) {
        try {
          const idToken = await magic.user.getIdToken();
          console.log("Current ID token:", idToken);
          console.log("ID token length:", idToken ? idToken.length : "null");
        } catch (tokenErr) {
          console.log("Could not get ID token:", tokenErr.message);
        }
      }

      console.log(`=== END MAGIC STATE ${label} ===`);
    } catch (err) {
      console.error(`Error logging Magic state ${label}:`, err);
    }
  };

  const handleEmailOtpLogin = useCallback(async () => {
    try {
      await logMagicState("BEFORE EMAIL LOGIN");

      const did = await magic.wallet.connectWithUI();

      await logMagicState("AFTER EMAIL LOGIN");

      if (did) navigate("/dashboard");
    } catch (err) {
      await logMagicState("AFTER EMAIL LOGIN ERROR");
    }
  }, [navigate]);

  const handleSocialLogin = useCallback(async (provider) => {
    try {
      await logMagicState("BEFORE SOCIAL LOGIN");

      await magic.oauth2.loginWithRedirect({
        provider: provider,
        redirectURI: new URL("/dashboard", window.location.origin).href,
      });
      localStorage.setItem("isOauthRedirect", true);

      await logMagicState("AFTER SOCIAL LOGIN REDIRECT");
    } catch (err) {
      await logMagicState("AFTER SOCIAL LOGIN ERROR");
    }
  }, []);

  const handleSmsLogin = useCallback(async () => {
    try {
      if (!phoneNumber) {
        alert("Please enter a phone number");
        return;
      }

      await logMagicState("BEFORE SMS LOGIN");

      const did = await magic.auth.loginWithSMS({
        phoneNumber: phoneNumber,
      });

      await logMagicState("AFTER SMS LOGIN");

      if (did) {
        console.log(`DID Token: ${did}`);
        const userInfo = await magic.user.getInfo();
        console.log(`UserInfo:`, userInfo);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("SMS login error:", err);
      await logMagicState("AFTER SMS LOGIN ERROR");
    }
  }, [phoneNumber, navigate]);

  return (
    <div className="container">
      <h1>Welcome to Magic</h1>
      <button onClick={handleEmailOtpLogin}>Login with Email OTP</button>
      <br />
      <button onClick={() => handleSocialLogin("google")}>
        <FaGoogle size={"2.5rem"} />
        Log in with Google
      </button>
      <br />
      <div style={{ marginTop: "20px", marginBottom: "10px" }}>
        <input
          type="tel"
          placeholder="Enter phone number (e.g., +1234567890)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            marginBottom: "10px",
            fontSize: "16px",
          }}
        />
      </div>
      <button onClick={handleSmsLogin}>
        <FaSms size={"2.5rem"} />
        Log in with SMS
      </button>
    </div>
  );
};

export default Login;
