// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {AdminManager} from "../src/AdminManager.sol";

contract AdminManagerScript is Script {
    AdminManager public adminManager;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        adminManager = new AdminManager();

        vm.stopBroadcast();
    }
}
