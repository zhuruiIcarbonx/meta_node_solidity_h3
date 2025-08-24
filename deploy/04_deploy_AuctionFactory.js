const { deployments, upgrades } = require("hardhat")

const fs = require("fs")//filesystem
const path = require("path")



module.exports = async ({getNamedAccounts, deployments}) => {

    //获取初版STNFT合约地址
    const {save} = deployments;
    const {deployer} = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);

    //非代理方式部署NFTAuction合约
    const auctionFactory = await ethers.getContractFactory("NFTAuction",deployerSigner)
    const auction = await auctionFactory.deploy()
    await auction.waitForDeployment();
    const auctionAddress = auction.target
    console.log("[04]NFTAuction合约地址：",auctionAddress)

    //使用uups代理部署拍卖工厂合约
    const factory = await ethers.getContractFactory("NFTAuctionFactory",deployerSigner)
    const factoryProxy = await upgrades.deployProxy(factory,[auctionAddress],{
        initializer:"initialize",
        kind:"uups"
    })
    await factoryProxy.waitForDeployment();
    const factoryProxyAddress = await factoryProxy.getAddress()
    const factoryimplAddress = await upgrades.erc1967.getImplementationAddress(factoryProxyAddress)
    console.log("[04]拍卖工厂代理合约地址：",factoryProxyAddress)
    console.log("[04]拍卖工厂实际合约地址：",factoryimplAddress)
    


    //保存合约地址
    await save("AuctionFactory", {
        abi:factory.interface.format("json"),
        address: factoryProxyAddress,
        // args:[],
        // log:true,    
    })



    const storePath = path.resolve(__dirname,"./.cache/AuctionFactory.json")
    fs.writeFileSync(
        storePath,
        JSON.stringify({
            address: factoryProxyAddress,
            abi: factory.interface.format("json")
        })
    )

}

module.exports.tags = ['deployAuctionFactory'];