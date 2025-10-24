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

      // === LOG ALL BROWSER STORAGE ===
      console.log("=== BROWSER STORAGE AUDIT ===");

      // 1. LOCAL STORAGE - TARGET MAGIC SESSION KEYS
      console.log("LOCAL STORAGE:");
      if (localStorage.length === 0) {
        console.log("  (empty)");
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);

          // Highlight critical Magic session keys
          if (key === "embedded-store") {
            console.log(`  [CRITICAL] ${key}:`, value);
            try {
              const parsed = JSON.parse(value);
              console.log(`    embedded-store parsed:`, parsed);
            } catch (e) {
              console.log(`    embedded-store parse error:`, e.message);
            }
          } else if (key.includes("oidcProviderId")) {
            console.log(`  [OAUTH] ${key}:`, value);
          } else if (key.includes("persist:auth:")) {
            console.log(`  [SESSION] ${key}:`, value);
          } else if (key.match(/^pk_[a-z]+_[a-zA-Z0-9]+-oidcProviderId$/)) {
            console.log(`  [API_KEY_OAUTH] ${key}:`, value);
          } else if (key.startsWith("pk_") && key.includes("-")) {
            console.log(`  [POTENTIAL_MAGIC_KEY] ${key}:`, value);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      }

      // 2. SESSION STORAGE
      console.log("SESSION STORAGE:");
      if (sessionStorage.length === 0) {
        console.log("  (empty)");
      } else {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const value = sessionStorage.getItem(key);
          console.log(`  ${key}:`, value);
        }
      }

      // 3. COOKIES - TARGET MAGIC SESSION COOKIES
      console.log("COOKIES:");
      if (document.cookie === "") {
        console.log("  (no cookies)");
      } else {
        const cookies = document.cookie.split(";");
        cookies.forEach((cookie) => {
          const [name, ...rest] = cookie.split("=");
          const value = rest.join("=");
          const cookieName = name.trim();

          // Highlight critical Magic session cookies
          if (cookieName === "_aurt") {
            console.log(`  [REFRESH_TOKEN] ${cookieName}:`, value);
          } else if (cookieName === "_aucsrf") {
            console.log(`  [CSRF_TOKEN] ${cookieName}:`, value);
          } else {
            console.log(`  ${cookieName}:`, value);
          }
        });
      }

      // 4. CHECK MAGIC SDK STATE
      console.log("MAGIC SDK STATE:");
      try {
        // Check if SDK is initialized
        if (!magic) {
          console.error("  Magic SDK not initialized!");
        } else {
          console.log("  Magic SDK initialized: true");

          // Try to extract API key for oidcProviderId pattern matching
          try {
            if (magic.apiKey) {
              console.log("  Magic API Key:", magic.apiKey);
              console.log(
                "  Expected oidcProviderId key pattern:",
                `${magic.apiKey}-oidcProviderId`
              );
            }
          } catch (keyErr) {
            console.log("  API Key not accessible:", keyErr.message);
          }

          // Try to access internal SDK metadata (if accessible)
          try {
            if (magic.user && magic.user._internal) {
              console.log("  SDK internal state:", magic.user._internal);
            }
            if (magic.auth && magic.auth._metadata) {
              console.log("  Auth metadata:", magic.auth._metadata);
            }
            if (magic._config) {
              console.log("  SDK config:", magic._config);
            }
          } catch (internalErr) {
            console.log("  SDK internal state: not accessible");
          }
        }
      } catch (sdkErr) {
        console.error("  Magic SDK error:", sdkErr);
      }

      // 5. INDEXEDDB - TARGET MAGIC SESSION DATABASES
      console.log("INDEXEDDB CONTENT:");
      try {
        if ("indexedDB" in window) {
          const databases = await indexedDB.databases();
          if (databases.length === 0) {
            console.log("  (no databases)");
          } else {
            console.log(
              "  Available databases:",
              databases.map((db) => db.name)
            );

            // Specifically look for Magic databases
            for (const dbInfo of databases) {
              if (
                dbInfo.name === "MagicAuthLocalStorageDB" ||
                dbInfo.name === "magic_auth" ||
                dbInfo.name.includes("magic")
              ) {
                console.log(`[MAGIC DB] Database: ${dbInfo.name}`);
              } else {
                console.log(`Database: ${dbInfo.name}`);
              }

              try {
                const dbPromise = new Promise((resolve, reject) => {
                  const request = indexedDB.open(dbInfo.name);

                  request.onsuccess = (event) => {
                    const db = event.target.result;
                    console.log(`  Object stores:`, [...db.objectStoreNames]);

                    // Try to read data from each object store
                    const storeNames = [...db.objectStoreNames];
                    storeNames.forEach((storeName) => {
                      try {
                        const transaction = db.transaction(
                          storeName,
                          "readonly"
                        );
                        const objectStore = transaction.objectStore(storeName);

                        // For Magic stores, get all keys first
                        if (
                          storeName === "MagicAuthLocalStorage" ||
                          storeName === "keyvaluepairs"
                        ) {
                          const getAllKeys = objectStore.getAllKeys();
                          getAllKeys.onsuccess = () => {
                            const keys = getAllKeys.result;
                            console.log(
                              `  [MAGIC STORE] '${storeName}' keys (${keys.length}):`,
                              keys
                            );

                            // Get values for persist:auth keys specifically
                            keys.forEach((key) => {
                              if (key.toString().includes("persist:auth:")) {
                                const getRequest = objectStore.get(key);
                                getRequest.onsuccess = () => {
                                  console.log(
                                    `    [SESSION_DATA] ${key}:`,
                                    getRequest.result
                                  );
                                };
                              }
                            });
                          };
                        }

                        const getAllRequest = objectStore.getAll();
                        getAllRequest.onsuccess = () => {
                          const data = getAllRequest.result;
                          console.log(
                            `  Store '${storeName}' (${data.length} items):`
                          );

                          // Log each item (limit to first 3 to avoid spam)
                          data.slice(0, 3).forEach((item, idx) => {
                            if (
                              typeof item === "object" &&
                              item.key &&
                              item.key.includes("persist:auth:")
                            ) {
                              console.log(
                                `    [SESSION_KEY] Item ${idx}:`,
                                item
                              );
                            } else if (
                              typeof item === "string" &&
                              item.includes("persist:auth")
                            ) {
                              console.log(
                                `    [SESSION_STRING] Item ${idx}: persist:auth found`
                              );
                            } else {
                              console.log(
                                `    Item ${idx}:`,
                                typeof item === "object"
                                  ? JSON.stringify(item).substring(0, 100) +
                                      "..."
                                  : item
                              );
                            }
                          });

                          if (data.length > 3) {
                            console.log(
                              `    ... and ${data.length - 3} more items`
                            );
                          }
                        };

                        getAllRequest.onerror = () => {
                          console.log(`  Could not read store '${storeName}'`);
                        };
                      } catch (err) {
                        console.log(
                          `  Error accessing store '${storeName}':`,
                          err.message
                        );
                      }
                    });

                    db.close();
                    resolve();
                  };

                  request.onerror = () => reject(request.error);
                });

                await dbPromise;
              } catch (err) {
                console.log(
                  `  Could not access database '${dbInfo.name}':`,
                  err.message
                );
              }
            }
          }
        } else {
          console.log("  IndexedDB not supported");
        }
      } catch (err) {
        console.log("  Error accessing IndexedDB:", err.message);
      }

      // 6. PLATFORM DETECTION
      console.log("PLATFORM INFO:");
      console.log("  User Agent:", navigator.userAgent);
      console.log("  Platform:", navigator.platform);
      console.log(
        "  Is iOS Safari:",
        /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
      );
      console.log(
        "  Is Standalone (PWA):",
        window.navigator.standalone === true
      );
      try {
        console.log(
          "  Storage persisted:",
          navigator.storage
            ? await navigator.storage.persisted()
            : "API not available"
        );
      } catch (err) {
        console.log("  Storage persisted: Error checking -", err.message);
      }

      // 7. TIMESTAMP
      console.log("Session check timestamp:", new Date().toISOString());
      console.log("=== END STORAGE AUDIT ===");

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
          console.log("  User Metadata Extract:", {
            publicAddress: metadata.publicAddress,
            email: metadata.email,
            issuer: metadata.issuer,
            authUserId: metadata.authUserId || "not available",
            authUserSessionToken:
              metadata.authUserSessionToken || "not available",
          });
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
      console.error(err);
    }
  }, [navigate]);

  const printMetadata = useCallback(async () => {
    try {
      const metadata = await magic.user.getInfo();
      console.log(metadata);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await magic.user.logout();
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error(err);
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
