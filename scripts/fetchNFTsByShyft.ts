import axios from 'axios'
const YOUR_WALLET_ADDRESS = '7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd';
const SHYFT_API_KEY = 'W9YkroMlK1bO47r0';
const network = 'devnet';
const collectionAddress = '9KD71uAN9HTPovRoYq7Zk7hJVacCQh7cPNXvw89Vsm1g';
const merkleTree = 'X5YZxkn4MmXqXwfJfmGvfucY2Ch217K59BURRVaHB5U';
/**
 * @api: https://docs.shyft.to/start-hacking/nft/compressed-nft#get-sol-v1-nft-compressed-read_all
 * 
 */
const fetchNFTsByWallet = () => {
  const nftUrl = `https://api.shyft.to/sol/v1/nft/compressed/read_all?network=${network}&wallet_address=${YOUR_WALLET_ADDRESS}`;
  axios.get(nftUrl, {
    headers: {
      'x-api-key': SHYFT_API_KEY,
    }
  })
    .then((res) => {
      console.log(JSON.stringify(res.data.result.nfts[0]));
    })
    .catch((err) => {
      console.log('fetchNFTsByWallet failed');
      console.warn(err);
    });
};

fetchNFTsByWallet();