## Get started
Clone this repository, install NodeJS dependencies:
```
git clone https://github.com/Good725/decent.git
npx hardhat compile
```
## Unit Testing
All tests are located under the test folder.

Test the token using uniswap V2
```
npx hardhat test test/testTokenV2.js

Test the token using uniswapV3
```
npx hardhat test test/testToken.js
