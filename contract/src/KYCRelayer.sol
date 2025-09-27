// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KYCRelayer is Ownable {
    mapping(address => bool) public isVerified;

    address public relayerAdmin;

    event VerifiedUserAdded(address indexed user);
    event VerifiedUserRemoved(address indexed user);
    event RelayerAdminUpdated(address indexed newRelayerAdmin);

    modifier onlyRelayerAdmin() {
        require(msg.sender == relayerAdmin, "Only relayer admin can call this function");
        _;
    }

    constructor(address _relayerAdmin) Ownable(msg.sender) {
        require(_relayerAdmin != address(0), "Invalid relayer admin address");
        _relayerAdmin = _relayerAdmin;
    }

    function addVerifiedUser(address _address) external onlyRelayerAdmin {
        require(_address != address(0), "Invalid address");
        isVerified[_address] = true;
        emit VerifiedUserAdded(_address);
    }

    function removeAddress(address _address) external onlyRelayerAdmin {
        isVerified[_address] = false;
        emit VerifiedUserRemoved(_address);
    }

    function setRelayerAdmin(address _newRelayerAdmin) external onlyOwner {
        require(_newRelayerAdmin != address(0), "Invalid relayer admin address");
        relayerAdmin = _newRelayerAdmin;
        emit RelayerAdminUpdated(_newRelayerAdmin);
    }
}