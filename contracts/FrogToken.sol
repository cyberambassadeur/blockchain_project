// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FrogToken is ERC20, Ownable {
    uint256 public tokenPrice = 0.001 ether; // Token price (modifiable)

    constructor() ERC20("FrogToken", "FT") Ownable(msg.sender) {
        // Initial mint of 100,000 tokens to the deployer address
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    // Automatic token purchase by sending ETH to the contract
    receive() external payable {
        buyTokens();
    }

    // Public function to buy tokens by paying with ETH
    function buyTokens() public payable {
        require(msg.value > 0, "No ETH sent");

        uint256 amountToMint = (msg.value * (10 ** decimals())) / tokenPrice;
        _mint(msg.sender, amountToMint);
    }

    // Allows the owner to withdraw the contract's funds
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Allows the owner to change the token price
    function setTokenPrice(uint256 newPrice) public onlyOwner {
        require(newPrice > 0, "Invalid price");
        tokenPrice = newPrice;
    }
}