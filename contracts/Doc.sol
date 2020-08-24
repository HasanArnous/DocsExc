pragma solidity ^0.6.8;

contract Doc{
    string public signature ;
    address public from_address ;
    address public to_address ;
    constructor (string memory _signature, address _from_address, address _to_address) public {
        signature = _signature;
        from_address = _from_address;
        to_address = _to_address;
    }   
}