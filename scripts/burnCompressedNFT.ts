import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

axios.delete("https://api.shyft.to/sol/v1/nft/compressed/burn", {
  data: {
    "network": "devnet",

    nft_address: "24ujvcSMx1f2rzaG3mqkpFNmc8foixJ7cd5uu3Gv9gEE",
    wallet_address: "7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd",

  },
  headers: {
    "x-api-key": process.env.SHYFT_API_KEY as string
  }
})
  .then(result => console.log(result))
  .catch(error => console.log('error', error));