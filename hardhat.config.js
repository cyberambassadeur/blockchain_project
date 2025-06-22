require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // ← Charger les variables depuis .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [
        process.env.PRIVATE_KEY1,
        process.env.PRIVATE_KEY2
      ]
    }
  }
};