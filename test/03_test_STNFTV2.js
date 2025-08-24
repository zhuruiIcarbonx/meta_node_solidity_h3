const {  ethers,deployments,upgrades } = require("hardhat")
const { expect } = require("chai")
const fs = require("fs");
const path = require("path");


describe("test STNFTV2", async function() {

    it("should upgrade STNFT to STNFTV2", async function() {

        const { deployer,user1 } = await getNamedAccounts();
        const deployerSigner = await ethers.getSigner(deployer);
        const user1Signer = await ethers.getSigner(user1);

        //升级NFT合约到V2版本
        await deployments.fixture(["deployST20","deploySTNFT"])
        const v1Proxy = await deployments.get("STNFTProxy")
        // console.log("[test03]v1Proxy：",v1Proxy)
        console.log("[test03]V1代理合约地址：",v1Proxy.address)
        console.log("[test03]V1实际合约地址：",v1Proxy.implAddress)
        const implAddress1 = await upgrades.erc1967.getImplementationAddress(v1Proxy.address)
        console.log("[test03]V1实际合约地址：",implAddress1)
        


        await deployments.fixture(["upgradeSTNFT"])
        const v2Proxy = await deployments.get("STNFTProxyV2")
        // console.log("[test03]v2Proxy：",v2Proxy)
        console.log("[test03]V2代理合约地址：",v2Proxy.address)
        console.log("[test03]V2实际合约地址：",v2Proxy.implAddress)
        const implAddress2 = await upgrades.erc1967.getImplementationAddress(v2Proxy.address)
        console.log("[test03]V2实际合约地址：",implAddress2)
        

        //通过部署信息获取合约对象

        const proxySTNFTV2 = await ethers.getContractAt("STNFTV2",v2Proxy.address,deployerSigner)

        
        console.log("proxySTNFTV2.version：",await proxySTNFTV2.getVersion())
        expect(await proxySTNFTV2.name()).to.equal("WT token V2");
        expect(await proxySTNFTV2.symbol()).to.equal("WTv2");
        expect(await proxySTNFTV2.version()).to.equal("2");

        //铸币
        const mintTx = await proxySTNFTV2.connect(deployerSigner).mint()
        await mintTx.wait()
        const mintTx2 = await proxySTNFTV2.connect(deployerSigner).mintTo(user1)
        await mintTx2.wait()

        console.log("------------------mint------------------")
        console.log("部署用户余额：",await proxySTNFTV2.balanceOf(deployer))
        console.log("用户1余额：",await proxySTNFTV2.balanceOf(user1))


    });



})