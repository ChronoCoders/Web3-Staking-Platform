const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../artifacts/contracts');
const destDir = path.join(__dirname, '../frontend/src/contracts');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy contract ABIs
const copyArtifacts = () => {
  const contracts = ['StakingPool.sol/StakingPool.json', 'RewardToken.sol/RewardToken.json'];
  
  contracts.forEach(contract => {
    const srcPath = path.join(srcDir, contract);
    const filename = path.basename(contract);
    const destPath = path.join(destDir, filename);
    
    if (fs.existsSync(srcPath)) {
      const artifact = JSON.parse(fs.readFileSync(srcPath));
      
      // Create a simplified version with just ABI and networks
      const simplified = {
        abi: artifact.abi,
        networks: artifact.networks || {}
      };
      
      fs.writeFileSync(destPath, JSON.stringify(simplified, null, 2));
      console.log(`Copied ${filename} to frontend/src/contracts`);
    } else {
      console.error(`Could not find artifact at ${srcPath}`);
    }
  });
};

copyArtifacts();