const {  ethers,deployments,upgrades } = require("hardhat")
const { expect } = require("chai")
const fs = require("fs");
const path = require("path");


describe("test ST20", async function() {

    it("should deploy ST20", async function() {

        //测试20合约
        await deployments.fixture(["deployST20"])
        const st20Impl = await deployments.get("ST20Impl")
        const { deployer,user1 } = await getNamedAccounts();
        const deployerSigner = await ethers.getSigner(deployer);

        const address = st20Impl.address
        console.log("ST20实际合约地址：",address)
        console.log("部署用户地址：",deployer)

        //通过部署信息获取合约对象

        const ST20 = await ethers.getContractAt("ST20",st20Impl.address,deployerSigner)

        //也可以直接从缓存文件中读取
        // const proxyST20Data = fs.readFileSync(path.resolve(__dirname,"./.cache/proxyST20.json"),"utf-8")
        // const {implAddress: ST20ImplAddress,abi: ST20Abi} = JSON.parse(proxyST20Data)    
        // const ST20 = await ethers.getContractAt(ST20Abi,ST20ImplAddress)


        expect(await ST20.name()).to.equal("ST20 Token");
        expect(await ST20.symbol()).to.equal("ST20");

        //铸币
        const mintAmount = ethers.parseUnits("1000",0)
        const mintTx = await ST20.mint(deployer,mintAmount)
        await mintTx.wait()
        const mintTx2 = await ST20.mint(user1,mintAmount)
        await mintTx2.wait()

        console.log("------------------mint------------------")
        console.log("铸币数量：",await ST20.totalSupply())
        console.log("部署用户余额：",await ST20.balanceOf(deployer))
        console.log("用户1余额：",await ST20.balanceOf(user1))


        const user1Signer = await ethers.getSigner(user1);
        //转账
        const transferAmount = ethers.parseUnits("100",0)
        const transferTx = await ST20.connect(user1Signer).transfer(deployer,transferAmount)
        await transferTx.wait()
        console.log("------------------transfer------------------")
        console.log("铸币数量：",await ST20.totalSupply())
        console.log("部署用户余额：",await ST20.balanceOf(deployer))
        console.log("用户1余额：",await ST20.balanceOf(user1))

        
        const burnTx = await ST20.connect(deployerSigner).burn(deployer,transferAmount)
        await burnTx.wait()
        console.log("------------------burn------------------")
        console.log("铸币数量：",await ST20.totalSupply())
        console.log("部署用户余额：",await ST20.balanceOf(deployer))
        console.log("用户1余额：",await ST20.balanceOf(user1))


    });



})