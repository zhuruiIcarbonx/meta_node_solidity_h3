const { deployments, upgrades } = require("hardhat")

const fs = require("fs")//filesystem
const path = require("path")



module.exports = async ({getNamedAccounts, deployments}) => {


    const {save} = deployments;
    const {deployer} = await getNamedAccounts();

    const ST20Data = fs.readFileSync(path.resolve(__dirname,"./.cache/proxyST20.json"),"utf-8")
    const {implAddress: ST20ImplAddress} = JSON.parse(ST20Data)    

    console.log("[02]ST20实际合约地址：",ST20ImplAddress)
    console.log("[02]部署用户地址：",deployer)   
    const STNFTFactory = await ethers.getContractFactory("STNFT")
    
    //通过代理部署合约
    const stnftProxy = await upgrades.deployProxy(STNFTFactory,["WT token","WT"],{
        initializer:"initialize"
    })
    
    await stnftProxy.waitForDeployment();
    const proxyAddress = await stnftProxy.getAddress()
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
    console.log("[02]STNFT代理合约地址：",proxyAddress)
    console.log("[02]STNFT实际合约地址：",implAddress)


    const storePath = path.resolve(__dirname,"./.cache/proxySTNFT.json")
    
    fs.writeFileSync(
        storePath,
        JSON.stringify({
            proxyAddress,
            implAddress,
            abi: STNFTFactory.interface.format("json")
        })
    )
    
    await save("STNFTProxy",{
        abi:STNFTFactory.interface.format("json"),
        address: proxyAddress,
        implAddress: implAddress,
        // args:[],
        // log:true,
    })



}

module.exports.tags = ['deploySTNFT'];