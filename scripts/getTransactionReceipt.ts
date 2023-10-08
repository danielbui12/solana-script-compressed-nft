import axios from 'axios'
import dotenv from "dotenv";
dotenv.config();

async function getTransactionReceipt(transactionSignature: string) {
  const response = await axios.post(process.env.RPC_URL as string, {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "getTransaction",
    "params": [
      transactionSignature,
      "json"
    ]
  });

  const data = await response.data;
  console.log(JSON.stringify(data));
}

getTransactionReceipt('53wZLfGptKanot4yLGvcWQLRxS3JLFTccoozGzSEG1XVgtE1rNW7RLnRAQsuepxtwQFviLxZ479ZBNi2vXvkqodU');

