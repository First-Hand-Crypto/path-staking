async function main() {
    // Grab the contract factory 
    const PathRewards= await ethers.getContractFactory("PathRewards");
 
    // Start deployment, returning a promise that resolves to a contract object
    const pathDeploy = await PathRewards.deploy("0x2a2550e0A75aCec6D811AE3930732F7f3ad67588"); // Instance of the contract 
    console.log("Contract deployed to address:", pathDeploy.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });