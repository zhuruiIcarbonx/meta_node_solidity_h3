// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";    
/**
 * @title STNFT   使用 ERC721 标准实现一个 NFT 合约。 支持 NFT 的铸造和转移。
 * @dev A simple NFT contract that allows minting and transferring NFTs.
 * This contract inherits from OpenZeppelin's ERC721Enumerable and Ownable contracts.
 */
contract STNFT is ERC721, Ownable {
   
    using Strings for uint256;
    
    string private _baseTokenURI;
    uint256 private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

   function _setTokenURI(string memory baseURI) external onlyOwner {
       _baseTokenURI = baseURI;
   }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _tokenIdCounter, "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(_baseURI()));
    }

}
    

