pragma solidity ^0.6.8;
contract Company{
    address public account;
    string public name ;
    string pk ;
    bool public created ;
    bool public active ;
    address[] recDocs;
    
    
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
    
    function pushDoc(address docAddress) public{
        recDocs.push(docAddress);
    }

    function getRecDocsArr(address owner) public view returns(address[] memory){
        require(owner == account, "You are not the Owner Of this Account");
        return recDocs;
    }
    
    
    
    // add two function to add in both rec and sent docs the index of the documents.................
    

    
}
