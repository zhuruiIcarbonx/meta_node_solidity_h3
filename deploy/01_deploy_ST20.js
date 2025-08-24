const { deployments, upgrades } = require("hardhat")

const fs = require("fs")//filesystem
const path = require("path")



module.exports = async ({getNamedAccounts, deployments}) => {


    const {save} = deployments;
    const {deployer} = await getNamedAccounts();
    
    console.log("部署用户地址：",deployer)
    const ST20Factory = await ethers.getContractFactory("ST20")
    
    //通过代理部署合约
    // const st20Proxy = await upgrades.deployProxy(ST20Factory,[],{
    //     initializer:"initialize"
    // })
    
    const st20 = await ST20Factory.deploy();
    await st20.waitForDeployment();
    // const proxyAddress = await st20Proxy.getAddress()
    // const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
    // console.log("代理合约地址：",proxyAddress)
    const implAddress = await st20.target
    console.log("实际合约地址：",implAddress)
    const storePath = path.resolve(__dirname,"./.cache/proxyST20.json")
    
    fs.writeFileSync(
        storePath,
        JSON.stringify({
            // proxyAddress,
            implAddress,
            abi: ST20Factory.interface.format("json")
        })
    )
    
    await save("ST20Impl",{
        abi:ST20Factory.interface.format("json"),
        address: implAddress,
        deployer: deployer,
        // args:[],
        // log:true,
    })
}

module.exports.tags = ['deployST20'];