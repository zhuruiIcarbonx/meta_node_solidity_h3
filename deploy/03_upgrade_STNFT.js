const { deployments, upgrades } = require("hardhat")

const fs = require("fs")//filesystem
const path = require("path")



module.exports = async ({getNamedAccounts, deployments}) => {

    //获取初版STNFT合约地址
    const {save} = deployments;
    const {deployer} = await getNamedAccounts();

    console.log("[03]部署用户地址：",deployer)   
    const STNFTData = fs.readFileSync(path.resolve(__dirname,"./.cache/proxySTNFT.json"),"utf-8")
    const {proxyAddress: STNFTProxyAddress} = JSON.parse(STNFTData)    
    console.log("[03]STNFT代理合约地址：",STNFTProxyAddress)

    
    //使用UUPS方式通过代理升级合约
    const V2Factory = await ethers.getContractFactory("STNFTV2")
    const upgraded = await upgrades.upgradeProxy(STNFTProxyAddress,V2Factory)
    await upgraded.waitForDeployment();
    const implAddress = await upgrades.erc1967.getImplementationAddress(STNFTProxyAddress)
    console.log("[03]STNFT升级后实际合约地址：",implAddress)


    //使用透明代理方式通过代理升级合约
    // const V2Factory = await ethers.getContractFactory("STNFTV2")
    // const upgraded = await upgrades.upgradeProxy(STNFTProxyAddress,V2Factory,{
    //     kind:"transparent"
    // })
    // await upgraded.waitForDeployment();
    // const implAddress = await upgrades.erc1967.getImplementationAddress(STNFTProxyAddress)
    // console.log("[03]STNFT升级后实际合约地址：",implAddress)


    //调用新版本的初始化方法
    const proxySTNFTV2 = await ethers.getContractAt("STNFTV2",STNFTProxyAddress)
    const initTx = await proxySTNFTV2.initializeV2("WT token V2","WTv2")
    await initTx.wait()
    console.log("[03]STNFT调用V2版本初始化方法完成")

    const storePath = path.resolve(__dirname,"./.cache/proxySTNFTV2.json")
    
    fs.writeFileSync(
        storePath,
        JSON.stringify({
            proxyAddress: STNFTProxyAddress,
            implAddress: implAddress,
            abi: V2Factory.interface.format("json")
        })
    )
    
      await save("STNFTProxyV2",{
        abi:V2Factory.interface.format("json"),
        address: STNFTProxyAddress,
        implAddress: implAddress,
        // args:[],
        // log:true,
    })



    
}

module.exports.tags = ['upgradeSTNFT'];