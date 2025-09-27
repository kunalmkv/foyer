// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IAdminManager {
    function owner() external view returns (address);
    function admin(address account) external view returns (bool);
    
    function addAdmin(address _account) external;
    function removeAdmin(address _account) external;
    function transferOwnership(address _newOwner) external;
    
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
}