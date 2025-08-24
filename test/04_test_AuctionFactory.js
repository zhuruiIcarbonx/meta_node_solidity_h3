const {  ethers,deployments,upgrades } = require("hardhat")
const { expect } = require("chai")
const fs = require("fs");
const path = require("path");


describe("test AuctionFactory", async function() {


    it("should deploy  Auction  and  Factory", async function() {

        const { deployer,user1,user2 } = await getNamedAccounts();
        const deployerSigner = await ethers.getSigner(deployer);
        const user1Signer = await ethers.getSigner(user1);
        const user2Signer = await ethers.getSigner(user2);

        //部署AuctionFactory合约
        await deployments.fixture(["deployST20","deploySTNFT","deployAuctionFactory"])

        //获取拍卖工厂合约信息
        const factoryData = await deployments.get("AuctionFactory")
        console.log("[test04]拍卖工厂代理合约地址：",factoryData.address)
        const factoryImplAddress = await upgrades.erc1967.getImplementationAddress(factoryData.address)
        console.log("[test04]拍卖工厂实际合约地址：",factoryImplAddress)
        
        //通过部署信息获取合约对象
        const factoryContract = await ethers.getContractAt("NFTAuctionFactory",factoryData.address,deployerSigner)
        const auctionAddress = await factoryContract.getAuctionAddrss()
        console.log("[test04]通过拍卖工厂获取NFTAuction实现合约地址：",auctionAddress)

        expect(await factoryContract.owner()).to.equal(deployer);

       

          //NFT合约
        const stnftData = await deployments.get("STNFTProxy")
        console.log("[test04]STNFT代理合约地址：",stnftData.address)
        const proxySTNFT = await ethers.getContractAt("STNFT",stnftData.address,deployerSigner)


        //铸币
        const mintTx = await proxySTNFT.connect(deployerSigner).mint()
        await mintTx.wait()
        const mintTx2 = await proxySTNFT.connect(deployerSigner).mintTo(user1)
        await mintTx2.wait()

        console.log("------------------mint------------------")
        console.log("[test04]部署用户余额：",await proxySTNFT.balanceOf(deployer))
        console.log("[test04]用户1余额：",await proxySTNFT.balanceOf(user1))
        console.log("[test04]token=1的归属：",await proxySTNFT.ownerOf(1),"==",user1)
        console.log("[test04]token=0的归属：",await proxySTNFT.ownerOf(0),"==",deployer)

        //授权给拍卖工厂合约
        const approveTx2 = await proxySTNFT.connect(user1Signer).approve(factoryData.address,1)
        await approveTx2.wait()
        console.log("------------------approve------------------")
        console.log("[test04]用户1授权给拍卖工厂合约余额：",await proxySTNFT.getApproved(1))

        //通过拍卖工厂合约创建一个新的NFT拍卖合约
        const createTx = await factoryContract.connect(user1Signer).createAction2(
            stnftData.address,
            1,
            1000,
            60000
        )
        const receipt = await createTx.wait()
        const user1Action = await factoryContract.getMapAuctionAddrss(user1,1)
        console.log("[test04]用户1创建NFT拍卖，拍卖合约地址：",user1Action)   
        const user1ActionTmp = await ethers.getContractAt("NFTAuction",user1Action,user1Signer)
        console.log("[test04]创建拍卖信息:",await user1ActionTmp.getAuction(1))  


        const blockNumber = receipt.blockNumber;
        console.log("[test04]用户1创建NFT拍卖，交易区块高度：",blockNumber)
        //获取事件参数
        const auctionCreatedEvent = await user1ActionTmp.queryFilter('AuctionCreated',blockNumber-1,blockNumber);
         console.log("[test04]auctionCreatedEvent[0].args：",auctionCreatedEvent[0].args) 

 

        // //用户1出价
        const bidTx = await user1ActionTmp.connect(user2Signer).bid(1,2000)
        await bidTx.wait()
        console.log("[test04]用户2出价2000wei:",await user1ActionTmp.getAuction(1))     

        // expect(await ethers.provider.getBalance(proxyNFTAuction.address)).to.equal(ethers.parseEther("2"));

        // //部署用户结束拍卖
        // const endTx = await proxyNFTAuction.connect(deployerSigner).endAuction()
        // await endTx.wait()
        // console.log("部署用户结束拍卖")

        // expect(await ethers.provider.getBalance(proxyNFTAuction.address)).to.equal(0);
        // expect(await ethers.provider.getBalance(deployer)).to.be.gt(ethers.parseEther("9999"));



    });



})