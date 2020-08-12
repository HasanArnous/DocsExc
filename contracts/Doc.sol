pragma solidity ^0.6.8;

contract Doc{
    uint256 public id ;
    string public hash ;
    address public from_address ;
    address public to_address ;
    
    constructor (uint256 _id, string memory _hash, address _from_address, address _to_address) public {
        id = _id;
        hash = _hash;
        from_address = _from_address;
        to_address = _to_address;
    }
    
}