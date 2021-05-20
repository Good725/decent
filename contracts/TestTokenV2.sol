// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Context.sol';

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IUniswapV2Router {
    function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity);
}

contract TestGovernanceTokenV2 is Context, ERC20 {
    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    address public uniswapV2Factory = address(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    address public weth = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address public router = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    address public uniswapV2Pair;
    address public owner;
    address public tokenB;

    constructor (string memory name_, string memory symbol_) ERC20 (name_, symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = _msgSender();
        uint mintAmount = 500 * 10 ** 18;
        _mint(owner, mintAmount);
        _approve(address(this), router, type(uint).max);
        IERC20(weth).approve(router, type(uint).max);
    }

    modifier onlyOwner() {
        require(_msgSender() == owner, "!owner");
        _;
    }

    function setFactory(address uniswapFactory) public onlyOwner {
        uniswapV2Pair = uniswapFactory;
    }

    function setTokenB(address _tokenB) public onlyOwner {
        tokenB = _tokenB;
    }

    function createPool(address _tokenB) public onlyOwner {
        tokenB = _tokenB;
        require(uniswapV2Pair == address(0x0), "pair is already exist");
        uniswapV2Pair = IUniswapV2Factory(uniswapV2Factory).createPair(address(this), tokenB);
    }

    function addLiquidity(uint amount0, uint amount1) public {
        uint userTokenBalance = balanceOf(msg.sender);
        require(userTokenBalance >= amount0);
        _transfer(msg.sender, address(this), amount0);
        IERC20(weth).transferFrom(msg.sender, address(this), amount1);
        IUniswapV2Router(router).addLiquidity(address(this), weth, amount0, amount1, 0, 0, msg.sender, 9600952122);
    }
}