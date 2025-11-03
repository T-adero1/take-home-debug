import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { magic } from "../lib/magic";

const Login = () => {
  const navigate = useNavigate();

  const logMagicState = async (label) => {
    try {
      console.log(`=== MAGIC STATE ${label} ===`);
      console.log("Magic instance:", magic);
      console.log("Magic instance ID/reference:", magic.constructor.name);

      const isLoggedIn = await magic.user.isLoggedIn();
      console.log("Is logged in:", isLoggedIn);

      if (isLoggedIn) {
        const metadata = await magic.user.getInfo();
        console.log("Current user metadata:", metadata);
        console.log("User email:", metadata.email);
        console.log("User issuer:", metadata.issuer);
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

  return (
    <div className="container">
      <h1>Welcome to Magic</h1>
      <button onClick={handleEmailOtpLogin}>Login with Email OTP</button>
      <br />
      <button onClick={() => handleSocialLogin("google")}>
        <FaGoogle size={"2.5rem"} />
        Log in with Google
      </button>
    </div>
  );
};

export default Login;
