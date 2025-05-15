import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useNetwork } from "../lib/NetworkContext";


const Login = () => {
  const navigate = useNavigate();
  const { magicInstance } = useNetwork();

  const handleEmailOtpLogin = useCallback(async () => {
    if (!magicInstance) return;

    try {
      const did = await magicInstance.wallet.connectWithUI();
      if (did) navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  }, [navigate, magicInstance]);

  const handleSocialLogin = useCallback(
    async (provider) => {
      if (!magicInstance) return;

      try {
        await magicInstance.oauth2.loginWithRedirect({
          provider: provider,
          redirectURI: new URL("/dashboard", window.location.origin).href,
        });
        localStorage.setItem("isOauthRedirect", true);
      } catch (err) {
        console.error(err);
      }
    },
    [magicInstance]
  );

  return (
    <div className="container">
      <h1>Welcome to Multi-Chain Magic</h1>


      {!magicInstance ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <button onClick={handleEmailOtpLogin}>Login with Email OTP</button>
          <br />
          <button onClick={() => handleSocialLogin("google")}>
            <FaGoogle size={"2.5rem"} />
            Log in with Google
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
