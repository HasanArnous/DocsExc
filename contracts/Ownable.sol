pragma solidity ^0.6.8;
contract Ownable{
    address public owner ;
    
    constructor() internal{
        owner = msg.sender;
    }
    
    function isOwner() external view returns(bool){
        return(msg.sender == owner);
    }
    
    modifier onlyOwner{
        require(owner == msg.sender, "You are Not Allowed");
        _;
    }
}