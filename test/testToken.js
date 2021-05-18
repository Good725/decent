const TestToken = artifacts.require("TestGovernanceToken");
const FACTORY_ABI = require('../abi/FactoryAbi.json');
const MANAGER_ABI = require('../abi/PositionManagerAbi.json');
const WETH_ABI = require('../abi/WethAbi.json');
const { BigNumber } = require("bignumber.js");

contract("Test", accounts => {
    
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const uniswapNftAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

    let testTokenContract;
    let factoryContract;
    let wethContract;
    let owner, provider1, provider2;
    let nftManagerContract;

    before(async function () {
        [owner, provider1, provider2] = accounts;
        testTokenContract = await TestToken.new("TestGovernanceToken", "test");
        factoryContract = new web3.eth.Contract(FACTORY_ABI, factoryAddress);
        nftManagerContract = new web3.eth.Contract(MANAGER_ABI, uniswapNftAddress);
        wethContract = new web3.eth.Contract(WETH_ABI, wethAddress);
    });

    it("Balance Check", async function() {
        let owner_balance = await testTokenContract.balanceOf(owner);
        assert.equal(owner_balance, 500000000000000000000);
    });

    // it("Create pool(testToken and Weth)", async function() {
    //     let fee = 3000; // 0.3 % in uniswap. If you change this fee to 0.05% or 1 %, just change this variable to 500 or 10000
    //     // await testTokenContract.createPool(wethAddress, 3000);
    //     let poolAddress = await factoryContract.methods.getPool(testTokenContract.address, wethAddress, fee).call();
    //     let poolAddressFromToken = await testTokenContract.uniswapV3Pair();
    //     assert.equal(poolAddress, poolAddressFromToken);
    // });

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
        assert.equal(balance1, transferAmount);
    });

    it("Create pool and Nft mint", async function() {
        let payAmount = web3.utils.toBN(3 * 10 ** 18);
        let token0 = testTokenContract.address;
        let token1 = wethAddress;
        let fee = 3000;
        let tickLower = -3;
        let tickUpper = 3;
        let amount0Desired = 100;
        let amount1Desired = 100;
        let amount0Min = 0;
        let amount1Min = 0;
        let deadline = 9600952122;
        let recipient = provider1;
        let mintParam = {token0, token1, fee, tickLower, tickUpper, amount0Desired, amount1Desired, amount0Min, amount1Min, recipient, deadline};
        await nftManagerContract.methods.createAndInitializePoolIfNecessary(token0, token1, fee, 1).send({from:owner, value: payAmount, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});;
        let {tokenId, liquidity, amount0, amount1} = await nftManagerContract.methods.mint(mintParam).send({from:provider1, value: payAmount, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    });
});