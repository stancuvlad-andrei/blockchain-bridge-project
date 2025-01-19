// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IBT {
    string public name = "Inter-Blockchain Token";
    string public symbol = "IBT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public deployer;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event BridgeInitiated(address indexed from, uint256 amount, string destinationChain, string destinationAddress);

    constructor() {
        deployer = msg.sender;
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can call this");
        _;
    }

    function mint(address to, uint256 amount) external onlyDeployer {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyDeployer {
        require(balanceOf[from] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balanceOf[from] -= amount;
        emit Transfer(from, address(0), amount);
    }

    function initiateBridge(uint256 amount, string calldata suiAddress) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        // Transfer tokens from the user to the contract
        balanceOf[msg.sender] -= amount;
        balanceOf[address(this)] += amount;
        emit Transfer(msg.sender, address(this), amount);

        // Emit an event to signal the bridge initiation
        emit BridgeInitiated(msg.sender, amount, "sui", suiAddress);
    }

    function withdrawBridgeTokens(uint256 amount) external onlyDeployer {
        require(balanceOf[address(this)] >= amount, "Insufficient contract balance");

        // Transfer tokens from the contract to the deployer
        balanceOf[address(this)] -= amount;
        balanceOf[deployer] += amount;
        emit Transfer(address(this), deployer, amount);
    }
}