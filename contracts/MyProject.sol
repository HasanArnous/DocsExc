pragma solidity ^0.6.8;
import "./Doc.sol";
import "./Ownable.sol";
import "./Company.sol";

contract MyProject is Ownable {
    uint256 companies_index;
    address[] public companies_list;
    mapping(address => Company) public companies; 
    
    uint256 doc_index;
    mapping(uint256 => Doc) public docs;
    
    
    // EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS EVENTS
    event successRegis(uint256 _companies_index);
    event alreadyRegis(address indexed _account);
    event inactiveCompany(address indexed _account);
    event unregisteredCompany(address indexed _account);
    event allCompanies(string _name, address indexed _account);
    
    
    // MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER MODIFIER
    modifier doesCompanyExists(address _address){
        require(address(companies[_address]) != 0x0000000000000000000000000000000000000000, "This Account was not registred yet!");
        _;
    }
    modifier isRegAndActive(Company com){
        require(companies[msg.sender].created(), "Your account is not registred yet");
        require(companies[msg.sender].active(), "Your account is not activated yet");
        require(com.created(), "The target account was not registred yet");
        require(com.active(), "the target account was not activated yet");
        _;
    }
    modifier doesDocExists(uint256 docIndex){
        require(address(docs[docIndex]) != 0x0000000000000000000000000000000000000000, "The requested document doesn't exists!");
        _;
    }
    
    
    
    
    /// FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS FUNCTIONS
    function regCompany(address _account, string memory _name) public onlyOwner{
            Company company =  new Company(_account, _name,"");
            companies[_account] = company;
            companies_list.push(_account);
            companies_index++;
    }
    
    function activateComp(string memory _pk) public doesCompanyExists(msg.sender){
        if(companies[msg.sender].created()){
            Company com = companies[msg.sender];
            if(!com.active()){
                com.activate();
                com.setPK(_pk);
            }
            else{
                emit inactiveCompany(msg.sender);
            }
        }
        else{
            emit unregisteredCompany(msg.sender);
        }
    }

    function isActive() view external returns(bool isIt) {
        return(companies[msg.sender].active());
    }
    
    function getCompaniesNum() public view returns(uint256){
        return (companies_index);
    }

    function getCompanyPK(address _address) public doesCompanyExists(address(companies[_address])) doesCompanyExists(address(companies[msg.sender]))
    isRegAndActive(companies[_address])view returns(string memory){
        return(companies[_address].getPK());
    }
    
    function createDoc(string memory _hash, address _to_address) public doesCompanyExists(msg.sender) doesCompanyExists(_to_address) isRegAndActive(companies[_to_address]){
        Doc doc = new Doc(doc_index, _hash, msg.sender, _to_address);
        //  docRec[doc_index] = _to_address;
        //  docSend[doc_index] = msg.sender;
        docs[doc_index] = doc;
        doc_index++;
    }
    
    function getDocHash(uint _docIndex) public doesDocExists(_docIndex) view returns(string memory)  {
        return(docs[_docIndex].hash());
    }
    
    function getCompany(uint256 comp_index) public view returns(string memory _name, address _address){
        require(comp_index < companies_list.length, "getCompany function: request an index out of the array boundry..");
        _name = companies[companies_list[comp_index]].name();
        _address = companies_list[comp_index];
    }
    
    function getAllCompanies() public pure {
        
    }
    
    function getAllmyRecDocs() public doesCompanyExists(msg.sender) isRegAndActive(companies[msg.sender]) returns (Doc){
        // WHAT TO DO HERE ____________  t(-_-t)  ____________ USE THE COMPANY ALL RECEIVED DOCS AFTER ADDING THE ARRAY.
        
    }
    
}