import { ethers, network } from "hardhat";

async function main() {
  console.log("Starting Zenkai Protocol Deployment...");

  let CUSD_ADDRESS: string;
  if (network.name === "celo") {
    // Celo Mainnet cUSD Address
    CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
    console.log("Network: Celo Mainnet");
  } else {
    // Celo Sepolia cUSD Address (Fallback for testnets)
    CUSD_ADDRESS = "0x954cBA141f21760751E3065ACC250c38fb9f5e61";
    console.log("Network: Celo Sepolia Testnet");
  }

  // 1. Deploy Verifier
  console.log("Deploying ZenkaiVerifier...");
  const Verifier = await ethers.getContractFactory("ZenkaiVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`Verifier deployed to: ${verifierAddress}`);

  // 2. Deploy Treasury
  console.log("Deploying ZenkaiTreasury...");
  const Treasury = await ethers.getContractFactory("ZenkaiTreasury");
  const treasury = await Treasury.deploy(CUSD_ADDRESS);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log(`Treasury deployed to: ${treasuryAddress}`);

  // 3. Deploy Escrow (The main manager)
  console.log("Deploying ZenkaiEscrow...");
  const [deployer] = await ethers.getSigners();
  const gameServerAddress = deployer.address; // Placeholder: use deployer as game server for initial setup
  
  const Escrow = await ethers.getContractFactory("ZenkaiEscrow");
  const escrow = await Escrow.deploy(
    CUSD_ADDRESS,
    treasuryAddress,
    gameServerAddress,
    verifierAddress
  );
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`ZenkaiEscrow deployed to: ${escrowAddress}`);

  // 4. Link Verifier to Escrow
  console.log("Linking Verifier to Escrow...");
  const setEscrowTx = await verifier.setEscrow(escrowAddress);
  await setEscrowTx.wait();
  console.log("Verifier linked successfully.");

  console.log("\n--- Deployment Summary ---");
  console.log(`cUSD (${network.name}): ${CUSD_ADDRESS}`);
  console.log(`Verifier:        ${verifierAddress}`);
  console.log(`Treasury:        ${treasuryAddress}`);
  console.log(`Escrow:          ${escrowAddress}`);
  console.log("---------------------------\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
