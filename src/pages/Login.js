import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { magic } from "../lib/magic";


const Login = () => {
  const navigate = useNavigate();

  const handleEmailOtpLogin = useCallback(async () => {
    try {
      const did = await magic.wallet.connectWithUI();
      if (did) navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  }, [navigate]);

  const handleSocialLogin = useCallback(async (provider) => {
    try {
      await magic.oauth2.loginWithRedirect({
        provider: provider,
        redirectURI: new URL("/dashboard", window.location.origin).href,
      });
      localStorage.setItem("isOauthRedirect", true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="container">
    <h1>Welcome to Magic</h1>
      <button onClick={handleEmailOtpLogin}>
        Login with Email OTP
      </button>
      <br />
      <button onClick={() => handleSocialLogin('google')}>
        <FaGoogle size={"2.5rem"} />
        Log in with Google
      </button>
    </div>
  );
};

export default Login;
