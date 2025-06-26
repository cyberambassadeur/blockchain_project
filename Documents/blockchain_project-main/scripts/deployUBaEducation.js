const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Adresse du contrat MyToken3 déployé précédemment
  const G10TK_ADDRESS = "0xe83a8422F5259EF439362fACA1DB44Fb6C129D01";
  
  const UBaEducation = await ethers.getContractFactory("UBaEducationCredentialsStore");
  
  // Déployez avec les deux arguments requis :
  const contract = await UBaEducation.deploy(
    G10TK_ADDRESS,         // _tokenAddress
    deployer.address       // initialOwner
  );

  await contract.waitForDeployment();

  console.log("UBaEducation déployé à:", await contract.getAddress());
  console.log("Propriétaire initial:", await contract.owner());
  console.log("Frais de vérification:", await contract.verificationFee(), "G10TK");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});