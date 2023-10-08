import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

axios.post("https://api.shyft.to/sol/v1/marketplace/create", {
  "network": "devnet",
  "transaction_fee": 10,
  "fee_payer": "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd",
  "fee_recipient": "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd",
  "creator_wallet": "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd"
}, {
  headers: {
    "x-api-key": process.env.SHYFT_API_KEY as string
  }
})
  .then(result => console.log(result))
  .catch(error => console.log('error', error));