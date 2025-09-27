// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IEventManager {
    struct Event {
        address creator;
        uint256 eventTime;
        string metadataUri;
        bool isCancelled;
    }

    function events(uint256 eventId) external view returns (
        address creator,
        uint256 eventTime,
        string memory metadataUri,
        bool isCancelled
    );

    function eventCount() external view returns (uint256);
}