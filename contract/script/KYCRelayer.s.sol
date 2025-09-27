// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {KYCRelayer} from "../src/KYCRelayer.sol";

contract KYCRelayerScript is Script {
    KYCRelayer public kycRelayer;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        kycRelayer = new KYCRelayer(0x50da5C365a08169A9101C1969492540dA937071F);

        vm.stopBroadcast();
    }
}
