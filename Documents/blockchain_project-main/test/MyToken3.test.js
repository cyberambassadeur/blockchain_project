const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mint Multi-Signature", function() {
  let token;
  let owner1, owner2, user;

  before(async function() {
    [owner1, owner2, user] = await ethers.getSigners();
    const MyToken3 = await ethers.getContractFactory("MyToken3");
    token = await MyToken3.deploy([owner1.address, owner2.address]);
  });

  // Test existant
  it("Devrait exiger 2 signatures pour mint", async function() {
    // ... (votre test existant)
  });

  // Nouveau test
  it("Devrait rejeter les approbations en double", async function() {
    await token.connect(owner1).proposeMint(user.address, 100);
    
    // Première approbation OK
    await token.connect(owner1).approveMint(0);
    // Ajoutez dans test/MyToken3.test.js
describe("Fonctions non couvertes", function() {
  it("Devrait gérer les withdraws multi-sig", async function() {
    // Testez proposeWithdraw/approveWithdraw
  });

  it("Devrait rejeter les ETH insuffisants", async function() {
    await expect(
      user.sendTransaction({
        to: token.target,
        value: ethers.parseEther("0.0000001") // Montant trop faible
      })
    ).to.be.revertedWith("ETH amount too low");
  });
});

    // Deuxième approbation doit échouer
    await expect(
      token.connect(owner1).approveMint(0)
    ).to.be.revertedWith("Already approved");
  });
});