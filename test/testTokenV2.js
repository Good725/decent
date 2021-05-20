const TestToken = artifacts.require("TestGovernanceTokenV2");
const FACTORY_ABI = require('../abi/V2FactoryAbi.json');
const ROUTER_ABI = require('../abi/V2RouterAbi.json');
const WETH_ABI = require('../abi/WethAbi.json');
const PAIR_ABI = require('../abi/V2PairAbi.json');
const { BigNumber } = require("bignumber.js");
const { assert } = require('hardhat');

contract("TestToken using uniswap V2", accounts => {
    
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    // const wethAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
    const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"

    let testTokenContract;
    let factoryContract;
    let wethContract;
    let routerContract;
    let owner, provider1, provider2;

    before(async function () {
        [owner, provider1, provider2] = accounts;
        testTokenContract = await TestToken.new("TestGovernanceTokenV2", "test");
        factoryContract = new web3.eth.Contract(FACTORY_ABI, factoryAddress);
        wethContract = new web3.eth.Contract(WETH_ABI, wethAddress);
        routerContract = new web3.eth.Contract(ROUTER_ABI, routerAddress);
    });

    it("Balance Check", async function() {
        let owner_balance = await testTokenContract.balanceOf(owner);
        assert.equal(owner_balance, 500000000000000000000);
    });

    it("Get Weth (provider1, provider2)", async function() {
        let payAmount = web3.utils.toBN(30 * 10 ** 18);
        await wethContract.methods.deposit().send({from:provider1, value: payAmount, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
        await wethContract.methods.deposit().send({from:provider2, value: payAmount, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
        let balance1 = await wethContract.methods.balanceOf(provider1).call();
        let balance2 = await wethContract.methods.balanceOf(provider2).call();
        assert.equal(balance1, payAmount);
    });

    it("Transfer testToken from owner to provider1 and provider2 so that they can add liquidity", async function() {
        let transferAmount = web3.utils.toBN(100 * 10 ** 18);
        await testTokenContract.transfer(provider1, transferAmount, {from: owner});
        await testTokenContract.transfer(provider2, transferAmount, {from: owner});
        let balance1 = await testTokenContract.balanceOf(provider1);
        let balance2 = await testTokenContract.balanceOf(provider2);
        assert.equal(balance1.toString(), transferAmount.toString());
    });

    it("Create pool", async function() {
        await testTokenContract.createPool(wethAddress, {from: owner});
        let pair = await testTokenContract.uniswapV2Pair();
        pairContract = new web3.eth.Contract(PAIR_ABI, pair);
        let poolAddress = await factoryContract.methods.getPair(testTokenContract.address, wethAddress).call();
        assert.equal(pair, poolAddress);
    });

    it("Add liquidity through the router contract directly", async function() {
        let approveAmount = web3.utils.toBN(100 * 10 ** 18);
        await wethContract.methods.approve(routerAddress, approveAmount).send({from: provider1});
        await testTokenContract.approve(routerAddress, approveAmount, {from: provider1});
        let amountADesired = web3.utils.toBN(30 * 10 ** 18);
        let amountBDesired = web3.utils.toBN(5 * 10 ** 18);
        let deadline = 9600952122;
        let balanceLp0 = await pairContract.methods.balanceOf(provider1).call();
        await routerContract.methods.addLiquidity(testTokenContract.address, wethAddress, amountADesired, amountBDesired, 0, 0, provider1, deadline).send({from: provider1});
        let balanceLp = await pairContract.methods.balanceOf(provider1).call();
        assert(balanceLp > balanceLp0);
    });

    it("Add liquidity through our token contract", async function() {
        let approveAmount = web3.utils.toBN(100 * 10 ** 18);
        await wethContract.methods.approve(testTokenContract.address, approveAmount).send({from: provider2});
        let amountADesired = web3.utils.toBN(30 * 10 ** 18);
        let amountBDesired = web3.utils.toBN(5 * 10 ** 18);
        let balanceLp0 = await pairContract.methods.balanceOf(provider2).call();
        await testTokenContract.addLiquidity(amountADesired, amountBDesired, {from: provider2});
        let balanceLp = await pairContract.methods.balanceOf(provider2).call();
        assert(balanceLp > balanceLp0);
    });
});