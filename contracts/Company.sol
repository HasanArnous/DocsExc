pragma solidity ^0.6.8;
contract Company{
    address public account;
    string public name ;
    string pk ;
    bool public created ;
    bool public active ;
    uint256[] receviedDocs;
    uint256[] sentDocs;
    
    constructor(address _account, string memory _name, string memory _pk) public{
        account = _account;
        name = _name;
        pk = _pk;
        created = true;
        active = false;
    }
    
    function activate() public{
        active = true;
    }
    
    function setPK(string memory _pk) public {
        pk = _pk;
    }
    
    function getPK() public view returns(string memory){
        return pk;
    }
    
    // add two function to add in both rec and sent docs the index of the documents.................
    
    function addRecDoc(uint256 _docIndex) public{
        receviedDocs.push(_docIndex);
    }
    
    function sendDoc(uint256 _docIndex) public{
        sentDocs.push(_docIndex);
    }
    
}
