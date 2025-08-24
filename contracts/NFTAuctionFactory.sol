// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NFTAuction.sol";

contract NFTAuctionFactory is  Initializable, UUPSUpgradeable,OwnableUpgradeable,ReentrancyGuardUpgradeable   {

    mapping(address => mapping(uint256 => address)) public userTokenAuctionMap; // 保存用户对应的拍卖合约地址

    address public nftAuctionImpl; // 拍卖合约地址
    string public version;


   
    // 无效地址
    error InvalidAddress(address addr);

    function initialize(address _nftAuctionAddress)  public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        version = "1";
        nftAuctionImpl = _nftAuctionAddress;
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



    function createAction2(address _nftContract,uint256 tokenId,uint256 startingPrice, uint256 duration ) external nonReentrant  {

        require(_nftContract != address(0), " Invalid NFT contract address");
        // require(address(userTokenAuctionMap[msg.sender][tokenId]) != address(0), "Auction already exists for this token");

        IERC721 nft = IERC721(_nftContract);
        // 将NFT转移到工厂合约中
        nft.safeTransferFrom(msg.sender, address(this), tokenId);

        //创建nftaution代理合约
        bytes memory _initData = abi.encodeWithSelector(
            NFTAuction.initialize.selector, 
            _nftContract
        );
        address proxy  = address(new ERC1967Proxy(nftAuctionImpl,_initData));

        // 将NFT转移到拍卖合约中
        nft.safeTransferFrom(address(this), proxy, tokenId);

        // 创建拍卖
        NFTAuction(proxy).createAuction(tokenId, startingPrice, duration);

        // 更新地址map
        userTokenAuctionMap[msg.sender][tokenId] = proxy;


        // bytes32 salt = keccak256(abi.encodePacked(_nftContract));
        // // 用create2部署新合约
        // NFTAuction auction = new NFTAuction{salt: salt}(_nftContract);
        // // 调用新合约的initialize方法
        // auction.createAuction(tokenId, startingPrice, duration);
        // // 更新地址map
        // auctionAddr = address(auction);
        // auctions.push(auctionAddr);
    }


    /**
     * @dev 接收ERC721代币, 接收拍卖的NFT
     * @return bytes4 返回值
     */
    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
        
    }

    function getAuctionAddrss() external view returns (address) {
        return nftAuctionImpl;
    }

    function getMapAuctionAddrss(address user,uint256 tokenId) external view returns (address) {
        return userTokenAuctionMap[user][tokenId];
    }

}
