const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UBaEducationCredentialsStore", function () {
  let store, token;
  let owner, user;

  before(async () => {
    [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken3");
    token = await Token.deploy([owner.address, user.address]);

    const Store = await ethers.getContractFactory("UBaEducationCredentialsStore");
    store = await Store.deploy(token.target);
  });

  it("Devrait vérifier un document contre paiement", async () => {
    const docHash = ethers.id(JSON.stringify({
      matriculation: "UBA2358985",
      result: { cryptology: "A", blockchain: "B" }
    }));

    // Approve + transferFrom
    await token.connect(user).approve(store.target, 10e18);
    await expect(store.connect(user).verifyDocument(docHash))
      .to.emit(store, "CredentialVerified");
  });

  it("Devrait rejeter les non-owners pour addCredentials", async () => {
    await expect(
      store.connect(user).addCredentials([ethers.ZeroHash])
    ).to.be.revertedWithCustomError(store, "OwnableUnauthorizedAccount");
  });
});