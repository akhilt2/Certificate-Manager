const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of CertificateManager contract...");

  // Get the contract factory
  const CertificateManager = await hre.ethers.getContractFactory("CertificateManager");

  // Deploy the contract
  console.log("Deploying CertificateManager...");
  const certificateManager = await CertificateManager.deploy();

  // Wait for deployment to finish
  await certificateManager.waitForDeployment();

  const contractAddress = await certificateManager.getAddress();
  console.log("CertificateManager deployed to:", contractAddress);

  // Verify the contract on Etherscan (if not on localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await certificateManager.deploymentTransaction().wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment info to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deploymentTime: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address,
  };

  const deploymentPath = `./deployments/${hre.network.name}.json`;

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentPath);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Gas Used:", (await certificateManager.deploymentTransaction().wait()).gasUsed.toString());

  return contractAddress;
}

// Handle errors
main()
  .then((address) => {
    console.log("\n✅ Deployment completed successfully!");
    console.log("Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
