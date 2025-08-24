// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; 
import "./STNFT.sol";

//对STNFT进行拍卖
contract NFTAuction is  Initializable, UUPSUpgradeable,OwnableUpgradeable,ReentrancyGuardUpgradeable  {
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
    
    /**   
     * 参数
     **/
    mapping(uint256 => Auction) public auctions;
    address public stNFTAddress;
    STNFT public stNFT;
    string public version;


    event AuctionCreated(address indexed creater, uint256 tokenId, address auctionAddress);

     /**   
     * 错误
     **/
    // 无效地址
    error InvalidAddress(address addr);


    // constructor(address _nftContract) {
    //     _disableInitializers(); // 禁止直接部署逻辑合约
    // }

    function initialize(address _nftContract)  public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
         stNFTAddress = _nftContract;
        stNFT = STNFT(_nftContract);
        version = "1";
        
    }

      /**
     * @dev 升级合约
     * @param newImplementation 新的合约地址
     */
    function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {
        if (address(newImplementation) == address(0)) {
            revert InvalidAddress(address(0));
        }
    }

    
    function createAuction(uint256 tokenId,uint256 startingPrice, uint256 duration ) external  {
        require(startingPrice > 0, "Starting price must be greater than zero");
        require(duration > 0, "Invalid duration");
        require(stNFT.ownerOf(tokenId) == address(this), " auction address(this) not the nft owner ");
        // stNFT.safeTransferFrom(msg.sender, address(this), tokenId); 
        // (bool success, bytes memory data) = stNFT.delegatecall(
        //     abi.encodeWithSignature("safeTransferFrom(address,address,uint256)", msg.sender, address(this), tokenId)
        // );

        auctions[tokenId] = Auction({
            tokenId: tokenId,
            seller: msg.sender,
            startingPrice: startingPrice,
            highestPrice: startingPrice,
            highestBidder: address(0),
            duration: duration,
            startedAt: block.timestamp
        });

        emit AuctionCreated(msg.sender, tokenId, address(this));
    }

    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        return auctions[tokenId];
    }
    //竞拍  支持竞拍者以 ERC20 或以太坊出价
    function bid(uint256 tokenId,uint256 amount) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.startedAt > 0, "Auction does not exist");
        require(block.timestamp < auction.startedAt + auction.duration, "Auction has ended");
        require(amount > auction.highestPrice, "Bid must be higher than the current highest bid");

        // Refund the previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestPrice);
        }

        auction.highestPrice = amount;
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



     /**
     * @dev 接收ERC721代币, 接收拍卖的NFT
     * @return bytes4 返回值
     */
    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
        
    }

}
