// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";   
import "./STNFT.sol";

/**
 * @title STNFT   使用 ERC721 标准实现一个 NFT 合约。 支持 NFT 的铸造和转移。
 * @dev A simple NFT contract that allows minting and transferring NFTs.
 * This contract inherits from OpenZeppelin's ERC721Enumerable and Ownable contracts.
 */
contract STNFTV2 is STNFT,PausableUpgradeable{


     function initializeV2(string memory name, string memory symbol)  public reinitializer(2) {
        __STNFTV2_init(name, symbol);
        version = "2";
        
    }


    function __STNFTV2_init(string memory name, string memory symbol)internal onlyInitializing{
        __STNFT_init(name, symbol);
        __Pausable_init();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    // 重写 _transfer 以集成 Pausable 功能
    // 在任何token传输（铸造、销毁、转移）之前调用
    // 当合约暂停时，阻止所有token传输
     function safeMint(address to, uint256 tokenId) internal onlyOwner whenNotPaused {
         super._safeMint(to,tokenId);
    }
}