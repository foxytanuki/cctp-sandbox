import { task } from "hardhat/config";
import { toFunctionSelector } from "viem";

task("selector", "Generates function selector")
  .addPositionalParam(
    "signature",
    "Function signature like 'processTransfer(uint256)'"
  )
  .setAction(async (taskArgs) => {
    const selector = toFunctionSelector(taskArgs.signature);
    console.log(`Selector for ${taskArgs.signature}: ${selector}`);
  });

export default {};
