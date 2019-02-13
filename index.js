/*
 *  Endpoints
 *  EOS Mainnet: (WebSocket: wss://mainnet.eos.dfuse.io/v1/stream, REST: https://mainnet.eos.dfuse.io/)
 *  Jungle 2.0 Network  (WebSocket: wss://jungle.eos.dfuse.io/v1/stream, REST: https://jungle.eos.dfuse.io/)
 *  CryptoKylin Network (WebSocket: wss://kylin.eos.dfuse.io/v1/stream,  REST: 	https://kylin.eos.dfuse.io/)
 */

 const {
     EoswsClient,
     createEoswsSocket,
     InboundMessageType
 } = require("@dfuse/eosws-js");
 const WebSocket = require("ws");

 const endpoint = "mainnet.eos.dfuse.io";
 // const endpoint = "jungle.eos.dfuse.io"
 // const endpoint = "kylin.eos.dfuse.io"

const token = "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTI2MTg0MzgsImp0aSI6IjM2OTc1OGI1LWY3MDctNDkyNy1hOGQ5LWVjZmY0ZTk3ODQ5ZSIsImlhdCI6MTU1MDAyNjQzOCwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJDaVFBNmNieWU4QjlIZVVlNWR0U0NWaVhrL3pvOGFRbDBKRWF1VW1Dd3ZhVzBPQzNQWGtTUGdBL0NMUnRkMXJSSXBVbDk1cFBzclpNRDU0Szc4RWhHVTJrOVBSVEVETnRnSjhKb21mV3dtMmg0RjdJNmZ3N0ZRRFZIaUVRWUx0K25FRUZXMGhWIiwidGllciI6ImJldGEtdjEiLCJ2IjoxfQ.awnQTgDcnr6yGTa3u_n6Pn6qyE1PwPHCUcM6vNsMGrQRZ28V3zo-8hDx_Gb8GvjYaSS8P05B0oD3ItNLegLbiQ";
const client = new EoswsClient(
    createEoswsSocket(
        () => new WebSocket(`wss://${endpoint}/v1/stream?token=${token}`, { origin: "https://emanate.live" })
    )
);

let contract, action = "";
process.argv.forEach(function(value, index) {
    if (index == 2) {
        contract = value
    }
    if (index == 3) {
        action = value
    }
});

client
    .connect()
    .then(() => {
        client
            .getActionTraces( { account: contract, action_name: action })
            .onMessage((message) => {
                if (action == "transfer" && message.type == InboundMessageType.ACTION_TRACE) {
                    const { from, to, quantity, memo } = message.data.trace.act.data;
                    console.log(from, to, quantity, memo);            
                }
            })
    })
    .catch((error) => {
        console.log("Unable to Connect to Dfuse.io Endpoint", error);
    });