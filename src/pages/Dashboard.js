import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { magic } from "../lib/magic";

const Dashboard = ({ logout, printMetadata, getMetadata, user, setUser }) => {
  const navigate = useNavigate();

  const finishSocialLogin = useCallback(async () => {
    try {
      const data = await magic.oauth2.getRedirectResult();
      setUser(data.magic.userMetadata);
    } catch (err) {
      navigate("/");
      console.error(err);
    }
  }, [setUser, navigate]);

  // Open Magic user settings (root settings view)
  const handleShowSettings = useCallback(async () => {
    try {
      console.log("Showing settings");
      await magic.user.showSettings();
    } catch (err) {
      console.error("Error showing Magic user settings:", err);
    }
  }, []);

  // Open Magic user settings deeplinked to recovery page
  const handleShowRecoverySettings = useCallback(async () => {
    try {
      console.log("Showing recovery settings");
      await magic.user.showSettings({page:"recovery"});
    } catch (err) {
      console.error("Error showing Magic recovery settings:", err);
    }
  }, []);

  // Extra deep debug before calling getPublicAddress
  const comprehensiveBugDiagnosis = useCallback(async () => {
    console.log("\n🚨 === COMPREHENSIVE BUG DIAGNOSIS ===");

    // 1. BASIC STATE
    console.log("📱 Basic Magic State:");
    console.log("- networkHash:", magic.networkHash);
    console.log("- isConnected:", magic.thirdPartyWallets?.isConnected);
    console.log("- bitcoinChain:", magic.bitcoin?.chain);
    console.log("- endpoint:", magic.endpoint);

    // 2. DECODED PARAMETERS
    console.log("\n📱 Decoded Parameters:");
    try {
      const decodedParams = JSON.parse(atob(magic.parameters));
      console.log(
        "- Full decoded params:",
        JSON.stringify(decodedParams, null, 2)
      );
      console.log("- ETH_NETWORK specifically:", decodedParams.ETH_NETWORK);
      console.log("- ext config:", decodedParams.ext);
    } catch (error) {
      console.log("- ERROR decoding parameters:", error.message);
      console.log(
        "- Raw parameters (first 100 chars):",
        magic.parameters?.substring(0, 100)
      );
    }

    // 3. LOCAL STORAGE SNAPSHOT
    console.log("\n📱 localStorage State RIGHT NOW:");
    try {
      const allKeys = Object.keys(localStorage);
      console.log("- All keys count:", allKeys.length);
      console.log("- All keys:", allKeys);

      const magicRelated = allKeys
        .filter(
          (key) => key.includes("magic") || key.includes("3pw") || key === "rt"
        )
        .map((key) => ({ key, value: localStorage.getItem(key) }));
      console.log("- Magic-related keys:", magicRelated);
    } catch (error) {
      console.log("- ERROR reading localStorage:", error.message);
    }

    // 4. EXTENSION CONFIGURATIONS
    console.log("\n📱 Extension Configurations:");
    console.log("- Bitcoin config full:", magic.bitcoin?.config);
    console.log("- EVM config full:", magic.evm?.config);
    console.log(
      "- Available extensions:",
      Object.keys(magic).filter((key) => magic[key]?.name && magic[key]?.config)
    );

    // 5. THIRD-PARTY WALLET DETAILED STATE
    console.log("\n📱 Third-Party Wallet Detailed State:");
    console.log("- isConnected:", magic.thirdPartyWallets?.isConnected);
    console.log("- enabledWallets:", magic.thirdPartyWallets?.enabledWallets);
    console.log(
      "- eventListeners count:",
      magic.thirdPartyWallets?.eventListeners?.length
    );

    // 6. CURRENT NETWORK STATE
    console.log("\n📱 Current Network Context:");
    try {
      const chainId = await magic.rpcProvider.request({
        method: "eth_chainId",
      });
      console.log("- Current chainId (hex):", chainId);
      console.log("- Current chainId (decimal):", parseInt(chainId, 16));
      console.log("- Is this Base mainnet?:", parseInt(chainId, 16) === 8453);
    } catch (error) {
      console.log("- ERROR getting chainId:", error.message);
    }

    // 7. SWITCH CHAIN RESPONSE
    console.log("\n📱 Testing switchChain(8453) response:");
    try {
      const switchResponse = await magic.evm.switchChain(8453);
      console.log(
        "- switchChain response:",
        JSON.stringify(switchResponse, null, 2)
      );
      console.log(
        "- Does it have chainType?:",
        switchResponse?.network?.chainType
      );
    } catch (error) {
      console.log("- ERROR in switchChain test:", error.message);
    }

    console.log("\n🎯 === ABOUT TO CALL BITCOIN ===\n");
  }, []);

  // Force reproduce the bug by simulating third-party wallet state (no mocks)
  const forceReproduceBug = useCallback(async () => {
    console.log("\n=== FORCING BUG REPRODUCTION ===\n");

    try {
      // Step 0: Get Bitcoin address BEFORE manipulation (should work)
      console.log("Step 0: Getting Bitcoin address BEFORE manipulation...");
      console.log("(This should work properly and return a Bitcoin address)");
      let btcAddressBefore = null;
      try {
        btcAddressBefore = await magic.bitcoin.getPublicAddress();
        console.log(
          "✅ Bitcoin address (before manipulation):",
          btcAddressBefore
        );
        console.log(
          "Address type:",
          btcAddressBefore.startsWith("0x")
            ? "EVM (WRONG!)"
            : "Bitcoin (correct)"
        );
      } catch (err) {
        console.error(
          "❌ Error getting Bitcoin address before manipulation:",
          err?.message ?? err
        );
      }
      console.log("\n");

      // STEP 1: Force thirdPartyWallets.isConnected = true
      console.log("Step 1: Setting thirdPartyWallets.isConnected = true...");
      if (magic.thirdPartyWallets) {
        // Set the 3pw provider from localStorage to web3modal
        localStorage.setItem("magic_3pw_provider", "web3modal");
        const provider = localStorage.getItem("magic_3pw_provider");
        console.log("✓ 3pw provider set to web3modal:", provider);
        console.log("\n");
        magic.thirdPartyWallets.isConnected = false;
        console.log("✓ isConnected set to false");
      } else {
        console.log("⚠️ thirdPartyWallets not available\n");
      }

      // Debug: Verify state
      console.log("Verification - Third party wallet state:");
      console.log("- isConnected:", magic.thirdPartyWallets?.isConnected);
      console.log("- Provider:", localStorage.getItem("magic_3pw_provider"));
      console.log("- Address:", localStorage.getItem("magic_3pw_address"));
      console.log("- ChainId:", localStorage.getItem("magic_3pw_chainId"));
      console.log("\n");

      // STEP 3: Try to get Bitcoin address AFTER manipulation
      console.log("Step 3: Getting Bitcoin address AFTER manipulation...");
      console.log("(If bug exists, this will return the Base EVM address)");

      await comprehensiveBugDiagnosis();

      const btcAddress = await magic.bitcoin.getPublicAddress();

      console.log("🎯 BITCOIN RESULT:", btcAddress);
      console.log("🎯 IS BUG PRESENT?:", btcAddress.startsWith("0x"));

      if (btcAddress.startsWith("0x")) {
        console.error("🐛 BUG SUCCESSFULLY REPRODUCED!");
        console.error(
          "❌ Bitcoin getPublicAddress returned EVM/Base address:",
          btcAddress
        );

        const storedAddress = localStorage.getItem("magic_3pw_address");
        if (storedAddress && btcAddress === storedAddress) {
          console.error(
            "✅ CONFIRMED: BTC call returned the stored Base EVM address!"
          );
        }
      } else {
        console.log("❌ Bug NOT reproduced. Got Bitcoin address:", btcAddress);
      }

      // STEP 4: Test the fix by clearing 3PW state
      console.log("\nStep 4: Testing fix by clearing 3PW state...");
      if (magic.thirdPartyWallets?.resetThirdPartyWalletState) {
        magic.thirdPartyWallets.resetThirdPartyWalletState();
        console.log("✓ resetThirdPartyWalletState() called");
      } else {
        localStorage.removeItem("magic_3pw_provider");
        localStorage.removeItem("magic_3pw_address");
        localStorage.removeItem("magic_3pw_chainId");
        if (magic.thirdPartyWallets) {
          magic.thirdPartyWallets.isConnected = false;
        }
        console.log("✓ Manual 3PW cleanup performed");
      }

      const btcAddressFixed = await magic.bitcoin.getPublicAddress();
      console.log("After fix - BTC address:", btcAddressFixed);
      if (!btcAddressFixed.startsWith("0x")) {
        console.log("✅ FIX CONFIRMED: Now getting proper Bitcoin address");
      }
    } catch (err) {
      console.error("Error during bug reproduction:", err);
      console.error("Error message:", err?.message);
      console.error("Error stack:", err?.stack);

      // After the error, clear 3PW state and retry getPublicAddress
      try {
        console.log(
          "\n[Recovery] Clearing 3PW state and retrying Bitcoin getPublicAddress..."
        );
        if (magic.thirdPartyWallets?.resetThirdPartyWalletState) {
          magic.thirdPartyWallets.resetThirdPartyWalletState();
          console.log("[Recovery] resetThirdPartyWalletState() called");
        } else {
          localStorage.removeItem("magic_3pw_provider");
          localStorage.removeItem("magic_3pw_address");
          localStorage.removeItem("magic_3pw_chainId");
          if (magic.thirdPartyWallets) {
            magic.thirdPartyWallets.isConnected = false;
          }
          console.log("[Recovery] Manual 3PW cleanup performed");
        }

        const btcAddressAfterError = await magic.bitcoin.getPublicAddress();
        console.log(
          "[Recovery] Bitcoin address after clearing 3PW state:",
          btcAddressAfterError
        );
      } catch (recoveryErr) {
        console.error(
          "[Recovery] Error while resetting 3PW state or retrying BTC call:",
          recoveryErr
        );
      }
    }

    console.log("\n=== END BUG REPRODUCTION ===\n");
  }, []);

  useEffect(() => {
    if (localStorage.getItem("isOauthRedirect")) {
      finishSocialLogin();
      localStorage.removeItem("isOauthRedirect");
    } else {
      getMetadata();
    }
  }, [finishSocialLogin, getMetadata]);

  return (
    <div className="container">
      {!user && <div className="loading">Loading...</div>}

      {user && (
        <>
          <div>
            <h1>Data returned:</h1>
            <pre className="user-info">{JSON.stringify(user, null, 3)}</pre>
          </div>
          <br />
          <button className="logout-button" onClick={printMetadata}>
            Print Metadata
          </button>
          <br />
          <button className="logout-button" onClick={handleShowSettings}>
            Account Settings
          </button>
          <br />
          <button
            className="logout-button"
            onClick={handleShowRecoverySettings}
          >
            Recovery Settings
          </button>
          <br />
          <button className="logout-button" onClick={forceReproduceBug}>
            🐛 Force Reproduce Bug (3PW State)
          </button>
          <br />
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
