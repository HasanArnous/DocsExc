pragma solidity ^0.6.8;

contract Doc{
    string public signature ;
    string public desc;
    address public from_address ;
    address public to_address ;

    constructor (string memory _signature, string memory _desc, address _from_address, address _to_address) public {
        signature = _signature;
        desc = _desc;
        from_address = _from_address;
        to_address = _to_address;
    }   
}