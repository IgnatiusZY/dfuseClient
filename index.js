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

const token = "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDk1MjAzMTIsImp0aSI6Ijk4ODIxYmI4LWVhMmQtNDNlYS04M2ViLTJmMGI4NDY1MmFhMCIsImlhdCI6MTU0NjkyODMxMiwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiJDaVFBNmNieWU1czFpTkFwU0RUZEtLNHZFRUpUNlYvNHU3VE85QlpTR1ZCbjd4d0RuZmNTUGdBL0NMUnR3VEJDdmtqZHdSRmphbjAzY1ErMWpGQ05wOU84UDgzd0V2NFhRM29hOW53TWJieU14anozdlo3S01vN0Q0bXlYYXdjdTNDZGlOZkRzIiwidGllciI6ImJldGEtdjEiLCJ2IjoxfQ.GLbcuQ32cpyZUw1O0qNsMOMngwxeeV-5PQetFFyZ0bvAEcbwm2RQpHslUCqf0AkG6eCfMEpdB2SZMqpScqDGpg";
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