// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {EventManager} from "../src/EventManager.sol";

contract EventManagerScript is Script {
    EventManager public eventFactory;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        eventFactory = new EventManager(0xD7312BFBC95a459305393d7795d966AeBEEf78aa);

        vm.stopBroadcast();
    }
}
