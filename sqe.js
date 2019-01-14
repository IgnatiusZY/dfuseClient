const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const endpoint = "mainnet.eos.dfuse.io";
// const endpoint = "jungle.eos.dfuse.io";
// const endpoint = "kylin.eos.dfuse.io";

const token = "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDk1MjAzMTIsImp0aSI6Ijk4ODIxYmI4LWVhMmQtNDNlYS04M2ViLTJmMGI4NDY1MmFhMCIsImlhdCI6MTU0NjkyODMxMiwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJDaVFBNmNieWU1czFpTkFwU0RUZEtLNHZFRUpUNlYvNHU3VE85QlpTR1ZCbjd4d0RuZmNTUGdBL0NMUnR3VEJDdmtqZHdSRmphbjAzY1ErMWpGQ05wOU84UDgzd0V2NFhRM29hOW53TWJieU14anozdlo3S01vN0Q0bXlYYXdjdTNDZGlOZkRzIiwidGllciI6ImJldGEtdjEiLCJ2IjoxfQ.GLbcuQ32cpyZUw1O0qNsMOMngwxeeV-5PQetFFyZ0bvAEcbwm2RQpHslUCqf0AkG6eCfMEpdB2SZMqpScqDGpg";

let start_block_val=0, block_count_val=10000, limitVal=500, sortVal='asc', sqe='receiver:eosio.token action:transfer data.to:emanateaudio';
process.argv.forEach(function(value, index) {
    switch (index) {
        case 2:
            start_block_val = value;
            break;
        case 3:
            block_count_val = value;
            break;
        case 4:
            limitVal        = value;
            break;
        case 5:
            sortVal         = value;
    }
});

// request(
//     {url: `https://${endpoint}/v0/search/transactions`, 
//     qs: options, 
//     headers: {
//         'Authorization': `Bearer ${token}`
//     }}).pipe(fs.createWriteStream('output.txt'));

const csvWriter = createCsvWriter({
    path: 'outputlog.csv',
    header: [
        {id: 'index', title: 'Index'},
        {id: 'timestamp', title: 'Timestamp'},
        {id: 'transfer_from', title: 'From'},
        {id: 'transfer_to', title: 'To'},
        {id: 'transfer_memo', title: 'Memo'},
        {id: 'transfer_val', title: 'Value'}
    ]
});

var options = {
    start_block: start_block_val,
    block_count: block_count_val,
    limit: limitVal,
    sort: sortVal,
    q: sqe
};

request(
    {url: `https://${endpoint}/v0/search/transactions`, 
    qs: options, 
    headers: {
        'Authorization': `Bearer ${token}`
    }
}, function(error, response, data) {
    if (error) {
        console.log('Request Error: ', error);
    }
    if (data) {
        let output = [];
        data = JSON.parse(data);
        data.transactions.forEach(function(trxRow, index) {
            let tmp = {};
            tmp.index = index;
            trxRow.lifecycle.execution_trace.action_traces.forEach(function(actRow, index) {
                tmp.timestamp     = actRow.block_time;
                tmp.transfer_from = actRow.act.data.from;
                tmp.transfer_to   = actRow.act.data.to;
                tmp.transfer_memo = actRow.act.data.memo;
                tmp.transfer_val  = actRow.act.data.quantity;
            });
            output.push(tmp);
        });
        csvWriter
         .writeRecords(output)
         .then(() => console.log('The CSV File was Written to Successful'));
    }
})