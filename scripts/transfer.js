const { ethers } = require("hardhat");

async function main() {
  // Adresse du contrat déployé sur Sepolia
  const contractAddress = "0xF71feafF8AC07aC18b2108A873EdBA6c8359c802";
  // Adresse de destination
  const to = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  // Nombre de tokens à transférer (10 * 10^decimals)
  const amount = ethers.parseUnits("10", 18);

  // Récupère le signataire (le premier compte de Hardhat)
  const [deployer] = await ethers.getSigners();

  // Récupère l'instance du contrat
  const MyToken = await ethers.getContractAt("MyToken", contractAddress, deployer);

  // Effectue le transfert
  const tx = await MyToken.transfer(to, amount);
  await tx.wait();

  console.log(`Transféré 10 tokens à ${to}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});