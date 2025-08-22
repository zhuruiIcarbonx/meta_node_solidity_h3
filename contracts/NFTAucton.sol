// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; 
import "./STNFT.sol";

//对STNFT进行拍卖
contract NFTAuction is Ownable {
    using Strings for uint256;

    struct Auction {
        uint256 tokenId;
        address seller;
        uint256 startingPrice;
        uint256 highestPrice;
        address highestBidder;
        uint256 duration;
        uint256 startedAt;
    }

    mapping(uint256 => Auction) public auctions;
    address public stNFTAddress;
    STNFT public stNFT;

    constructor(address _nftContract) Ownable(msg.sender) {
        stNFTAddress = _nftContract;
        stNFT = STNFT(_nftContract);
    }

    
    function createAuction(uint256 tokenId,uint256 startingPrice, uint256 duration ) external onlyOwner {
        require(startingPrice > 0, "Starting price must be greater than zero");
        require(duration > 0, "Invalid duration");
        require(stNFT.ownerOf(tokenId) == address(this), "NFT transfer failed");
        stNFT.safeTransferFrom(msg.sender, address(this), tokenId); 
        auctions[tokenId] = Auction({
            tokenId: tokenId,
            seller: msg.sender,
            startingPrice: startingPrice,
            highestPrice: startingPrice,
            highestBidder: address(0),
            duration: duration,
            startedAt: block.timestamp
        });
    }

    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        return auctions[tokenId];
    }
    //竞拍  支持竞拍者以 ERC20 或以太坊出价
    function bid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.startedAt > 0, "Auction does not exist");
        require(block.timestamp < auction.startedAt + auction.duration, "Auction has ended");
        require(msg.value > auction.highestPrice, "Bid must be higher than the current highest bid");

        // Refund the previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestPrice);
        }

        auction.highestPrice = msg.value;
        auction.highestBidder = msg.sender;

    }

    function endAuction(uint256 tokenId) external onlyOwner {
        Auction storage auction = auctions[tokenId];
        require(auction.startedAt > 0, "Auction does not exist");
        require(block.timestamp >= auction.startedAt + auction.duration, "Auction is still ongoing");

        if (auction.highestBidder != address(0)) {
            // Transfer the NFT to the highest bidder
            payable(auction.seller).transfer(auction.highestPrice);
            stNFT.safeTransferFrom(address(this), auction.highestBidder, tokenId);
        }else{
            stNFT.safeTransferFrom(address(this), auction.seller, tokenId);
        }

        delete auctions[tokenId]; // Remove the auction after it ends
    }
}
