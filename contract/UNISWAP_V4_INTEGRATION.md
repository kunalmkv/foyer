# Uniswap V4 Hook Integration for Multi-Token Offers

## Overview

This implementation allows users to create offers on the OfferManager using any supported ERC20 token, which gets automatically swapped to PYUSD using Uniswap V4 hooks.

## Architecture

```
User (USDC) → OfferRouter → PoolManager → OfferSwapHook → OfferManager
     ↓              ↓           ↓             ↓              ↓
   1000 USDC → Setup Swap → Execute Swap → afterSwap() → Create Offer
```

## Key Components

### 1. OfferSwapHook.sol
- **Purpose**: Uniswap V4 hook that executes offer creation after token swaps
- **Key Feature**: Uses only `afterSwap` hook for simplicity
- **Flow**: 
  1. User sets up pending offer via `setupOfferCreation()`
  2. Swap executes through PoolManager
  3. `afterSwap()` triggers and creates offer with swapped PYUSD

### 2. OfferRouter.sol
- **Purpose**: User-facing contract for creating offers with any token
- **Key Functions**:
  - `createOfferWithSwap()`: Main entry point for users
  - `configureTokenPool()`: Admin function to add supported tokens
  - `getExpectedPYUSDOutput()`: Price quotes for users

### 3. Enhanced OfferManager.sol
- **New Functions**:
  - `createOfferToSellOnBehalf()`: Called by hook to create sell offers
  - `createOfferToBuyOnBehalf()`: Called by hook to create buy offers
- **New Modifier**: `onlyKYCVerifiedOrHook()` allows hook to bypass direct KYC checks

## Usage Examples

### Creating a Sell Offer with USDC
```solidity
// User has 1000 USDC, wants to create $1000 PYUSD sell offer
offerRouter.createOfferWithSwap(
    USDC,           // Input token
    1000e6,         // 1000 USDC
    990e6,          // Min 990 PYUSD out (1% slippage)
    eventId,        // Event ID
    metadataUri,    // Offer metadata
    true            // isForSale = true
);
```

### Creating a Buy Offer with DAI
```solidity
// User has 500 DAI, wants to create buy offer
offerRouter.createOfferWithSwap(
    DAI,            // Input token
    500e18,         // 500 DAI
    495e6,          // Min 495 PYUSD out
    eventId,        // Event ID
    metadataUri,    // Offer metadata
    false           // isForSale = false
);
```

## Implementation Flow

### 1. Setup Phase
```solidity
// 1. User calls setupOfferCreation on hook
hook.setupOfferCreation(eventId, minPYUSD, metadata, isForSale);

// 2. User initiates swap through router
router.createOfferWithSwap(token, amount, minOut, eventId, metadata, isForSale);
```

### 2. Execution Phase
```solidity
// 3. Router executes swap via PoolManager
poolManager.swap(poolKey, swapParams, hookData);

// 4. afterSwap hook triggers
function afterSwap() {
    // Calculate PYUSD received
    uint256 pyusdAmount = calculatePYUSDReceived();
    
    // Create offer on behalf of user
    if (isForSale) {
        offerManager.createOfferToSellOnBehalf(user, eventId, pyusdAmount, metadata);
    } else {
        offerManager.createOfferToBuyOnBehalf(user, eventId, pyusdAmount, metadata);
    }
}
```

## Benefits

### 1. **Atomic Operations**
- Single transaction for swap + offer creation
- No partial state risks
- Gas optimized

### 2. **Multi-Token Support**
- Users can use USDC, USDT, DAI, WETH, etc.
- No need to hold PYUSD specifically
- Better user experience

### 3. **Slippage Protection**
- Built-in minimum output validation
- Reverts if swap doesn't meet expectations
- User-defined slippage tolerance

### 4. **KYC Integration**
- Maintains existing KYC requirements
- Hook bypasses direct checks but validates user KYC
- No security compromises

## Deployment Steps

### 1. Deploy Core Contracts
```bash
# Deploy in order:
1. PoolManager (Uniswap V4)
2. OfferSwapHook
3. OfferManager (with hook address)
4. OfferRouter
```

### 2. Create and Initialize Pools
The deployment script automatically creates and initializes three pools:

#### USDC/PYUSD Pool
- **Fee**: 0.05% (500 basis points) - Lower fee for stablecoins
- **Tick Spacing**: 10
- **Initial Price**: 1:1 (1 USDC = 1 PYUSD)
- **Use Case**: Primary stablecoin swapping

#### USDT/PYUSD Pool  
- **Fee**: 0.05% (500 basis points) - Lower fee for stablecoins
- **Tick Spacing**: 10
- **Initial Price**: 1:1 (1 USDT = 1 PYUSD)
- **Use Case**: Tether-based offer creation

#### WETH/PYUSD Pool
- **Fee**: 0.3% (3000 basis points) - Higher fee for volatile assets
- **Tick Spacing**: 60
- **Initial Price**: 1 ETH = 2500 PYUSD (adjustable)
- **Use Case**: ETH-based offer creation

### 3. Automatic Configuration
```solidity
// Each pool is automatically configured in the router:
router.configureTokenPool(USDC, 500, 10);   // Stablecoin
router.configureTokenPool(USDT, 500, 10);   // Stablecoin  
router.configureTokenPool(WETH, 3000, 60);  // Volatile asset
```

### 4. Pool Initialization
```solidity
// Pools are initialized with appropriate starting prices:
poolManager.initialize(usdcPoolKey, sqrt(1) * 2^96);      // 1:1 for USDC
poolManager.initialize(usdtPoolKey, sqrt(1) * 2^96);      // 1:1 for USDT
poolManager.initialize(wethPoolKey, sqrt(2500) * 2^96);   // 2500:1 for WETH
```

## Security Considerations

### 1. **Hook Permissions**
- Only afterSwap is enabled
- Hook can only create offers, not modify existing ones
- KYC validation maintained for all users

### 2. **Slippage Protection**
- User-defined minimum output
- Transaction reverts if expectations not met
- Price impact validation

### 3. **Emergency Controls**
- Token recovery functions
- Ability to disable specific tokens
- Admin controls for pool configuration

## Testing

### 1. Unit Tests
- Hook functionality
- Router integration
- OfferManager modifications

### 2. Integration Tests
- End-to-end swap + offer creation
- Multiple token scenarios
- Slippage and failure cases

### 3. Fork Tests
- Test against mainnet state
- Real pool liquidity
- Actual token contracts

## Gas Optimization

### 1. **Single Transaction**
- Swap + offer creation in one call
- Reduced external calls
- Optimized for common use cases

### 2. **Efficient Hook**
- Minimal storage usage
- Simple afterSwap logic
- No unnecessary computations

## Future Enhancements

### 1. **Multi-Hop Swaps**
- Support tokens without direct PYUSD pools
- Route through multiple pools
- Better price discovery

### 2. **Dynamic Fee Adjustment**
- Adjust fees based on market conditions
- Loyalty discounts
- Volume-based incentives

### 3. **Advanced Price Protection**
- TWAP-based validation
- MEV protection
- Maximum price impact limits

## Frontend Integration

### 1. **Token Selection**
```javascript
// Get supported tokens
const supportedTokens = await router.getSupportedTokens();

// Get quote for offer
const quote = await router.getExpectedPYUSDOutput(token, amount);
```

### 2. **Transaction Flow**
```javascript
// 1. Setup offer creation
await hook.setupOfferCreation(eventId, minPYUSD, metadata, isForSale);

// 2. Execute swap + offer creation
await router.createOfferWithSwap(token, amount, minOut, eventId, metadata, isForSale);
```

This implementation provides a seamless multi-token experience while maintaining all existing security and KYC requirements.