import { useCallback, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { magic } from "./lib/magic";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState();
  const [sessionStatus, setSessionStatus] = useState(null); // null, 'checking', 'persisted', 'none', 'error'
  const navigate = useNavigate();

  // Test Magic session persistence on app load
  useEffect(() => {
    const testMagicSession = async () => {
      console.log("=== Testing Magic Session Persistence ===");
      setSessionStatus("checking");

      // === MAGIC SESSION TEST ===
      console.log("MAGIC SESSION TEST:");
      try {
        // Test isLoggedIn
        const isLoggedIn = await magic.user.isLoggedIn();
        console.log("  magic.user.isLoggedIn():", isLoggedIn);

        if (isLoggedIn) {
          // If logged in, try to get metadata
          const metadata = await magic.user.getInfo();
          console.log("  magic.user.getInfo():", metadata);
          console.log("  [SUCCESS] Magic session persisted properly!");

          // Set user state and redirect to dashboard
          setUser(metadata);
          setSessionStatus("persisted");

          // Only redirect if currently on login page
          if (window.location.pathname === "/") {
            console.log("  Redirecting to dashboard...");
            navigate("/dashboard");
          }
        } else {
          console.log("  [FAILURE] User is not logged in, session not found");
          setSessionStatus("none");
        }
      } catch (err) {
        console.error("  [ERROR] Magic session test error:", err);
        setSessionStatus("error");
      }

      console.log("=== End Magic Session Test ===");
    };

    testMagicSession();
  }, [navigate, setUser]);

  const getMetadata = useCallback(async () => {
    try {
      const metadata = await magic.user.getInfo();
      setUser(metadata);
    } catch (err) {
      navigate("/");
    }
  }, [navigate]);

  const printMetadata = useCallback(async () => {
    try {
      const metadata = await magic.user.getInfo();
      console.log(metadata);
    } catch (err) {
      // Silent error handling
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await magic.user.logout();
      setUser(null);
      navigate("/");
    } catch (err) {
      // Silent error handling
    }
  }, [navigate]);

  return (
    <div className="App">
      {/* Session Status Message */}
      {sessionStatus && (
        <div
          style={{
            padding: "10px",
            margin: "10px",
            borderRadius: "5px",
            textAlign: "center",
            backgroundColor:
              sessionStatus === "persisted"
                ? "#d4edda"
                : sessionStatus === "none"
                ? "#f8d7da"
                : sessionStatus === "error"
                ? "#f8d7da"
                : "#d1ecf1",
            color:
              sessionStatus === "persisted"
                ? "#155724"
                : sessionStatus === "none"
                ? "#721c24"
                : sessionStatus === "error"
                ? "#721c24"
                : "#0c5460",
          }}
        >
          {sessionStatus === "checking" && "Checking Magic session..."}
          {sessionStatus === "persisted" &&
            "Magic session persisted! User is still logged in."}
          {sessionStatus === "none" &&
            "No active session found. Please log in."}
          {sessionStatus === "error" && "Error checking session status."}
        </div>
      )}

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
    </div>
  );
}

export default App;
