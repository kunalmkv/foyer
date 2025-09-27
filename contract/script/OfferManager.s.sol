// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {OfferManager} from "../src/OfferManager.sol";

contract OfferManagerScript is Script {
    OfferManager public offerEscrow;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        offerEscrow = new OfferManager(0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9, 0x61F3Db7fCC108a5cCa70B71795EB333ca8eD7A52, 0x2fDD630810692642eE03F881DF712C212C982F70,0xD7312BFBC95a459305393d7795d966AeBEEf78aa);

        vm.stopBroadcast();
    }
}
