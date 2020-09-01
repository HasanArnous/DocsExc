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
//import axios from 'axios';
import "./App.css";

require("dotenv").config({path:'./.env'});


//import detectEthereumProvider from '@metamask/detect-provider';
//import { useTable } from "react-table";


class App extends Component {
  state = {
    loaded: false, processing: false, loaderClass: "page-loader-off", loaderImageClass: "page-loader-image-off",
    isOwner: false, comp_name: "", comp_account: "", ThisAccount: "", thisAccountName:"",
    comp_num: 0,
    comp_table: [], compHashMap:{},
    reqCompIndex: "", getCompName: "", getCompAddress: "", getCompActive: false,
    isExists: false, isActive: false, userPK: "",
    selected_client: 0, is_selected_client: false, selected_client_pk: "",
    selectedFile: null, successEncode: false, successEncryp: false, file_desc:"", uploadTime:"",
    signature:"", successSigned:false,
    successDecryp: false, decryptedFile:{}, decryptedFileObj:null,
     fileAsJSON: {}, messToEnc: "",
    encMess: "", decMess: "", fileURL: "", iframeSrc: "", iframeVis: "none",

    compDocsArr : [], allComDocs:[],

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
        this.listenToAccountChange();
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

  listenToAccountChange = () =>{
    window.ethereum.on('accountsChanged', (accounts) => {
      window.location.reload();
    });
  }



  handleInit = async () => {
    this.showLoader();
    await this.getThisAccount();
    await this.checkOwner();
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
        if(!this.state.isOwner){
          this.showMessage("This account is not registred, Please contact the Owner: SomeOneEmail@provider.com ", "y");
        }
        else{
          this.showMessage("Your company as the Owner is not registered yet, Please Register your company first!", "y")
        }
      }
    }
    catch (error) {
      this.catchError(error);
    }
  };


  checkIsActive = async () => {
    let is = "";
    try {
      this.showLoader();
      var result = await this.MyProject_ins.methods.doesCompActive(this.accounts[0]).call();
      is = result;
      this.setState({ isActive: is });
      if (result === true) {
        await this.checkUserPK();
        await this.getUserName();
        await this.BuildCompaniesTable();
        await this.getCompDocsArr();
      }
      else {
        let activation_block = document.getElementById("activation_block");
        if (activation_block != null) {
          activation_block.attributes.visible = false;
        }
        this.showMessage("This account is not active, Please activate it by pressing the below button\n" +
          "you will be asked to provide your public key for te sake of the encryption process in the future.", "y");
      }
      this.hideLoader();
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

  getUserName = async()=>{
    let comp = await this.MyProject_ins.methods.getCompanyByAddress(this.accounts[0]).call();
    const{0:_name} = comp;
    this.setState({thisAccountName:_name})
  }



  getThisAccount = async () => {
    let ff = await this.accounts[0];
    this.setState({ ThisAccount: ff});
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
      await this.newAccountFolder();
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
            t.MyProject_ins.methods.activateComp(window.encryptionpublickey).send({ from: t.accounts[0] }).then(
              () => {
                t.setState({ isActive: true });
                t.showMessage(`Your account has been activated successfully!`, "g");
                t.checkUserPK();
                t.BuildCompaniesTable();
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
      await this.getCompNum();
      var cNum =  this.state.comp_num;//await this.MyProject_ins.methods.getCompaniesNum().call({ from: this.accounts[0] });
      if (cNum > 0) {
        var table = [];
        var compHashMap = {};
        for (let i = 0; i < cNum; i++) {
          let comp = await this.MyProject_ins.methods.getCompany(i).call();
          table[i] = comp;
          compHashMap[(comp._address)] = comp._name;
        }
        this.setState({ comp_table: table,  compHashMap:compHashMap});
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
      console.error(error);
    }
  };

  inputOnChange = event => {
    try {
      this.showLoader();
      var file = event.target.files[0];
      if (file != null) {
        var reader = new FileReader();
        reader.onloadend = function () {
          console.log("readAsDataURL OUTPUT:", reader.result);
          var b64 = reader.result.replace(/^data:.+;base64,/, '');
          setMess(b64);
        };
        reader.readAsDataURL(file);
        

        var setMess = result => {
          var fileAsJSON = { "name": file.name, "lastModified": file.lastModified, "size": file.size, "type": file.type, "b64Data": result }
          this.setState({ messToEnc: result, fileAsJSON: fileAsJSON, successEncode: true })
          this.sign();
          this.encryptMessage();

        }
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
 
      console.log("PK: ", signer);  
      const Uaddress = EthCrypto.recover(
        sig,
        this.web3.eth.accounts.hashMessage(sha) // message hash
      );
      if (Uaddress === this.accounts[0]) {
        this.setState({signature:sig, successSigned:true})
      }
      else {
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
        //let CompPK = await this.MyProject_ins.methods.getCompanyPK(this.accounts[0]).call({ from: this.accounts[0] });
        let CompPK = this.state.selected_client_pk;
        const encryptedMessage = this.web3.utils.toHex(
          JSON.stringify(
            sigUtil.encrypt(
              CompPK,
              { data: mess },
              'x25519-xsalsa20-poly1305'
            )
          )
        );
        fileAsJSON.b64Data = encryptedMessage
        this.setState({ encMess: encryptedMessage, successEncryp:true, fileAsJSON:fileAsJSON });
        
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

  dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var file = new File([u8arr], filename, { type: mime });
    console.log(file)
    return file;
    
  }

  newAccountFolder = async()=>{
    try{
      const http = require('http');
      const data = JSON.stringify({"account":this.state.comp_account});
      let respBody = [];
      var option = {
          hostname: "localhost",
          port: 8082,
          method: "Post",
          path: "/newAccount",
          headers: {
            'Content-Type': 'application/json'
          }
        }

      const req = await http.request(option , (resp)=>{
        resp.on('data', (chunks)=>{
          respBody.push(chunks);
        }).on('end', ()=>{
          respBody = Buffer.concat(respBody).toString();
          console.log(respBody);
        })
      })

      req.on('error', (error)=>{
        console.error(error);
      })

      req.write(data);
      req.end();
    }
    catch(error){
      this.catchError(error);
    }
  }

  getServerDateTime = async () => {
    try {
      this.showLoader();


      var response = await fetch("http://localhost:8082/dateTime");
      const uploadTime = await response.json();
      this.setState({uploadTime:uploadTime});
      this.hideLoader();
      response.on('error', (error)=>{
        // read about how to recover from error on the fetch method......
      })



      // var http = require('http');
      // var option = {
      //   hostname: "localhost",
      //   port: 8082,
      //   method: "GET",
      //   path: "/dateTime",
      //   headers: {
      //     'Content-Type': 'text/html'
      //   }
      // }
      // var request = http.request(option, (resp) => {
      //   let body = [];
      //   resp.on('data', (chunk) => {
      //     body.push(chunk);
      //   }).on('end', () => {
      //     body = Buffer.concat(body).toString();
      //     this.setState({uploadTime:body});
      //   });
      // })
      // request.end();
      

      // request.on('error', (error) => {
      //   console.error(error)
      //   this.showMessage(error.message, "r");
      // })

    }
    catch(error){
      this.catchError(error);
    }
  }


  upload = async()=>{
    try{
      let file_desc = this.state.file_desc;
      if(file_desc.length <= 20 && file_desc.length > 0){
        this.showLoader();
        if((this.state.successSigned) && (this.state.signature !== "") && (this.state.is_selected_client) && (this.state.selected_client_pk !== "")){
          let transaction = await this.MyProject_ins.methods.createDoc(this.state.signature, file_desc, this.state.selected_client).send({from:this.accounts[0]});
          let doc_id = transaction.events.docCreated.returnValues.doc_id;
          let fileAsJSON = this.state.fileAsJSON;
          fileAsJSON.desc = file_desc;
          fileAsJSON.id = doc_id;
          fileAsJSON.from=this.accounts[0];
          fileAsJSON.to = this.state.selected_client;
          let fileName = doc_id+".json";
          this.setState({fileAsJSON:fileAsJSON})
  
          var jsonAsString = JSON.stringify(fileAsJSON, null, 2);  
  
          var http = require('http');
  
          var option = {
            hostname: "localhost",
            port: 8082,
            method: "POST",
            path: "/upload",
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': jsonAsString.length,
              'fileName' : fileName
            }
          }
          var request = http.request(option, (resp)=> {
            resp.on("data", (chunck)=> {
              console.log(chunck.toString());
              //process.stdout.write(chunck)
            }).on('end', ()=>{
              this.hideLoader();
              this.showMessage("The File Was Uploaded Successfully!", "g");
            })
          })
          request.on('error', (error) => {
            console.error(error)
            this.showMessage(error.message, "r");
          })
          request.write(jsonAsString);
          request.end();
          
          this.setState({successEncryp:true });
        }
      }else{
        this.showMessage("Please fill the File Description Field(maximum characters allowed 20!)", "y");
      }
      
    }
    catch(err){
      this.catchError(err);
    }
  }

  getCompDocsArr = async() =>{
    try{
      if(this.state.isExists && this.state.isActive){
        this.showLoader();
        let compDocsArr = await this.MyProject_ins.methods.getCompDocsArr().call({ from: this.accounts[0] });
        var allComDocs = [];
        if(compDocsArr != null){
          if(compDocsArr.length>0){
            this.setState({compDocsArr : compDocsArr});
            for(var r = 0; r<compDocsArr.length; r++){
              let Doc = await this.MyProject_ins.methods.getDoc(r).call({from:this.accounts[0]});
              Doc.comp_name = this.state.compHashMap[Doc.from_address];
              allComDocs[r] = Doc;
            }
            this.setState({allComDocs:allComDocs});
          }
        }
      }
      this.hideLoader();
    }
    catch(err){
      this.catchError(err);
    }
  }



   getDoc = async event =>{ 
    try {
      var doc_id = event.target.id;
      let fileInfo = {};
      fileInfo.account = this.accounts[0];
      fileInfo.fileName = doc_id;
      console.log("aaaaaaaaaaaaaaaa");
      console.log(doc_id);
      fileInfo = JSON.stringify(fileInfo, null, 2)
      console.log("bbbbbbbbbbb");
      let respBody = [];
      var http = require('http');

      var option = {
        hostname: "localhost",
        port: 8082,
        method: "POST",
        path: "/file",
        headers: { 
          'Content-Type': 'application/json',
          'Content-Length': fileInfo.length
         }
      }
      const req = await http.request(option, (resp) => {
        if (resp.statusCode === 200) {
          resp.on('data', (chunks) => {
            respBody.push(chunks);
          }).on('end', () => {
            console.log("finished reading the respond body");
            respBody = Buffer.concat(respBody).toString();
            let file = JSON.parse(respBody);
            console.log(file);
            this.setState({fileAsJSON:file, encMess:file.b64Data})
            this.decryptMess();
          })
        }
        else{
          console.log(resp.statusMessage);
          console.log(resp.statusCode);
        }
      })
      req.on('error', (error) => {
        console.error(error);
      })

      req.write(fileInfo);
      req.end();
    }
    catch (error) {
      this.catchError(error);
    }
  }

  decryptMess = async () => {
    try {
      const t = this;
      var src;
      this.showLoader();

      this.ethereum
        .request({
          method: 'eth_decrypt',
          params: [t.state.encMess, t.accounts[0]],
        })
        .then((decMess) => {
          this.setState({decFile:decMess})
          this.checkAndDisplay();
        })
        .catch((error) => {
          t.catchError(error);
          t.setState({ successDecryp: false });
        });
    }
    catch (error) {
      this.catchError(error);
      this.setState({ successDecryp: false });
    }
  }

  checkAndDisplay = async()=>{
    try{
      //check integrity:
      let doc = await this.MyProject_ins.methods.getDocByAdd(this.state.fileAsJSON.id).call();
      const {0:signature, 1:desc, 2:from_addresss, 3:to_address} = doc;
      let decFile = this.state.decFile;
      
      if (signature !== 0) {
        const Uaddress = EthCrypto.recover(
          signature,
          this.web3.eth.accounts.hashMessage(decFile) // message hash
        );
        if (Uaddress === from_addresss) {
          console.log("successfully decr");
          let fileAsJSON = this.state.fileAsJSON;
          let decryptedFile = {
            "b64Data":decFile,
             "desc": fileAsJSON.desc,
              "from": fileAsJSON.from,
               "id": fileAsJSON.id,
                "lastModified": fileAsJSON.lastModified,
                "name": fileAsJSON.name,
                "size": fileAsJSON.size,
                "to" : fileAsJSON.to,
                "type" : fileAsJSON.type,
                "uploadedAt" : fileAsJSON.uploadedAt
              }
              
          let src = "data:" + decryptedFile.type + ";base64," + decFile;//+", name:"+t.state.fileAsJSON.name;
          this.setState({ fileURL: src, iframeSrc: src, successDecryp: true, decryptedFile:decryptedFile });
          if ((decryptedFile.type === "application/pdf") ||
            (decryptedFile.type === "text/plain") ||
            (decryptedFile.type === "image/jpeg") ||
            (decryptedFile.type === "image/gif") ||
            (decryptedFile.type === "image/png")) {
              this.setState({ iframeVis: "block" })
          }
          else {
            this.setState({ iframeVis: "none" });
          }
          this.hideLoader();
          //t.showMessage("The File Decrypted Successfully!", "g");
          this.hideLoader();
          this.showMessage("The file was veryfied and checked for its data integrity ..", "g");
        }
        else {
          this.hideLoader();
          this.showMessage("This file has Tampred with its data, it's Not a veryfied file !", "r");
        }
      } else {
        this.hideLoader();
        this.showMessage("The Requested File Was Not Found On The Chain!", "y");
      }
    }
    catch(error){
      this.catchError(error);
    }
  }

  seeFile = () => {
    try {
      let newWindow = window.open("");
      newWindow.document.head.title = this.state.decryptedFile.name;
      newWindow.document.title=this.state.decryptedFile.name
      // newWindow.document.write(
      //   "<iframe width='100%' height='100%' src='data:" + this.state.decryptedFile.type + ";base64, " +
      //   encodeURI(this.state.decryptedFile.b64Data) + "'></iframe>"
      // )

      var content = atob(this.state.decryptedFile.b64Data);
      // create an ArrayBuffer and a view (as unsigned 8-bit)
      var buffer = new ArrayBuffer(content.length);
      var view = new Uint8Array(buffer);
      // fill the view, using the decoded base64
      for (var n = 0; n < content.length; n++) {
        view[n] = content.charCodeAt(n);
      }
      // convert ArrayBuffer to Blob
      var blob = new Blob([buffer], { type: this.state.decryptedFile.type });
      console.log(blob);
      //return blob;
      //let newWindow = window.open("")

      var url = URL.createObjectURL(blob);
      
      

      newWindow.document.title=this.state.decryptedFile.name
      newWindow.document.write(
        "<iframe width='100%' height='100%' src="+url+" title='"+this.state.decryptedFile.name+"'></iframe>"
      )

    }
    catch (error) {
      this.catchError(error);
    }
  };


  downloadFile = ()=>{
    const linkSource = `data:${this.state.decryptedFile.type};base64,${this.state.decryptedFile.b64Data}`;
    const downloadLink = document.createElement("a");
    const fileName = this.state.decryptedFile.name;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  seeFile2 = ()=>{
    var file = this.dataURLtoFile(`data:${this.state.decryptedFile.type};base64,${this.state.decryptedFile.b64Data}`,
     this.state.decryptedFile.name)
     console.log(file);
     this.setState({decryptedFileObj: file})
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
            encMess={this.state.encMess} successEncryp = {this.state.successEncryp}
            successSigned = {this.state.successSigned}
             decMess={this.state.decMess}
            handleInputChange={this.handleInputChange} 
            handleClientSelect={this.handleClientSelect}
            getCompDetails={this.getCompDetails}
            encryptMessage={this.encryptMessage}
             decryptMessage={this.decryptMessage}
            inputOnChange={this.inputOnChange}
             upload = {this.upload}
          />


          {this.state.compDocsArr.length > 0 ? (

            <div>
            <h3>Documents Received </h3>
            <table className="company_table">
              <thead>
                <tr>
                  <th>NO.</th><th>From</th><th>File Description</th><th>Sender Address</th>
                </tr>
              </thead>
                <tbody>
                  {this.state.allComDocs.map((Doc, i) => (
                    <tr key={"Doc_tr_" + i}>
                      <td>
                        {i + 1}
                      </td>
                      <td>
                        {Doc.comp_name}
                      </td>
                      <td>
                      <button className="view-btn" key={Doc.id} id={Doc.id} name={Doc.id} onClick={this.getDoc}>{Doc.desc}</button>
                      </td>
                      <td>
                        {Doc.from_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : ("")}

          <UndefiendCompanyDash isActive={this.state.isActive} isExists={this.state.isExists} isOwner={this.state.isOwner} />

          {this.state.successDecryp ? (<div><button type="button" onClick={this.seeFile}>See File</button></div>) : ""}
          <button type="button" onClick={this.downloadFile}>Download File</button>
          <button onClick={this.seeFile2}>seeFile2</button>
          <iframe src={this.state.decryptedFileObj} width="800px" height="2100px" />
          <iframe id="fileViewer" style={{ width: "80%", height: "800px", display: this.state.iframeVis, margin: "12px auto 32px auto" }}
            title={this.state.decryptedFile.name} src={this.state.iframeSrc} datatype={this.state.decryptedFile.type} 
            name={this.state.decryptedFile.name} >
          </iframe>
        </div>
      </div>
    );
  }
}

export default App;
