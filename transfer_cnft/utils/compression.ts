import {
  Keypair,
  PublicKey,
  Connection,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  TransactionResponse,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { createAccount, createMint, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  createAllocTreeIx,
  ValidDepthSizePair,
  SPL_NOOP_PROGRAM_ID,
  ChangeLogEventV1,
  deserializeChangeLogEventV1,
} from "@solana/spl-account-compression";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  MetadataArgs,
  createCreateTreeInstruction,
  createMintToCollectionV1Instruction,
  getLeafAssetId
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  CreateMetadataAccountArgsV3,
  createCreateMetadataAccountV3Instruction,
  createCreateMasterEditionV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { WrapperConnection } from "./WrapperConnection";
import * as bs58 from 'bs58';
import { BN } from "bn.js";
import axios from "axios";

/*
  Helper function to create a merkle tree on chain, including allocating 
  all the space required to store all the nodes
*/
export async function createTree(
  connection: Connection,
  payer: Keypair,
  treeKeypair: Keypair,
  maxDepthSizePair: ValidDepthSizePair,
  canopyDepth: number = 0,
) {
  console.log("Creating a new Merkle tree...");
  console.log("treeAddress:", treeKeypair.publicKey.toBase58());

  // derive the tree's authority (PDA), owned by Bubblegum
  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [treeKeypair.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID,
  );
  console.log("treeAuthority:", treeAuthority.toBase58());

  // allocate the tree's account on chain with the `space`
  // NOTE: this will compute the space needed to store the tree on chain (and the lamports required to store it)
  const allocTreeIx = await createAllocTreeIx(
    connection,
    treeKeypair.publicKey,
    payer.publicKey,
    maxDepthSizePair,
    canopyDepth,
  );

  // create the instruction to actually create the tree
  const createTreeIx = createCreateTreeInstruction(
    {
      payer: payer.publicKey,
      treeCreator: payer.publicKey,
      treeAuthority,
      merkleTree: treeKeypair.publicKey,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      // NOTE: this is used for some on chain logging
      logWrapper: SPL_NOOP_PROGRAM_ID,
    },
    {
      maxBufferSize: maxDepthSizePair.maxBufferSize,
      maxDepth: maxDepthSizePair.maxDepth,
      public: false,
    },
    BUBBLEGUM_PROGRAM_ID,
  );

  try {
    // create and send the transaction to initialize the tree
    const tx = new Transaction().add(allocTreeIx).add(createTreeIx);
    tx.feePayer = payer.publicKey;

    // send the transaction
    const txSignature = await sendAndConfirmTransaction(
      connection,
      tx,
      // ensuring the `treeKeypair` PDA and the `payer` are BOTH signers
      [treeKeypair, payer],
      {
        commitment: "confirmed",
        skipPreflight: true,
      },
    );

    console.log("\nMerkle tree created successfully!");

    // return useful info
    return { treeAuthority, treeAddress: treeKeypair.publicKey };
  } catch (err: any) {
    console.error("\nFailed to create merkle tree:", err);

    // log a block explorer link for the failed transaction
    throw err;
  }
}

/**
 * Create an NFT collection on-chain, using the regular Metaplex standards
 * with the `payer` as the authority
 */
export async function createCollection(
  connection: Connection,
  payer: Keypair,
  metadataV3: CreateMetadataAccountArgsV3,
) {
  // create and initialize the SPL token mint
  console.log("Creating the collection's mint...");
  const mint = await createMint(
    connection,
    payer,
    // mint authority
    payer.publicKey,
    // freeze authority
    payer.publicKey,
    // decimals - use `0` for NFTs since they are non-fungible
    0,
  );
  console.log("Mint address:", mint.toBase58());

  // create the token account
  console.log("Creating a token account...");
  const tokenAccount = await createAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    // undefined, undefined,
  );
  console.log("Token account:", tokenAccount.toBase58());

  // mint 1 token ()
  console.log("Minting 1 token for the collection...");
  const mintSig = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount,
    payer,
    // mint exactly 1 token
    1,
    // no `multiSigners`
    [],
    undefined,
    TOKEN_PROGRAM_ID,
  );
  console.log('mint Token transaction signature', mintSig);
  
  // derive the PDA for the metadata account
  const [metadataAccount, _bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata", "utf8"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  );
  console.log("Metadata account:", metadataAccount.toBase58());

  // create an instruction to create the metadata account
  const createMetadataIx = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccount,
      mint: mint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: metadataV3,
    },
  );

  // derive the PDA for the metadata account
  const [masterEditionAccount, _bump2] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition", "utf8"),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );
  console.log("Master edition account:", masterEditionAccount.toBase58());

  // create an instruction to create the metadata account
  const createMasterEditionIx = createCreateMasterEditionV3Instruction(
    {
      edition: masterEditionAccount,
      mint: mint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
      metadata: metadataAccount,
    },
    {
      createMasterEditionArgs: {
        maxSupply: 0,
      },
    },
  );

  // create the collection size instruction
  const collectionSizeIX = createSetCollectionSizeInstruction(
    {
      collectionMetadata: metadataAccount,
      collectionAuthority: payer.publicKey,
      collectionMint: mint,
    },
    {
      setCollectionSizeArgs: { size: 50 },
    },
  );

  try {
    // construct the transaction with our instructions, making the `payer` the `feePayer`
    const tx = new Transaction()
      .add(createMetadataIx)
      .add(createMasterEditionIx)
      .add(collectionSizeIX);
    tx.feePayer = payer.publicKey;

    // send the transaction to the cluster
    await sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
    });

    console.log("\nCollection successfully created!");
  } catch (err) {
    console.error("\nFailed to create collection:", err);

    throw err;
  }

  // return all the accounts
  return { mint, tokenAccount, metadataAccount, masterEditionAccount };
}

/**
 * Mint a single compressed NFTs to any address
 */
export async function mintCompressedNFT(
  connection: WrapperConnection | Connection,
  payer: Keypair,
  treeAddress: PublicKey,
  collectionMint: PublicKey,
  collectionMetadata: PublicKey,
  collectionMasterEditionAccount: PublicKey,
  compressedNFTMetadata: MetadataArgs,
  receiverAddress?: PublicKey,
) {
  // derive the tree's authority (PDA), owned by Bubblegum
  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [treeAddress.toBuffer()],
    BUBBLEGUM_PROGRAM_ID,
  );

  // derive a PDA (owned by Bubblegum) to act as the signer of the compressed minting
  const [bubblegumSigner, _bump2] = PublicKey.findProgramAddressSync(
    // `collection_cpi` is a custom prefix required by the Bubblegum program
    [Buffer.from("collection_cpi", "utf8")],
    BUBBLEGUM_PROGRAM_ID,
  );

  // create an array of instruction, to mint multiple compressed NFTs at once
  const mintIxs: TransactionInstruction[] = [];

  /**
   * correctly format the metadata args for the nft to mint
   * ---
   * note: minting an nft into a collection (via `createMintToCollectionV1Instruction`)
   * will auto verify the collection. But, the `collection.verified` value inside the
   * `metadataArgs` must be set to `false` in order for the instruction to succeed
   */
  const metadataArgs = Object.assign(compressedNFTMetadata, {
    collection: { key: collectionMint, verified: false },
  });

  /*
    Add a single mint to collection instruction 
    ---
    But you could all multiple in the same transaction, as long as your 
    transaction is still within the byte size limits
  */
  mintIxs.push(
    createMintToCollectionV1Instruction(
      {
        payer: payer.publicKey,

        merkleTree: treeAddress,
        treeAuthority,
        treeDelegate: payer.publicKey,

        // set the receiver of the NFT
        leafOwner: receiverAddress || payer.publicKey,
        // set a delegated authority over this NFT
        leafDelegate: payer.publicKey,

        /*
            You can set any delegate address at mint, otherwise should 
            normally be the same as `leafOwner`
            NOTE: the delegate will be auto cleared upon NFT transfer
            ---
            in this case, we are setting the payer as the delegate
          */

        // collection details
        collectionAuthority: payer.publicKey,
        collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID,
        collectionMint: collectionMint,
        collectionMetadata: collectionMetadata,
        editionAccount: collectionMasterEditionAccount,

        // other accounts
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        bubblegumSigner: bubblegumSigner,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      },
      {
        metadataArgs,
      },
    ),
  );

  try {
    // construct the transaction with our instructions, making the `payer` the `feePayer`
    const tx = new Transaction().add(...mintIxs);
    tx.feePayer = payer.publicKey;

    // send the transaction to the cluster
    const txSignature = await sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
    });

    console.log("\nSuccessfully minted the compressed NFT!");

    // get asset Id
    const txData = await connection.getTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });
    console.log("txData", txData);
    const events = getAllChangeLogEventV1FromTransaction(txData);
    console.log(events);
    // compute the assetId of the compressed nft just minted
    const assetId = await getLeafAssetId(events[0].treeId, new BN(events[0].index));
    console.log(assetId);

    return assetId;
  } catch (err) {
    console.error("\nFailed to mint compressed NFT:", err);

    throw err;
  }
}

/**
 * Helper function to extract the all ChangeLogEventV1 emitted in a transaction
 * @param txResponse - Transaction response from `@solana/web3.js`
 * @param noopProgramId - program id of the noop program used (default: `SPL_NOOP_PROGRAM_ID`)
 * @returns
 */
export function getAllChangeLogEventV1FromTransaction(
  txResponse: TransactionResponse | VersionedTransactionResponse,
  noopProgramId: PublicKey = SPL_NOOP_PROGRAM_ID
): ChangeLogEventV1[] {
  // ensure a transaction response was provided
  if (!txResponse) throw Error("No txResponse provided");

  // flatten the array of all account keys (e.g. static, readonly, writable)
  const accountKeys = txResponse.transaction.message
    .getAccountKeys()
    .keySegments()
    .flat();

  let changeLogEvents: ChangeLogEventV1[] = [];

  // locate and parse noop instruction calls via cpi (aka inner instructions)
  txResponse!.meta?.innerInstructions?.forEach((compiledIx) => {
    compiledIx.instructions.forEach((innerIx) => {
      // only attempt to parse noop instructions
      if (
        noopProgramId.toBase58() !==
        accountKeys[innerIx.programIdIndex].toBase58()
      )
        return;

      try {
        // try to deserialize the cpi data as a changelog event
        changeLogEvents.push(
          deserializeChangeLogEventV1(Buffer.from(bs58.decode(innerIx.data)))
        );
      } catch (__) {
        // this noop cpi is not a changelog event. do nothing with it.
      }
    });
  });

  return changeLogEvents;
}