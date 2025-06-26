const { ethers } = require("hardhat");

  async function main() {
    const contractAddress = "0x1c5113861C0863CB007135C27AFbBAd87354E352";
    const amountInEth = ethers.parseEther("0.01"); // 0.01 ETH

    const [sender] = await ethers.getSigners();
    console.log("Sender address:", await sender.getAddress());
    console.log("Contract balance before:", await ethers.provider.getBalance(contractAddress));
    console.log("Sending", ethers.formatEther(amountInEth), "ETH to", contractAddress);

    const tx = await sender.sendTransaction({
      to: contractAddress,
      value: amountInEth,
      gasLimit: 200000, // Augmente pour éviter les erreurs de gas
    });
    console.log("Transaction sent, hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed, block number:", receipt.blockNumber);
    console.log("Contract balance after:", await ethers.provider.getBalance(contractAddress));
  }

  main().catch((error) => {
    console.error("Error occurred:", error);
    process.exitCode = 1;
  });