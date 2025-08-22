
const { deployments, upgrades } = require("hardhat")

const fs = require("fs")//filesystem
const path = require("path")


// deploy/00_deploy_my_contract.js
module.exports = async ({getNamedAccounts, deployments}) => {
  const {save} = deployments;
  const {deployer} = await getNamedAccounts();

  console.log("部署用户地址：",deployer)
  const NFTAuction = await ethers.getContractFactory("NFTAuctionUUPS")

  //通过代理部署合约
  const nftAuctionProxy = await upgrades.deployProxy(NFTAuction,[],{
    initializer:"initialize"
  })

  await nftAuctionProxy.waitForDeployment();
  const proxyAddress = await nftAuctionProxy.getAddress()
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
  console.log("代理合约地址：",proxyAddress)
  console.log("实际合约地址：",implAddress)


  const storePath = path.resolve(__dirname,"./.cache/proxyNFTAuctionUUPS.json")

  fs.writeFileSync(
    storePath,
    JSON.stringify({
        proxyAddress,
        implAddress,
        abi: NFTAuction.interface.format("json")
    })
  )

  await save("NFTAuctionUUPSProxy",{
    abi:NFTAuction.interface.format("json"),
    address: proxyAddress,
    // args:[],
    // log:true,
  })

//   await deploy('NFTAuction', {
//     from: deployer,
//     args: ['Hello'],
//     log: true,
//   });

    // "0x0000000000000000000000000000000000000000",
    // 61*1000,
    // ethers.parseEther("0.000000000000010000"),
    // 1,
    // ethers.ZeroAddress
  



};
module.exports.tags = ['deployNFTAuctionUUPS'];

//命令 npx hardhat deploy --tags deployNFTAuctionUUPS