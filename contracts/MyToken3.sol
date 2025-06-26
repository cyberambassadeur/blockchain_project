// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken3 is ERC20 {
    // Multi-signature owners
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public requiredApprovals;

    // Mint request structure
    struct MintRequest {
        address to;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) approvedBy;
        bool executed;
    }
    MintRequest[] private mintRequests;

    // Withdraw request structure
    struct WithdrawRequest {
        address to;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) approvedBy;
        bool executed;
    }
    WithdrawRequest[] private withdrawRequests;

    uint256 public tokenPrice = 0.001 ether;

    // Events
    event MintProposed(uint256 indexed requestId, address indexed to, uint256 amount);
    event MintApproved(uint256 indexed requestId, address indexed owner);
    event MintExecuted(uint256 indexed requestId, address indexed to, uint256 amount);

    event WithdrawProposed(uint256 indexed requestId, address indexed to, uint256 amount);
    event WithdrawApproved(uint256 indexed requestId, address indexed owner);
    event WithdrawExecuted(uint256 indexed requestId, address indexed to, uint256 amount);

    event OwnerAdded(address indexed newOwner);
    event OwnerRemoved(address indexed removedOwner);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    constructor(address[] memory _owners) ERC20("Group 10 Token", "G10TK") {
        require(_owners.length == 2, "Must have exactly 2 owners");
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Zero address");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        requiredApprovals = 2;
        _mint(msg.sender, 100_000 * 10 ** decimals());
    }

    // --- Achat automatique et via fonction ---
    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable {
        require(msg.value > 0, "No ETH sent");
        uint256 amountToMint = (msg.value * (10 ** decimals())) / tokenPrice;
        require(amountToMint > 0, "ETH amount too low");
        _mint(msg.sender, amountToMint);
    }

    // --- Mint multi-signature ---
    function proposeMint(address to, uint256 amount) public onlyOwner returns (uint256) {
        require(to != address(0), "Zero address");
        require(amount > 0, "Amount must be > 0");
        MintRequest storage req = mintRequests.push();
        req.to = to;
        req.amount = amount;
        req.approvals = 0;
        req.executed = false;
        emit MintProposed(mintRequests.length - 1, to, amount);
        return mintRequests.length - 1;
    }

    function approveMint(uint256 requestId) public onlyOwner {
        require(requestId < mintRequests.length, "Invalid requestId");
        MintRequest storage req = mintRequests[requestId];
        require(!req.executed, "Already executed");
        require(!req.approvedBy[msg.sender], "Already approved");
        req.approvedBy[msg.sender] = true;
        req.approvals += 1;
        emit MintApproved(requestId, msg.sender);
        if (req.approvals >= requiredApprovals) {
            req.executed = true;
            _mint(req.to, req.amount); // ← Cette ligne exécute bien le mint
            emit MintExecuted(requestId, req.to, req.amount);
        }
    }

    // --- Withdraw multi-signature ---
    function proposeWithdraw(address to, uint256 amount) public onlyOwner returns (uint256) {
        require(to != address(0), "Zero address");
        require(amount > 0, "Amount must be > 0");
        require(address(this).balance >= amount, "Insufficient contract balance");
        WithdrawRequest storage req = withdrawRequests.push();
        req.to = to;
        req.amount = amount;
        req.approvals = 0;
        req.executed = false;
        emit WithdrawProposed(withdrawRequests.length - 1, to, amount);
        return withdrawRequests.length - 1;
    }

    function approveWithdraw(uint256 requestId) public onlyOwner {
        require(requestId < withdrawRequests.length, "Invalid requestId");
        WithdrawRequest storage req = withdrawRequests[requestId];
        require(!req.executed, "Already executed");
        require(!req.approvedBy[msg.sender], "Already approved");
        req.approvedBy[msg.sender] = true;
        req.approvals += 1;
        emit WithdrawApproved(requestId, msg.sender);
        if (req.approvals >= requiredApprovals) {
            req.executed = true;
            require(address(this).balance >= req.amount, "Insufficient contract balance");
            payable(req.to).transfer(req.amount);
            emit WithdrawExecuted(requestId, req.to, req.amount);
        }
    }

    // --- Gestion des owners (optionnel) ---
    function addOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Zero address");
        require(!isOwner[newOwner], "Already owner");
        isOwner[newOwner] = true;
        owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address ownerToRemove) public onlyOwner {
        require(isOwner[ownerToRemove], "Not an owner");
        require(owners.length > requiredApprovals, "Owners would be less than required approvals");
        isOwner[ownerToRemove] = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        emit OwnerRemoved(ownerToRemove);
    }

    // --- View functions ---
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getMintRequestsCount() external view returns (uint256) {
        return mintRequests.length;
    }

    function getWithdrawRequestsCount() external view returns (uint256) {
        return withdrawRequests.length;
    }
}