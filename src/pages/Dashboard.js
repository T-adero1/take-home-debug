import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNetwork } from "../lib/NetworkContext";
import NetworkSelector from "../components/NetworkSelector";


const Dashboard = ({ logout, printMetadata, getMetadata, user, setUser }) => {
  const navigate = useNavigate();
  const { magicInstance, networkName, networkToken } = useNetwork();

  const finishSocialLogin = useCallback(async () => {
    if (!magicInstance) return;

    try {
      const data = await magicInstance.oauth2.getRedirectResult();
      setUser(data.magic.userMetadata);
    } catch (err) {
      navigate("/");
      console.error(err);
    }
  }, [setUser, navigate, magicInstance]);

  useEffect(() => {
    if (!magicInstance) return;

    if (localStorage.getItem("isOauthRedirect")) {
      finishSocialLogin();
      localStorage.removeItem("isOauthRedirect");
    } else {
      getMetadata(magicInstance);
    }
  }, [finishSocialLogin, getMetadata, magicInstance]);

  const handlePrintMetadata = () => {
    printMetadata(magicInstance);
  };

  const handleLogout = () => {
    logout(magicInstance);
  };

  return (
    <div className="container">
      <NetworkSelector />

      {(!user || !magicInstance) && <div className="loading">Loading...</div>}

      {user && magicInstance && (
        <>
          <div>
            <h1>
              {networkName} ({networkToken}) Wallet
            </h1>
            <h2>User Data:</h2>
            <pre className="user-info">{JSON.stringify(user, null, 3)}</pre>
          </div>


          <br />
          <button className="logout-button" onClick={handlePrintMetadata}>
            Print Metadata
          </button>
          <br />
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
