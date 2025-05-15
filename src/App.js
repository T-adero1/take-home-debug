import { useCallback, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { NetworkProvider } from "./lib/NetworkContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState();
  const navigate = useNavigate();

  const getMetadata = useCallback(
    async (magicInstance) => {
      try {
        const metadata = await magicInstance.user.getInfo();
        setUser(metadata);
      } catch (err) {
        navigate("/");
        console.error(err);
      }
    },
    [navigate]
  );

  const printMetadata = useCallback(async (magicInstance) => {
    try {
      const metadata = await magicInstance.user.getInfo();
      console.log(metadata);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const logout = useCallback(
    async (magicInstance) => {
      try {
        await magicInstance.user.logout();
        setUser(null);
        navigate("/");
      } catch (err) {
        console.error(err);
      }
    },
    [navigate]
  );

  return (
    <div className="App">
      <NetworkProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                user={user}
                logout={logout}
                setUser={setUser}
                printMetadata={printMetadata}
                getMetadata={getMetadata}
              />
            }
          />
        </Routes>
      </NetworkProvider>
    </div>
  );
}

export default App;
