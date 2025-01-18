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

    constructor() {
        deployer = msg.sender;
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can call this");
        _;
    }

    function mint(address to, uint256 amount) public onlyDeployer {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) public onlyDeployer {
        require(balanceOf[from] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balanceOf[from] -= amount;
        emit Transfer(from, address(0), amount);
    }
}