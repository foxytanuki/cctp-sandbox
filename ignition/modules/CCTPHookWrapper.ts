// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AVALANCHE_FUJI_MESSAGE_TRANSMITTER_ADDRESS =
  "0xe737e5cebeeba77efe34d4aa090756590b1ce275";

const CCTPHookWrapperModule = buildModule("CCTPHookWrapperModule", (m) => {
  // Parameter for the message transmitter address required by the CCTPHookWrapper constructor
  const messageTransmitter = m.getParameter(
    "messageTransmitter",
    AVALANCHE_FUJI_MESSAGE_TRANSMITTER_ADDRESS
  );

  // Deploy the CCTPHookWrapper contract with the message transmitter address
  const cctpHookWrapper = m.contract("CCTPHookWrapper", [messageTransmitter]);

  return { cctpHookWrapper };
});

export default CCTPHookWrapperModule;
