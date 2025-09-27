// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {OfferManager} from "../src/OfferManager.sol";

contract OfferManagerScript is Script {
    OfferManager public offerEscrow;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        offerEscrow = new OfferManager(0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9,0x7bc48Ccf09989c696AeB7BaFEBB3aBb6FB410559,0xD7312BFBC95a459305393d7795d966AeBEEf78aa);

        vm.stopBroadcast();
    }
}
