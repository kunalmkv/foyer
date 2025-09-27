// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//
//  $$$$$$$$\
//  $$  _____|
//  $$ |    $$$$$$\  $$\   $$\  $$$$$$\   $$$$$$\
//  $$$$$\ $$  __$$\ $$ |  $$ |$$  __$$\ $$  __$$\
//  $$  __|$$ /  $$ |$$ |  $$ |$$$$$$$$ |$$ |  \__|
//  $$ |   $$ |  $$ |$$ |  $$ |$$   ____|$$ |
//  $$ |   \$$$$$$  |\$$$$$$$ |\$$$$$$$\ $$ |
//  \__|    \______/  \____$$ | \_______|\__|
//                   $$\   $$ |
//                   \$$$$$$  |
//                    \______/
//


contract AdminManager {
    address public owner;
    mapping(address => bool) public admin;

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        admin[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function addAdmin(address _account) external onlyOwner {
        require(!admin[_account], "Account already is an admin");
        admin[_account] = true;
        emit AdminAdded(_account);
    }

    function removeAdmin(address _account) external onlyOwner {
        require(admin[_account], "Account is not an admin");
        admin[_account] = false;
        emit AdminRemoved(_account);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
}