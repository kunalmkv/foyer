// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";

contract KYCVerifier is SelfVerificationRoot {
    mapping(address => bool) public isVerified;

    bytes32 public verificationConfigId;
    SelfStructs.VerificationConfigV2 public verificationConfig;

    event UserVerified(
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );

    constructor(
        address _hub,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory rawCfg
    ) SelfVerificationRoot(_hub, scopeSeed) {
        verificationConfig = SelfUtils.formatVerificationConfigV2(rawCfg);
        verificationConfigId = IIdentityVerificationHubV2(_hub).setVerificationConfigV2(verificationConfig);
    }

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        emit UserVerified(output, userData);
    }

    function getConfigId(
        bytes32,
        bytes32,
        bytes memory
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }
}