const {  ethers,deployments,upgrades } = require("hardhat")
const { expect } = require("chai")
const fs = require("fs");
const path = require("path");


describe("test STNFT", async function() {

    it("should deploy STNFT", async function() {

        //测试NFT合约
        await deployments.fixture(["deployST20","deploySTNFT"])
        const stnftProxy = await deployments.get("STNFTProxy")
        const { deployer,user1 } = await getNamedAccounts();
        const deployerSigner = await ethers.getSigner(deployer);
        const user1Signer = await ethers.getSigner(user1);

        const proxyAddress = stnftProxy.address
        console.log("[test02]STNFT代理合约地址：",proxyAddress)
        console.log("[test02]部署用户地址：",deployer)

        //通过部署信息获取合约对象

        const proxySTNFT = await ethers.getContractAt("STNFT",stnftProxy.address,deployerSigner)

        //也可以直接从缓存文件中读取
        // const proxySTNFTData = fs.readFileSync(path.resolve(__dirname,"./.cache/proxySTNFT.json"),"utf-8")
        // const {implAddress: STNFTImplAddress,abi: STNFTAbi} = JSON.parse(proxySTNFTData)    
        // const STNFT_2 = await ethers.getContractAt(STNFTAbi,STNFTImplAddress)


        expect(await proxySTNFT.name()).to.equal("WT token");
        expect(await proxySTNFT.symbol()).to.equal("WT");

        //铸币
        const mintTx = await proxySTNFT.connect(deployerSigner).mint()
        await mintTx.wait()
        const mintTx2 = await proxySTNFT.connect(deployerSigner).mintTo(user1)
        await mintTx2.wait()

        console.log("------------------mint------------------")
        console.log("部署用户余额：",await proxySTNFT.balanceOf(deployer))
        console.log("用户1余额：",await proxySTNFT.balanceOf(user1))


        //转账
        const transferTx = await proxySTNFT.connect(user1Signer).safeTransferFrom(user1,deployer,1)
        await transferTx.wait()
        console.log("------------------transfer------------------")
        console.log("部署用户余额：",await proxySTNFT.balanceOf(deployer))
        console.log("用户1余额：",await proxySTNFT.balanceOf(user1))


    });



})