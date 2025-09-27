// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IKYCRelayer {
    event VerifiedUserAdded(address indexed user);
    event VerifiedUserRemoved(address indexed user);
    event RelayerAdminUpdated(address indexed newRelayerAdmin);

    function isVerified(address _address) external view returns (bool);
    function addVerifiedUser(address _address) external;
    function removeAddress(address _address) external;
    function setRelayerAdmin(address _newRelayerAdmin) external;
    function relayerAdmin() external view returns (address);
}