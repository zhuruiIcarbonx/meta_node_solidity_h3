// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./NFTAuction.sol";

contract NFTAuctionFactory {

    NFTAuction[] public auctions;// 保存所有拍卖合约地址

    function createAction2(address _nftContract,uint256 tokenId,uint256 startingPrice, uint256 duration ) external returns (address auctionAddr) {

        bytes32 salt = keccak256(abi.encodePacked(_nftContract));
        // 用create2部署新合约
        NFTAuction auction = new NFTAuction{salt: salt}(_nftContract);
        // 调用新合约的initialize方法
        auction.createAuction(startingPrice, tokenId, duration);
        // 更新地址map
        auctionAddr = address(auction);
        auctions.push(auctionAddr);
    }




}
