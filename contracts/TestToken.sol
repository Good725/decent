// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Context.sol';

interface IUniswapV3Factory {
    function createPool(address tokenA, address tokenB, uint24 fee) external returns (address);
}

interface IPoolInitializer {
    function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool);
}

interface INonfungiblePositionManager is IPoolInitializer {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );
}

contract TestGovernanceToken is Context, ERC20 {
    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    address public uniswapV3Factory = address(0x1F98431c8aD98523631AE4a59f267346ea31F984);
    address public nonFungiblePositionManager = address(0xC36442b4a4522E871399CD717aBDD847Ab11FE88);

    address public uniswapV3Pair;
    address public owner;
    address public tokenB;

    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    constructor (string memory name_, string memory symbol_) ERC20 (name_, symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = _msgSender();
        uint mintAmount = 500 * 10 ** 18;
        _mint(owner, mintAmount);
    }

    modifier onlyOwner() {
        require(_msgSender() == owner, "!owner");
        _;
    }

    function setFactory(address uniswapFactory) public onlyOwner {
        uniswapV3Factory = uniswapFactory;
    }

    function createPool(address _tokenB, uint24 _fee) public onlyOwner {
        tokenB = _tokenB;
        require(uniswapV3Pair == address(0x0), "pair is already exist");
        uniswapV3Pair = IUniswapV3Factory(uniswapV3Factory).createPool(address(this), tokenB, _fee);
    }

    // function increaseLiquidity(IncreaseLiquidityParams calldata params) public {
    //     uint userBalance = balanceOf(msg.sender);
    //     require(userBalance >= params.amount0Desired, "Not enough amount token0");
    //     IERC20(tokenB).transferFrom(msg.sender, address(this), params.amount1Desired);
    //     _transfer(msg.sender, address(this), params.amount0Desired);
    //     nonFungiblePositionManager.increaseLiquidity(params);
    // }
}