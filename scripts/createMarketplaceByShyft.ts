import axios from 'axios';

const SHYFT_API_KEY = 'W9YkroMlK1bO47r0'

axios.post("https://api.shyft.to/sol/v1/marketplace/create", {
  "network": "devnet",
  "transaction_fee": 10,
  "fee_payer": "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd",
  "fee_recipient": "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd",
  "creator_wallet": "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd"
}, {
  headers: {
    "x-api-key": SHYFT_API_KEY
  }
})
  .then(result => console.log(result))
  .catch(error => console.log('error', error));