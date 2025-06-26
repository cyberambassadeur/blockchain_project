const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x1c5113861C0863CB007135C27AFbBAd87354E352";
  const to = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Adresse du destinataire
  const amount = ethers.parseUnits("100", 18); // 100 tokens

  const [owner] = await ethers.getSigners(); // premier owner
  const MyToken3 = await ethers.getContractAt("MyToken3", contractAddress, owner);

  const tx = await MyToken3.proposeMint(to, amount);
  await tx.wait();
  console.log("Mint proposé !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});