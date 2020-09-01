pragma solidity ^0.6.8;
import "./Doc.sol";
import "./Ownable.sol";
import "./Company.sol";

contract MyProject is Ownable {
    uint256 companies_index;
    address[] public companies_list;
    mapping(address => Company) public companies; 
    mapping(address => Doc) public docs;
    event successRegis(uint256 _companies_index);
    event alreadyRegis(address indexed _account);
    event inactiveCompany(address indexed _account);
    event unregisteredCompany(address indexed _account);
    event allCompanies(string _name, address indexed _account);
    event docCreated(address indexed doc_id);
    modifier DCE(address _address){
        require(address(companies[_address]) != 0x0000000000000000000000000000000000000000, "This Account was not registred yet!");
        _;
    }
    modifier DCA(address _address){
        require(companies[msg.sender].active(), "This Company is Not Active Yet");
        _;
    }
    modifier isRegAndActive(Company com){
        require(companies[msg.sender].created(), "Your account is not registred yet");
        require(companies[msg.sender].active(), "Your account is not activated yet");
        require(com.created(), "The target account was not registred yet");
        require(com.active(), "the target account was not activated yet");
        _;
    }
    function regCompany(address _account, string memory _name) public onlyOwner{
            Company company =  new Company(_account, _name,"");
            companies[_account] = company;
            companies_list.push(_account);
            companies_index++;
    }
    function activateComp(string memory _pk) public DCE(msg.sender){
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
    function createDoc(string memory _signature, string memory desc, address _to_address) public DCE(msg.sender) DCE(_to_address) isRegAndActive(companies[_to_address]) returns(address){
        Doc doc = new Doc(_signature, desc, msg.sender, _to_address);
        companies[_to_address].pushDoc(address(doc));
        docs[address(doc)] = doc;
        emit docCreated(address(doc));
    }
    function doesCompEx(address _address) public view returns(bool){
        return(address(companies[_address]) != 0x0000000000000000000000000000000000000000);
    }
    function doesCompActive(address _address) view external returns(bool) {
        if(doesCompEx(_address)){
            return(companies[_address].active());
        }
        else{
            return false;
        }
    }
    function getCompaniesNum() public view returns(uint256){
        return (companies_index);
    }
    function getCompanyPK(address _address) public DCE(_address) DCE(msg.sender)
    isRegAndActive(companies[_address])view returns(string memory){
        return(companies[_address].getPK());
    }
    function getCompDocsArr() public DCE(msg.sender) view returns( address[] memory arr ){
        Company c = companies[msg.sender];
        return c.getRecDocsArr(msg.sender);
    }
    function getDoc(uint _docIndex) public view returns(address id, string memory signature, string memory desc, address from_address, address to_address)   {
        address[] memory arr = getCompDocsArr();
        uint len = arr.length;
        require((_docIndex < len) && (_docIndex >= 0) , "getDoc function: request a document that out of the array boundry..");
        
        Doc doc = docs[address(arr[_docIndex])];
        id = address(arr[_docIndex]);
        signature = doc.signature();
        desc = doc.desc();
        from_address = doc.from_address();
        to_address = doc.to_address();
    }
    function getDocByAdd(address add) public view returns(string memory signature, string memory desc, address from_address, address to_address){
        Doc doc = docs[add];
        signature = doc.signature();
        desc = doc.desc();
        from_address = doc.from_address();
        to_address = doc.to_address();
    }
    function getCompany(uint256 comp_index) public view returns(string memory _name, address _address, bool _active){
        require(comp_index < companies_list.length, "getCompany function: request an index out of the array boundry..");
        _name = companies[companies_list[comp_index]].name();
        _address = companies_list[comp_index];
        _active = companies[companies_list[comp_index]].active();
    }
    function getCompanyByAddress(address adres) public view DCE(adres) returns(string memory _name, bool _active) {
        _name = companies[adres].name();
        _active = companies[adres].active();
    }
}