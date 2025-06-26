// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UBaEducationCredentialsStore is Ownable {
    IERC20 public paymentToken;
    uint256 public verificationFee = 10 * 10**18; // 10 G10TK
    mapping(bytes32 => bool) private _credentialHashes;

    event CredentialVerified(bytes32 indexed documentHash, address indexed verifier);
    event FeeUpdated(uint256 newFee);
    event TokensWithdrawn(uint256 amount);

    constructor(address _tokenAddress, address initialOwner) Ownable(initialOwner) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        paymentToken = IERC20(_tokenAddress);
        
        if (initialOwner != msg.sender) {
            transferOwnership(initialOwner);
        }
    }

    function verifyDocument(bytes32 documentHash) external {
        require(documentHash != bytes32(0), "Invalid document hash");
        require(!_credentialHashes[documentHash], "Document already verified");
        require(
            paymentToken.transferFrom(msg.sender, address(this), verificationFee),
            "Token transfer failed"
        );

        _credentialHashes[documentHash] = true;
        emit CredentialVerified(documentHash, msg.sender);
    }

    function addCredentials(bytes32[] calldata hashes) external onlyOwner {
        require(hashes.length > 0, "No hashes provided");
        
        for (uint i = 0; i < hashes.length; i++) {
            require(hashes[i] != bytes32(0), "Invalid hash at index");
            _credentialHashes[hashes[i]] = true;
        }
    }

    function setVerificationFee(uint256 newFee) external onlyOwner {
        require(newFee != verificationFee, "Fee unchanged");
        verificationFee = newFee;
        emit FeeUpdated(newFee);
    }

    function withdrawTokens() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        paymentToken.transfer(owner(), balance);
        emit TokensWithdrawn(balance);
    }

    function isVerified(bytes32 documentHash) external view returns (bool) {
        return _credentialHashes[documentHash];
    }
}