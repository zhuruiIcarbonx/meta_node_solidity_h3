
const { ethers,upgrades } = require("hardhat")
const fs = require("fs");
const path = require("path");


module.exports = async function ({getNamedAccounts,deployments}) {
                                  

    const { save } = deployments
    const {deployer} = await getNamedAccounts();
    console.log("---部署用户地址：",deployer)

    //读取 .cache/proxyNFTAuction.json文件
    const storePath = path.resolve(__dirname, "./.cache/proxyNFTAuction.json");
    const storeData = fs.readFileSync(storePath, "utf-8");
    const { proxyAddress, implAddress, abi } = JSON.parse(storeData)
   console.log("---1")
    //升级版的业务合约
    const NFTAuctionV2 = await ethers.getContractFactory("NFTAuctionV2")
    console.log("---2")
    //升级代理合约
    const nftAuctionProxyV2 = await upgrades.upgradeProxy(proxyAddress,NFTAuctionV2)
    await nftAuctionProxyV2.waitForDeployment()
    const proxyAddressV2 = await nftAuctionProxyV2.getAddress()

console.log("---3")
    await save("NFTAuctionProxyV2",{
        abi,
        address:proxyAddressV2,
        //

    })

    console.log("---4")
    
}

module.exports.tags = ["upgradeNFTAuction"]