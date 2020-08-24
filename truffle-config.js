const path = require("path");
require("dotenv").config({path:'./.env'});
const hdWallet = require('@truffle/hdwallet-provider');
const accountIndex = 0;
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache:{
      provider: function(){
        return new hdWallet(process.env.MNEMONIC, "http://127.0.0.1:7545", accountIndex)
      },
      network_id: 5777
    },
    ropsten:{
      provider: function(){
        return new hdWallet(process.env.MNEMONIC, "https://ropsten.infura.io/v3/0347d15ce8534869af7be5a4d1ea620c", accountIndex)
      },
      network_id: 3
    }
  },
  compilers:{
    solc:{
      version: "0.6.8"
    }
  }
};
