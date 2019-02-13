const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const endpoint = "mainnet.eos.dfuse.io";
// const endpoint = "jungle.eos.dfuse.io";
// const endpoint = "kylin.eos.dfuse.io";

const token = "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTI2MTg0MzgsImp0aSI6IjM2OTc1OGI1LWY3MDctNDkyNy1hOGQ5LWVjZmY0ZTk3ODQ5ZSIsImlhdCI6MTU1MDAyNjQzOCwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJDaVFBNmNieWU4QjlIZVVlNWR0U0NWaVhrL3pvOGFRbDBKRWF1VW1Dd3ZhVzBPQzNQWGtTUGdBL0NMUnRkMXJSSXBVbDk1cFBzclpNRDU0Szc4RWhHVTJrOVBSVEVETnRnSjhKb21mV3dtMmg0RjdJNmZ3N0ZRRFZIaUVRWUx0K25FRUZXMGhWIiwidGllciI6ImJldGEtdjEiLCJ2IjoxfQ.awnQTgDcnr6yGTa3u_n6Pn6qyE1PwPHCUcM6vNsMGrQRZ28V3zo-8hDx_Gb8GvjYaSS8P05B0oD3ItNLegLbiQ";

let start_block_val=0, block_count_val=42492125, limitVal=100, sortVal='asc', sqe='receiver:emanateoneos action:transfer data.from:emanateissue';
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
        {id: 'index',         title: 'Index'},
        {id: 'timestamp',     title: 'Timestamp'},
        {id: 'transfer_from', title: 'From'},
        {id: 'transfer_to',   title: 'To'},
        {id: 'transfer_memo', title: 'Memo'},
        {id: 'transfer_val',  title: 'Value'}
    ]
});

var options = {
    start_block: start_block_val,
    block_count: block_count_val,
    limit:       limitVal,
    sort:        sortVal,
    q:           sqe
};

request(
    {url: `https://${endpoint}/v0/search/transactions`, 
    qs: options, 
    headers: {
        'Authorization': `Bearer ${token}`
    }
}, function(error, response, data) {
    console.log('Data: ', data);
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