import {
  Keypair,
  PublicKey,
  AccountMeta,
  clusterApiUrl,
  Connection
} from "@solana/web3.js";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  CreateMetadataAccountArgsV3,
} from '@metaplex-foundation/mpl-token-metadata';

import * as bs58 from "bs58";
import { WrapperConnection } from "./WrapperConnection";
import { createCollection, createTree, mintCompressedNFT } from "./compression";
import { ValidDepthSizePair } from "@solana/spl-account-compression";

require('dotenv').config();

export function loadWalletKey(keypairFile: string): Keypair {
  const fs = require("fs")
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
  );
}

export function decode(stuff: string) {
  return bufferToArray(bs58.decode(stuff))
}
function bufferToArray(buffer: Buffer): number[] {
  const nums: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    nums.push(buffer[i]);
  }
  return nums;
}
export const mapProof = (assetProof: { proof: string[] }): AccountMeta[] => {
  if (!assetProof.proof || assetProof.proof.length === 0) {
    throw new Error("Proof is empty");
  }
  return assetProof.proof.map((node) => ({
    pubkey: new PublicKey(node),
    isSigner: false,
    isWritable: false,
  }));
};

export const nft_data = (creator: PublicKey): MetadataArgs => ({
  name: 'Helios 3D',
  symbol: 'AURY',
  uri: 'https://arweave.net/uKoxW5gu2A7Wem-tgyWZ9-T46aAg49Gac-n0GNibTjI',
  sellerFeeBasisPoints: 100,
  creators: [
    {
      address: creator,
      verified: true,
      share: 100,
    },
  ],
  editionNonce: 0,
  uses: null,
  primarySaleHappened: false,
  isMutable: false,
  tokenProgramVersion: TokenProgramVersion.Original,
  tokenStandard: TokenStandard.NonFungible,
  collection: null,
});
console.log(process.env.RPC_URL);

export const mintCNft = async (receiver: PublicKey) => {
  const payer = loadWalletKey("/home/tung/Downloads/wallet-keypair.json")
  console.log("Payer address:", payer.publicKey.toBase58());
  // load the env variables and store the cluster RPC url
  const CLUSTER_URL = process.env.RPC_URL ?? clusterApiUrl("devnet");

  // create a new rpc connection, using the ReadApi wrapper
  const connection = new WrapperConnection(CLUSTER_URL);

  /*
    Define our tree size parameters
  */
  const maxDepthSizePair: ValidDepthSizePair = {
    // max=16,384 nodes
    maxDepth: 14,
    maxBufferSize: 64,
  };
  const canopyDepth = maxDepthSizePair.maxDepth - 5;
  const treeKeypair = Keypair.generate();
  const tree = await createTree(connection, payer, treeKeypair, maxDepthSizePair, canopyDepth);

  const collectionMetadataV3: CreateMetadataAccountArgsV3 = {
    data: {
      name: "Super Sweet NFT Collection",
      symbol: "SSNC",
      // specific json metadata for the collection
      uri: "https://bafkreiaqzdzaykkqh7coa4lo3ag7apixn7akutysp6xglgo7i77npizxja.ipfs.nftstorage.link/",
      sellerFeeBasisPoints: 100,
      creators: [
        {
          address: payer.publicKey,
          verified: false,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    },
    isMutable: false,
    collectionDetails: null,
  };
  const collection = await createCollection(connection, payer, collectionMetadataV3);

  /*
    Mint a single compressed NFT
  */
  const compressedNFTMetadata: MetadataArgs = nft_data(payer.publicKey);

  // fully mint a single compressed NFT
  console.log(`Minting a single compressed NFT to ${receiver.toBase58()}...`);

  const assetId = await mintCompressedNFT(
    connection,
    payer,
    tree.treeAddress, // treeAddress,
    collection.mint, // collectionMint,
    collection.metadataAccount,// collectionMetadataAccount,
    collection.masterEditionAccount, //collectionMasterEditionAccount,
    compressedNFTMetadata,
    // mint to this specific wallet (in this case, airdrop to `testWallet`)
    receiver,
  );

  return {
    tree,
    collection,
    assetId,
  }
};

export const confirmTx = async (connection: Connection, txHash: string) => {
  const blockhashInfo = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: blockhashInfo.blockhash,
    lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
    signature: txHash,
  });
};