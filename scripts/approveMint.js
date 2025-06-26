const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x1c5113861C0863CB007135C27AFbBAd87354E352";
  const requestId = 0; // ID de la demande de mint à approuver

  const [, owner2] = await ethers.getSigners(); // second owner
  const MyToken3 = await ethers.getContractAt("MyToken3", contractAddress, owner2);

  const tx = await MyToken3.approveMint(requestId);
  await tx.wait();
  console.log("Mint approuvé !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});