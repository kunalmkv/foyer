// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IKYCRelayer {
    function isVerified(address _address) external view returns (bool);
}