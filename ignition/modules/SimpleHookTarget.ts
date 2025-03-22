// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleHookTargetModule = buildModule("SimpleHookTargetModule", (m) => {
  const hookTarget = m.contract("SimpleHookTarget");

  return { hookTarget };
});

export default SimpleHookTargetModule;
