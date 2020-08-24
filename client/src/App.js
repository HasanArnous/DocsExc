import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import OwnerDash from "./OwnerDash";
import ActivationDash from "./ActivationDash";
import ActiveCompanyDash from "./ActiveCompanyDash"
import UndefiendCompanyDash from "./UndefiendCompanyDash";
import MyProject from "./contracts/MyProject.json";
import getWeb3 from "./getWeb3";
import EthCrypto from 'eth-crypto';
import loader from './loader.gif';
import axios from 'axios';
import "./App.css";
require("dotenv").config({path:'./.env'});


//import detectEthereumProvider from '@metamask/detect-provider';
//import { useTable } from "react-table";


class App extends Component {
  state = {
    loaded: false, processing: false, loaderClass: "page-loader-off", loaderImageClass: "page-loader-image-off",
    isOwner: false, comp_name: "", comp_account: "", ThisAccount: "l",
    comp_num: 0,
    comp_table: [],
    reqCompIndex: "", getCompName: "", getCompAddress: "", getCompActive: false,
    isExists: false, isActive: false, userPK: "",
    selected_client: 0, is_selected_client: false, selected_client_pk: "",
    selectedFile: null, successEncode: false, successEncryp: false, signature:"", successSigned:false,
    successDecryp: false, fileAsJSON: {}, messToEnc: "",
    encMess: "", decMess: "", fileURL: "", iframeSrc: "", iframeVis: "none",

    mess_div_class: "mess_div_class_hide hide", message_txt: "",

  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();
      //this.web3.eth.revertReason = true;
      //this.provider = await detectEthereumProvider();
      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.MyProject_ins = new this.web3.eth.Contract(
        MyProject.abi,
        MyProject.networks[this.networkId] && MyProject.networks[this.networkId].address,
      );

      console.log(`Is MetaMask: ${window.ethereum.isMetaMask}`);
      if (!window.ethereum.isMetaMask) {
        alert(`Please Use MetaMask !`);
      }
      else {
        this.ethereum = window.ethereum;
        this.listenToSuccessReg();
        this.setState({ loaded: true }, this.handleInit);
      }

    } catch (error) {
      // Catch any errors for any of the above operations.
      this.showMessage("Failed to load web3, accounts, or contract.", "r");
      console.error(error);
    }
  };

  showLoader = () => {
    try {
      this.setState({ loaderClass: "page-loader-on", loaderImageClass: "page-loader-image-on" });
    }
    catch (error) {
      this.showMessage(error.message, "r");
      console.error(error);
    }
  }

  hideLoader = () => {
    try {
      this.setState({ loaderClass: "page-loader-off", loaderImageClass: "page-loader-image-off" });
    }
    catch (error) {
      this.showMessage(error.message, "r");
      console.error(error);
    }
  };


  showMessage = (message_txt, type) => {
    try {
      let className = "";
      switch (type) {
        case "r": //red
          className = "alert alert-danger alert-dismissible fade show";
          break;
        case "g": //green
          className = "alert alert-success alert-dismissible fade show";
          break;
        case "y": //yellow
          className = "alert alert-warning alert-dismissible fade show";
          break;
        default:
          className = "";
      }
      if (className !== "") {
        this.setState({ mess_div_class: className + " mess_div_class_show", message_txt: message_txt })
      }
      else {
        this.setState({ mess_div_class: "alert alert-danger alert-dismissible hide", message_txt: "" });
      }
    }
    catch (err) {
      console.error(err);
    }
  };

  hideMessage = () => {
    try {
      this.setState({ mess_div_class: "mess_div_class_hide hide", message_txt: "" });
    }
    catch (error) {
      console.error(error);
    }
  };

  catchError = (error) => {
    console.error(error);
    this.showMessage(error.message, "r");
    this.hideLoader();
  }

  listenToSuccessReg = async () => {
    this.MyProject_ins.events.successRegis({}).on("data", this.getCompNum);
  };



  handleInit = async () => {
    this.showLoader();
    await this.checkOwner.call();
    await this.getThisAccount();
    await this.getCompNum.call();
    await this.BuildCompaniesTable();
    await this.doesCompEx();
    this.hideLoader();
  };

  checkOwner = async () => {
    try {
      let isOwnerCall = await this.MyProject_ins.methods.isOwner().call({ from: this.accounts[0] });
      this.setState({ isOwner: isOwnerCall });
    }
    catch (error) {
      this.catchError(error);
    }
  };

  doesCompEx = async () => {
    try {
      let result = await this.MyProject_ins.methods.doesCompEx(this.accounts[0]).call();
      if (result) {
        this.setState({ isExists: result });
        if (result === true) {
          this.checkIsActive();
        }
      }
      else {
        this.showMessage("This account is not registred, Please contact the Owner: SomeOneEmail@provider.com ", "y");
      }
    }
    catch (error) {
      this.catchError(error);
    }
  };


  checkIsActive = async () => {
    let is = "";
    try {
      var result = await this.MyProject_ins.methods.doesCompActive(this.accounts[0]).call();
      is = result;
      this.setState({ isActive: is });
      if (result === true) {
        this.checkUserPK();
      }
      else {
        let activation_block = document.getElementById("activation_block");
        if (activation_block != null) {
          activation_block.attributes.visible = false;
        }
        this.showMessage("This account is not active, Please activate it by pressing the below button\n" +
          "you will be asked to provide your public key for te sake of the encryption process in the future.", "y");
      }
    } catch (error) {
      this.catchError(error);
    }
  };

  checkUserPK = async () => {
    try {
      if (this.state.isExists) {
        if (this.state.isActive) {
          try {
            let userPK = await this.MyProject_ins.methods.getCompanyPK(this.accounts[0]).call({ from: this.accounts[0] });
            this.setState({ userPK: userPK });
            console.log(`User PK: ${userPK}`);
          }
          catch (ex) {
            console.error(ex);
            this.showMessage(ex.message);
          }
        }
        else {
          this.showMessage("This account is not active, Please activate it by pressing the below button\n" +
            "you will be asked to provide your public key for te sake of the encryption process in the future.", "y");
        }
      }
      else {
        this.showMessage("This account is not registred, Please contact the Owner: SomeOneEmail@provider.com ", "y");
      }
    }
    catch (error) {
      this.catchError(error);
    }
  };




  getThisAccount = async () => {
    let ff = await this.accounts[0];
    this.setState({ ThisAccount: ff });
  }

  handleInputChange = (event) => {
    try {
      const target = event.target;
      this.setState({
        [target.name]: target.type === "checkbox" ? target.checked : target.value
      })
    }
    catch (error) {
      console.error(error);
      this.showMessage(error.message, "r");
    }
  };





  registerCompany = async () => {
    try {
      this.showLoader();
      await this.MyProject_ins.methods.regCompany(this.state.comp_account, this.state.comp_name).send({ from: this.accounts[0] });
      this.showMessage(`The account address:'${this.state.comp_account}' has been successfully registred as: '${this.state.comp_name}'`, "g");
      if (this.state.comp_account === this.accounts[0]) {
        this.setState({ isExists: true });
      }
      await this.getCompNum();
      await this.BuildCompaniesTable();
      this.hideLoader();
    }
    catch (error) {
      this.catchError(error);
    }
  };


  activateCompany = async () => {
    try {
      this.showLoader();
      if (this.state.isExists) {
        if (!this.state.isActive) {
          this.activateMyCompany();
        }
      }
      this.hideLoader();
    }
    catch (error) {
      this.catchError(error);
    }
  };

  activateMyCompany = async => {
    try {
      this.showLoader()
      const t = this;
      this.ethereum.sendAsync(
        {
          jsonrpc: '2.0',
          method: 'eth_getEncryptionPublicKey',
          params: [this.accounts[0]],
          from: this.accounts[0],
        },
        function (error, encryptionpublickey) {
          if (!error) {
            window.encryptionpublickey = encryptionpublickey.result;
            console.log(window.encryptionpublickey);
            t.MyProject_ins.methods.activateComp(window.encryptionpublickey).send({ from: t.accounts[0] }).then(
              () => {
                t.setState({ isActive: true });
                t.showMessage(`Your account has been activated successfully!`, "g");
                t.checkUserPK();
              }
            );
          } else {
            console.error(error);
            t.showMessage(error.message, "r");
          }
          t.hideLoader();
        }
      );
    }
    catch (error) {
      this.catchError(error);
    }
  };


  getCompNum = async () => {
    try {
      let num = await this.MyProject_ins.methods.getCompaniesNum().call({ from: this.accounts[0] });
      this.setState({ comp_num: num });
    }
    catch (error) {
      this.catchError(error);
    }
  };

  getCompDetails = async () => {
    try {
      this.showLoader();
      var indexPlusOne = parseInt(this.state.reqCompIndex);
      if (((indexPlusOne) > 0) && ((indexPlusOne - 1) < this.state.comp_num)) {
        var comp = await this.MyProject_ins.methods.getCompany(parseInt(indexPlusOne) - 1).call();
        const { 0: _name, 1: _address, 2: _active } = comp;
        this.setState({ getCompName: _name, getCompAddress: _address, getCompActive: _active ? "Active" : "Inactive" });
      }
      else {
        this.setState({ getCompName: "", getCompAddress: "Please Enter a Valid Number!", getCompActive: "" });
        this.showMessage(`Please enter a valid number, between 1 and ${this.state.comp_num}`, "y");
      }
      this.hideLoader();
    }
    catch (error) {
      this.catchError(error);
    }
  };

  BuildCompaniesTable = async () => {
    try {
      this.showLoader();
      var cNum = await this.MyProject_ins.methods.getCompaniesNum().call({ from: this.accounts[0] });
      if (cNum > 0) {
        var table = [];
        for (let i = 0; i < cNum; i++) {
          let comp = await this.MyProject_ins.methods.getCompany(i).call();
          table[i] = comp;
        }
        console.log(table);
        this.setState({ comp_table: table });
      }
      this.hideLoader();
    }
    catch (error) {
      this.catchError(error);
    }
  };

  handleClientSelect = event => {
    try {
      this.showLoader();
      let sel_cl = event.target.value;
      if (sel_cl === "empty") {

        this.setState({ is_selected_client: false, selected_client: sel_cl, selected_client_pk: "" })
      }
      else {
        this.getClientPK(sel_cl);
        this.setState({ is_selected_client: true, selected_client: sel_cl })
      }
      this.hideLoader()
    }
    catch (error) {
      this.catchError(error);
    }
  };

  getClientPK = async (sel_cl) => {
    try {
      this.showLoader();
      let selected_client_pk = await this.MyProject_ins.methods.getCompanyPK(sel_cl).call({ from: this.accounts[0] });
      this.setState({ selected_client_pk: selected_client_pk });
      this.hideLoader();
    }
    catch (error) {
      this.hideLoader.loder();
      console.log(error);
    }
  };

  inputOnChange = event => {
    try {
      this.showLoader();
      var file = event.target.files[0];

      var reader = new FileReader();
      reader.onloadend = function () {
        var b64 = reader.result.replace(/^data:.+;base64,/, '');
        setMess(b64);
      };
      reader.readAsDataURL(file);

      var setMess = result => {
        
        var fileAsJSON = { "name": file.name, "lastModified": file.lastModified, "size": file.size, "type": file.type, "b64Data": result}
        this.setState({ messToEnc: result, fileAsJSON: fileAsJSON, successEncode: true })
        this.sign();
        this.encryptMessage();
        
      }
      this.hideLoader();
    }
    catch (error) {
      this.catchError(error);
    }
  };

  sign = async () => {
    try {
      this.showLoader();
      alert("Please Sign On the 64Encoded Data To Maintain the Data Integrity.")
      let sha = this.state.messToEnc;

      var sig;
      await this.web3.eth.personal.sign(sha, this.accounts[0]).then((res) => { sig = res; });

      const signer = EthCrypto.recoverPublicKey(
        sig, // signature
        this.web3.eth.accounts.hashMessage(sha) // message hash
      );

      const Uaddress = EthCrypto.recover(
        sig,
        this.web3.eth.accounts.hashMessage(sha) // message hash
      );
      console.log(`Recovered address using the signautre and the signed message hash: ${Uaddress}`);

      if (Uaddress === this.accounts[0]) {
        this.setState({signature:sig, successSigned:true})
      }
      else {
        console.log(`Incorrect Data`);
        this.setState({signature:"", successSigned:false})
        this.showMessage("Failed To Sign Data, Please Try Again", "y");
      }
      this.hideLoader();
    }
    catch (error) {
      this.catchError(error);
    }
  };

  

  encryptMessage = async () => {
    try {
      this.showLoader();
      var sigUtil = require('eth-sig-util')
      const fileAsJSON = this.state.fileAsJSON;
      const mess = fileAsJSON.b64Data; //this.state.messToEnc;
      if (this.state.successEncode) {//this.state.selected_client_pk;//
        let CompPK = await this.MyProject_ins.methods.getCompanyPK(this.accounts[0]).call({ from: this.accounts[0] });
        const encryptedMessage = this.web3.utils.toHex(
          JSON.stringify(
            sigUtil.encrypt(
              CompPK,
              { data: mess },
              'x25519-xsalsa20-poly1305'
            )
          )
        );
        //console.log(encryptedMessage);
        this.setState({ encMess: encryptedMessage });
        this.hideLoader();
        this.showMessage("The File Encrypted Successfully!", "g");
      }
      else {
        this.hideLoader();
        console.log(`Somthing went wrong with the Encoder at: encryptMessage()`);
        this.showMessage("Somthing went wrong with the Encoder!", "r");
      }

    }
    catch (error) {
      this.hideLoader();
      console.error(error);
      this.showMessage(error.message, "r");
    }
  };

  decryptMessage = async => {
    try {
      const t = this;
      var src;
      this.showLoader();
      this.ethereum.sendAsync(
        {
          jsonrpc: '2.0',
          method: 'eth_decrypt',
          params: [this.state.encMess, this.accounts[0]],
          from: this.accounts[0],
        },
        function (error, message) {
          console.log(error, message);
          if (!error) {
            t.setState({ decMess: message.result })
            src = "data:" + t.state.fileAsJSON.type + ";base64," + message.result;//+", name:"+t.state.fileAsJSON.name;
            t.setState({ fileURL: src, iframeSrc: src, successDecryp: true });
            if (
              (t.state.fileAsJSON.type === "application/pdf") ||
              (t.state.fileAsJSON.type === "text/plain") ||
              (t.state.fileAsJSON.type === "image/jpeg") ||
              (t.state.fileAsJSON.type === "image/gif") ||
              (t.state.fileAsJSON.type === "image/png")
            ) {
              t.setState({ iframeVis: "block" })
            }
            else {
              t.setState({ iframeVis: "none" });
            }
            t.hideLoader();
            t.showMessage("The File Decrypted Successfully!", "g");
          } else {
            console.error(error);
            t.setState({ successDecryp: false })
            t.hideLoader();
            t.showMessage(`The decryption process failed!\n${error.message}`, "r");
          }
        }
      );
    }
    catch (error) {
      this.hideLoader();
      console.error(error);
      this.showMessage(`The decryption process failed!\n${error.message}`, "r");
    }
  };


  seeFile = () => {
    try {
      let newWindow = window.open("")
      newWindow.document.write(
        "<iframe width='100%' height='100%' src='data:" + this.state.fileAsJSON.type + ";base64, " +
        encodeURI(this.state.fileAsJSON.b64Data) + "'></iframe>"
      )
    }
    catch (error) {
      this.catchError(error);
    }
  };

  // dataURLtoFile = (dataurl, filename) => {
  //   var arr = dataurl.split(','),
  //     mime = arr[0].match(/:(.*?);/)[1],
  //     bstr = atob(arr[1]),
  //     n = bstr.length,
  //     u8arr = new Uint8Array(n);
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   return new File([u8arr], filename, { type: mime });
  // }


  upload = async()=>{
    try{
      this.showLoader();
      if((this.state.successSigned) && (this.state.signature !== "") && (this.state.is_selected_client) && (this.state.selected_client_pk !== "")){
        let transaction = await this.MyProject_ins.methods.createDoc(this.state.signature, this.state.selected_client).send({from:this.accounts[0]});
        let doc_id = transaction.events.docCreated.address
        console.log(doc_id);
        const data = new FormData();
        let fileAsJSON = this.state.fileAsJSON;
        fileAsJSON.id = doc_id;
        fileAsJSON.to = this.state.selected_client;
        this.setState({fileAsJSON:fileAsJSON})
        data.append('file', fileAsJSON);
        let path = "http://localhost:8000/upload";
        this.hideLoader();
        axios.post(path, data, { // receive two parameter endpoint url ,form data 
        })
        .then(res => { // then print response status
          console.log(res.statusText)
        })
      }
    }
    catch(err){
      this.catchError(err);
    }
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="App-header">
          <h1 style={{textDecoration:"underline"}}>Documents Exchange Project</h1>
          <br/>
          <h2>Exchange Document Through Blockchain Technology Powered by Ethereum</h2>
          <h2>Using Encryption and Decryption Completly on the Client Side</h2>
        </div>
        <div id="mess" className={this.state.mess_div_class}>
          <button type="button" className="close" onClick={this.hideMessage}>&times;</button>
          {this.state.message_txt}
        </div>

        <div id="page_loader" className={this.state.loaderClass}>
          <img src={loader} id="loader_image" width="150" height="150" alt="loader" className={this.state.loaderImageClass} />
        </div>

        <div className="col-sm-12" style={{ display: this.state.contentVisibility, padding: "24px", background_color: "#fdfdfd" }}>

          

          <OwnerDash isOwner={this.state.isOwner} comp_name={this.state.comp_name} comp_account={this.state.comp_account}
            handleInputChange={this.handleInputChange} registerCompany={this.registerCompany} />

          <ActivationDash isActive={this.state.isActive} isExists={this.state.isExists} activateCompany={this.activateCompany} />

          <div>
            <h3>Your Account Address:</h3>
            <p>{this.accounts[0]}</p>
            <br />
          </div>

          <ActiveCompanyDash isExists={this.state.isExists} isActive={this.state.isActive}
            userPK={this.state.userPK} comp_num={this.state.comp_num} reqCompIndex={this.state.reqCompIndex}
            getCompName={this.state.getCompName} getCompAddress={this.state.getCompAddress}
            comp_table={this.state.comp_table}
            is_selected_client={this.state.is_selected_client}
            selected_client={this.state.selected_client}
            selected_client_pk={this.state.selected_client_pk}
            encMess={this.state.encMess} decMess={this.state.decMess}
            handleInputChange={this.handleInputChange} handleClientSelect={this.handleClientSelect}
            getCompDetails={this.getCompDetails}
            encryptMessage={this.encryptMessage} decryptMessage={this.decryptMessage}
            inputOnChange={this.inputOnChange} upload = {this.upload}
          />

          <button type="button" onClick={this.sign}>Sign</button>

          <UndefiendCompanyDash isActive={this.state.isActive} isExists={this.state.isExists} isOwner={this.state.isOwner} />

          {this.state.successDecryp ? (<div><button type="button" onClick={this.seeFile}>See File</button></div>) : ""}

          <iframe id="fileViewer" style={{ width: "80%", height: "800px", display: this.state.iframeVis, margin: "12px auto 32px auto" }}
            title={this.state.fileAsJSON.name} src={this.state.iframeSrc}>
          </iframe>

        </div>
      </div>
    );
  }
}

export default App;
