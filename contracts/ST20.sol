// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;



import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ST20 is ERC20, Ownable {

    constructor() ERC20("ST20 Token", "ST20") Ownable(msg.sender) {
        _mint(msg.sender, 1000);
    }
    

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);

    }

    


}