var Web3 = require("web3")
const BN = require('bn.js');
const { contractAddress, infuraLink } = require("./secret");

var web3 = new Web3(new Web3.providers.HttpProvider(infuraLink));


var contractAccount = contractAddress;
    



const getTop15Holders= async()=>{
    let block = await web3.eth.getBlock('latest');
    let blockNumber= block.number;
 
    let balances = new Map();

    
    for(let i=blockNumber;i>=0 ;i--) 
    {
        let blck = await web3.eth.getBlock(i);
        if(blck!=null && blck.transactions!=null)
        {
            for(let txHash of blck.transactions)
            {
                let tx = await web3.eth.getTransaction(txHash);
                if(contractAccount == tx.to.toLowerCase())
                {
                    var input = tx.input;
                    var isTransfer = input.substring(0,10);
                if(isTransfer == '0xa9059cbb')
                    {
                        var fromAccount = tx.from;
                        var toAccount = '0x' + input.substring(34,74);
                        var amount = input.substring(74);
                        var amtInBN = new BN(amount, 16);
                        if(balances.has(fromAccount))
                        {
                            let currentBalance = balances.get(fromAccount);
                            currentBalance.sub(amtInBN);
                            balances.delete(fromAccount);
                            balances.set(fromAccount,currentBalance);
                        }
                        else
                        {
                            balances.set(fromAccount,amtInBN.neg());
                        }
                        if(balances.has(toAccount))
                        {
                            let currentBalance = balances.get(toAccount);
                            currentBalance.add(amtInBN);
                            balances.delete(toAccount);
                            balances.set(toAccount,currentBalance);
                        }
                        else
                        {
                            balances.set(toAccount,amtInBN);
                        }
               
                    }
                }
            }
        }
    }    
    
    let array = [];
    balances.forEach((values,keys)=>{
        array.push({balance: values, address: keys });
    })
    array = array.sort(function(a,b){
        return a.balance.sub(b.balance);
    })
    let size = array.length;
    for(let i=size-1;i>=size-15;i--)
    {
        console.log(array[i].address);
    }
}






getTop15Holders();


