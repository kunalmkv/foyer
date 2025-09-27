// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {KYCVerifier} from "../src/KYCVerifier.sol";
import {Script, console} from "forge-std/Script.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {CountryCodes} from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";


contract KYCVerifierScript is Script {
    function run() public {
        vm.startBroadcast();

        string[] memory forbiddenCountries = new string[](1);
        forbiddenCountries[0] = "ISR";

        SelfUtils.UnformattedVerificationConfigV2 memory rawCfg = SelfUtils.UnformattedVerificationConfigV2(
           12, forbiddenCountries,  true
        );

        KYCVerifier verifier = new KYCVerifier(0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74, "foyer-test", rawCfg);

        // Log deployment information
        console.log("KYCVerifier deployed to:", address(verifier));
        console.log("Scope Value:", verifier.scope());

        vm.stopBroadcast();
    }
}