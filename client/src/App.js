import React, { Component } from "react";
import MyProject from "./contracts/MyProject.json";
import getWeb3 from "./getWeb3";
//import { useTable } from "react-table";
import "./App.css";

class App extends Component {
  state = { loaded: false, isOwner: false, comp_name:"", comp_account:"", ThisAccount:"l" , accounts:"",
   networkID:"", comp_num:0,
    comp_table:"",
     reqCompIndex:"", getCompName:"", getCompAddress:""
    , isActive: false};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      
      this.MyProject_ins = new this.web3.eth.Contract(
        MyProject.abi,
        MyProject.networks[this.networkId] && MyProject.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToSuccessReg();
      this.setState({loaded: true, networkID: this.networkId,  accounts:this.accounts[0]}, this.handleInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInit = async()=>{
    this.checkOwner.call();
    this.getCompNum.call();
    this.BuildCompaniesTable();
    this.isActive();
  }

  handleInputChange = (event) =>{
    const target = event.target;
    this.setState({
      [target.name] : target.type === "checkbox" ? target.checked : target.value 
    }, this.getThisAccount)
  };

  checkOwner = async() =>{
    let isOwnerCall = await this.MyProject_ins.methods.isOwner().call({from:this.accounts[0]});
    console.log(isOwnerCall);
    console.log("Hi There");
    console.log(this.accounts[0]);
    var val ="gg";
    
    // if(isOwnerCall){
    //   val = "The Owner of the contract";
    // }
    // else{
    //   val = "Not the Owner of the contract";
    // }
    val = `${isOwnerCall}`;
    this.setState({isOwner: val});
  }


  registerCompany = async() =>{
    await this.MyProject_ins.methods.regCompany(this.state.comp_account, this.state.comp_name).send({from:this.accounts[0]});
  }

  getThisAccount = async()=>{
    let ff = await this.accounts[0];
    this.setState({ThisAccount: ff});
  }
  getCompNum = async()=>{
    let num = await this.MyProject_ins.methods.getCompaniesNum().call({from:this.accounts[0]});
    this.setState({comp_num:num}); 
  }

  isActive = async()=>{
    let isCompActive = await this.MyProject_ins.methods.isActive().call({from: this.accounts[0]});
    this.setState({isActive: isCompActive});
    console.log(`Is active: ${isCompActive}`);
  }

  listenToSuccessReg = ()=>{
    this.MyProject_ins.events.successRegis({}).on("data", this.getCompNum);
  }

  getCompDetails = async()=>{
    var indexPlusOne = parseInt(this.state.reqCompIndex);
    if(((indexPlusOne) > 0) && ((indexPlusOne-1) < this.state.comp_num)){
      var comp = await this.MyProject_ins.methods.getCompany(parseInt(indexPlusOne)-1).call();
        const { 0: _name, 1: _address } = comp;
        this.setState({ getCompName: _name, getCompAddress: _address });
    } 
  }

  BuildCompaniesTable = async()=>{
    var cNum = this.state.comp_num;
    if(cNum>0){
      var table = "<table>";
      for(let i = 0; i<cNum; i++){
        
        let comp = await this.MyProject_ins.methods.getCompany(cNum).call();
        let {0:_name, 1:_address} = comp;
        table += "<tr><td>"+_name+"</td><td>"+_address+"</td></tr>";
      }
      table += "</table>";
      this.setState({comp_table:table});
    }
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>MyProject</h1>
        <p>Is this the Owner: {this.state.isOwner}</p>
        <h2>Register a company</h2>
        Company Name:&nbsp;<input type="text" name="comp_name" value={this.state.comp_name} onChange={this.handleInputChange}></input>&nbsp;
        Account Address:&nbsp;<input type="text" name="comp_account" value={this.state.comp_account} onChange={this.handleInputChange}></input>&nbsp;
        <button type="button" onClick={this.registerCompany}>Register!</button>
        <br />
        <p>{this.state.comp_name}</p>
        <p>{this.ThisAccount}</p>
        <p>
          account: {this.state.accounts}
          <br/>
          Network ID: {this.state.networkID}
          <br />
          companies Number: {this.state.comp_num}
        </p>
        <div>
          Get a Company Details By Index:&nbsp;<input type="text" name="reqCompIndex" value={this.state.reqCompIndex} onChange={this.handleInputChange}></input>
          &nbsp;<button type="button" onClick={this.getCompDetails}>Get Details!</button>
          <br/>
          {this.state.getCompName}&nbsp;&nbsp;&nbsp;{this.state.getCompAddress}
        </div>
        <div>
          {this.state.comp_table}
        </div>
      </div>
    );
  }
}

export default App;
