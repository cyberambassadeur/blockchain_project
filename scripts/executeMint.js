const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x1c5113861C0863CB007135C27AFbBAd87354E352";
  const requestId = 0; // Ajuste si plusieurs demandes

  const [owner] = await ethers.getSigners(); // Utilise un owner
  const MyToken3 = await ethers.getContractAt("MyToken3", contractAddress, owner);

  const tx = await MyToken3.executeMint(requestId);
  await tx.wait();
  console.log("Mint executed, tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});