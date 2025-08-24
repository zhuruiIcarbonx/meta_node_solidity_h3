// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";    
/**
 * @title STNFT   使用 ERC721 标准实现一个 NFT 合约。 支持 NFT 的铸造和转移。
 * @dev A simple NFT contract that allows minting and transferring NFTs.
 * This contract inherits from OpenZeppelin's ERC721Enumerable and Ownable contracts.
 */
contract STNFT is ERC721Upgradeable, OwnableUpgradeable,ReentrancyGuardUpgradeable  {
   
    using Strings for uint256;
    
    string private _baseTokenURI;
    uint256 private _tokenIdCounter;
    string public version;

    // constructor(){
    //     _disableInitializers(); // 禁止直接部署逻辑合约
    // }

    function initialize(string memory name, string memory symbol)  public initializer {
        __STNFT_init(name, symbol);
        version = "1";
    }

    function __STNFT_init(string memory name, string memory symbol)internal onlyInitializing{
        __ERC721_init(name, symbol);
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        _tokenIdCounter = 0;
    }

   function _setTokenURI(string memory baseURI) external onlyOwner {
       _baseTokenURI = baseURI;
   }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
     function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _tokenIdCounter, "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(_baseURI()));
    }

    function mint() external onlyOwner {
        uint256 newTokenId = _tokenIdCounter++;
        _safeMint(msg.sender, newTokenId);
    }

    function mintTo(address to) external onlyOwner {
        require(to != address(0), "Cannot mint to the zero address");
        uint256 newTokenId = _tokenIdCounter++;
        _safeMint(to, newTokenId);
    }


    function getVersion() external view returns (string memory) {
        return version;
    }
   

}
    

