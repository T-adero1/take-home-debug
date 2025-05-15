import React from "react";
import { useNetwork } from "../lib/NetworkContext";
import { Network, getNetworkName, getNetworkToken } from "../lib/networkUtils";

const NetworkSelector = () => {
  const { currentNetwork, switchNetwork } = useNetwork();

  const networks = [
    Network.ETHEREUM,
    Network.ETHEREUM_SEPOLIA,
    Network.BITCOIN,
    Network.BITCOIN_TESTNET,
  ];

  return (
    <div className="network-selector">
      <label htmlFor="network-select">Current Network: </label>
      <select
        id="network-select"
        value={currentNetwork}
        onChange={(e) => switchNetwork(e.target.value)}
      >
        {networks.map((network) => (
          <option key={network} value={network}>
            {getNetworkName(network)} ({getNetworkToken(network)})
          </option>
        ))}
      </select>
    </div>
  );
};

export default NetworkSelector;
