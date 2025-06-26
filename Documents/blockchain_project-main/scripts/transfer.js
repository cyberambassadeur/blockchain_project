const { ethers } = require("hardhat");

async function main() {
  // Configuration
  const CONTRACT_ADDRESS = "0x30A3AF79b88883bb8CA6A5eCAD3eA7F1cB9C7D74"; // Utilisez votre adresse actuelle
  const RECIPIENT_ADDRESS = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  const TRANSFER_AMOUNT = ethers.parseUnits("10", 18); // 10 tokens avec 18 décimales
  const GAS_LIMIT = 200000; // Limite de gaz pour la transaction

  try {
    console.log("Initialisation du transfert...");
    
    // 1. Récupération des signataires
    const [sender] = await ethers.getSigners();
    console.log(`Expéditeur: ${sender.address}`);
    console.log(`Solde initial: ${await ethers.provider.getBalance(sender.address)} ETH`);

    // 2. Connexion au contrat
    console.log(`Connexion au contrat à l'adresse ${CONTRACT_ADDRESS}...`);
    const tokenContract = await ethers.getContractAt("MyToken3", CONTRACT_ADDRESS, sender);
    
    // 3. Vérification des soldes avant transfert
    const senderBalance = await tokenContract.balanceOf(sender.address);
    const recipientBalance = await tokenContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`Solde expéditeur avant: ${ethers.formatUnits(senderBalance, 18)} G10TK`);
    console.log(`Solde destinataire avant: ${ethers.formatUnits(recipientBalance, 18)} G10TK`);

    // 4. Envoi de la transaction
    console.log(`Envoi de ${ethers.formatUnits(TRANSFER_AMOUNT, 18)} G10TK à ${RECIPIENT_ADDRESS}...`);
    const tx = await tokenContract.transfer(RECIPIENT_ADDRESS, TRANSFER_AMOUNT, {
      gasLimit: GAS_LIMIT
    });

    // 5. Attente de confirmation
    console.log(`Transaction envoyée, hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmée dans le bloc: ${receipt.blockNumber}`);

    // 6. Vérification des soldes après transfert
    const newSenderBalance = await tokenContract.balanceOf(sender.address);
    const newRecipientBalance = await tokenContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`Solde expéditeur après: ${ethers.formatUnits(newSenderBalance, 18)} G10TK`);
    console.log(`Solde destinataire après: ${ethers.formatUnits(newRecipientBalance, 18)} G10TK`);
    console.log("Transfert terminé avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors du transfert:", error.message);
    process.exitCode = 1;
  }
}

main();