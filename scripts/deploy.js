async function main() {
    const TestToken = artifacts.require("TestGovernanceToken");

    const testContract = await TestToken.new("TestGovernanceToken", "test");
    console.log("Token address", testContract.address);
  }
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});