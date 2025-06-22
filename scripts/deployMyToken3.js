const { ethers } = require("hardhat");

async function main() {
  const owners = [
    "0xbB4F45019F815C8E3b00DFdcf983061ff3957278", // ← Adresse publique du premier owner (PRIVATE_KEY1)
    "0xB6c0dF151322eA45742F55df34ccd4B187f77cc4"  // ← Adresse publique du second owner (PRIVATE_KEY2)
  ];

  const MyToken3 = await ethers.getContractFactory("MyToken3");
  const myToken3 = await MyToken3.deploy(owners);
  await myToken3.waitForDeployment();
  console.log("MyToken3 deployed to:", await myToken3.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});