import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "TimeBasedNFT" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTimeBasedNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("TimeBasedNFT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deployTimeBasedNFT;

deployTimeBasedNFT.tags = ["TimeBasedNFT"];
