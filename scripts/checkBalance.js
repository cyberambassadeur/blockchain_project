const { ethers } = require("hardhat");

     async function main() {
       const contractAddress = "0x1c5113861C0863CB007135C27AFbBAd87354E352";
       const to = "0xbB4F45019F815C8E3b00DFdcf983061ff3957278"; // Adresse de l'expéditeur

       const MyToken3 = await ethers.getContractAt("MyToken3", contractAddress);
       const balance = await MyToken3.balanceOf(to);
       console.log(`Solde de ${to}:`, ethers.formatUnits(balance, 18), "G10TK");
     }

     main().catch((error) => {
       console.error(error);
       process.exitCode = 1;
     });