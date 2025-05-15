import React, { createContext, useState, useContext, useEffect } from "react";
import { Network, getNetworkName, getNetworkToken } from "./networkUtils";
import { createMagicInstance } from "./magic";

// Create context for network state
const NetworkContext = createContext(undefined);

export const NetworkProvider = ({ children }) => {
  // Default to Ethereum Mainnet
  const [currentNetwork, setCurrentNetwork] = useState(Network.ETHEREUM);
  const [magicInstance, setMagicInstance] = useState(null);

  // Initialize or update Magic instance when network changes
  useEffect(() => {
    try {
      const newMagicInstance = createMagicInstance(currentNetwork);
      setMagicInstance(newMagicInstance);
    } catch (error) {
      console.error("Error creating Magic instance:", error);
    }
  }, [currentNetwork]);

  // Handle network switching
  const switchNetwork = (network) => {
    setCurrentNetwork(network);
  };

  // Get network display name
  const networkName = getNetworkName(currentNetwork);
  const networkToken = getNetworkToken(currentNetwork);

  return (
    <NetworkContext.Provider
      value={{
        currentNetwork,
        magicInstance,
        switchNetwork,
        networkName,
        networkToken,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook to use the network context
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
