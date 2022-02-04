var Web3 = require("web3")

const { contractAddress, infuraLink } = require("./secret");

var web3 = new Web3(new Web3.providers.HttpProvider(infuraLink));

const contractAbi = require('./INSTabi.json');


const contract = new web3.eth.Contract(contractAbi, contractAddress);

var arr =[];

var blockno;

var blck =async()=> {
    blockno = await web3.eth.getBlockNumber()
}




let balances = new Map();



const getInDecimal=(amount)=>{
    let i=0;
    let size = amount.length;
    let integralpart = 0;
    for(i=0;i<size-19;i++)
    integralpart = (integralpart*10)+(amount[i]-'0');
    return integralpart ;
}


const checkBlocks= async (x,y) => {
    await contract.getPastEvents('Transfer',
    {
        fromBlock: x,
        toBlock: y,
    },
    (err, events) => {
        for(let x = 0;x<events.length;x++)
        {
            var fromAccount = events[x].returnValues.from;
            var toAccount = events[x].returnValues.to;
            var amount = events[x].returnValues.amount;
            var amt=getInDecimal(amount);
            if(balances.has(fromAccount))
            {
                let currentBalance = balances.get(fromAccount);
                currentBalance-=amt;
                balances.delete(fromAccount);
                balances.set(fromAccount,currentBalance);
            }
            else
            {
                balances.set(fromAccount,-amt);
            }
            if(balances.has(toAccount))
            {
                let currentBalance = balances.get(toAccount);
                currentBalance+=amt;
                balances.delete(toAccount);
                balances.set(toAccount,currentBalance);
            }
            else
            {
                balances.set(toAccount,amt);
            }
        }
    });
};

const loopOver = async()=>{
    let i;
    await blck();
    console.log(blockno)
    for( i=12183236;i<blockno;i+=10000)
    {
        await checkBlocks(i,i+9999)
        console.log(i);
    }
    if(i<blockno)
    await checkBlocks(i,blockno)
    let array = [];
    balances.forEach((values,keys)=>{
        array.push({balance: values, address: keys });
    })
    array = array.sort(function(a,b){
        return a.balance-b.balance;
    })
    let size = array.length;
    for(let i=size-1;i>=size-15;i--)
    {
        console.log(array[i].address,array[i].balance);
    }
}
loopOver();
