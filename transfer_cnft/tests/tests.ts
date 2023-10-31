import * as anchor from "@coral-xyz/anchor";
import { confirmTx, decode, mapProof, mintCNft } from "../utils/utils";
import { CnftVault } from "../target/types/cnft_vault";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { WrapperConnection } from "../utils/WrapperConnection";
import { createCollection } from "../utils/compression";
import { program, keypair as payer, provider } from "./scripts/constants";
require('dotenv').config();

describe("cNFT Vault", () => {
  let assetId: anchor.web3.PublicKey,
    tree: anchor.web3.PublicKey;

  const [vaultPDA, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("cNFT-vault", "utf8")],
    program.programId
  );

  before(async () => { 
    let fromAirdropSignature = await provider.connection.requestAirdrop(
      payer.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL,
    )
    await confirmTx(provider.connection, fromAirdropSignature);
  })

  it("Mint cNFT to vaultPDA", async () => { 
    const nftData = await mintCNft(vaultPDA);
    tree = nftData.tree.treeAddress;
  })

  // it("Withdraw a cNFT!", async () => {
  //   // we expect the cNFT to already be in the vault
  //   // you can send it there (to vaultPDA) using any regular wallet
  //   // the cNFT has the following asset id
  //   // and is compressed in the following tree

  //   const receiver = payer.publicKey; // you can define any pubkey as the receiver here

  //   const [treeAuthority, _bump2] =
  //     anchor.web3.PublicKey.findProgramAddressSync(
  //       [tree.toBuffer()],
  //       BUBBLEGUM_PROGRAM_ID
  //     );

  //   const asset = await wrapperConnection.getAsset(new anchor.web3.PublicKey(assetId));

  //   const proof = await wrapperConnection.getAssetProof(new anchor.web3.PublicKey(assetId));
  //   const proofPathAsAccounts = mapProof(proof);

  //   const root = decode(proof.root);
  //   const dataHash = decode(asset.compression.data_hash);
  //   const creatorHash = decode(asset.compression.creator_hash);
  //   const nonce = new anchor.BN(asset.compression.leaf_id);
  //   const index = asset.compression.leaf_id;

  //   const sx = await program.methods
  //     .withdrawCnft(root, dataHash, creatorHash, nonce, index)
  //     .accounts({
  //       leafOwner: vaultPDA,
  //       merkleTree: tree,
  //       newLeafOwner: receiver,
  //       treeAuthority: treeAuthority,
  //       bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
  //       compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  //       logWrapper: SPL_NOOP_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .remainingAccounts(proofPathAsAccounts)
  //     .rpc();

  //   console.log("Success!");
  //   console.log(`   Tx Signature: ${sx}`);
  // });

  // it("Withdraw two cNFTs!", async () => {
  //   // TODO change all of these to your values
  //   const assetId1 = "DGWU3mHenDerCvjkeDsKYEbsvXbWvqdo1bVoXy3dkeTd";
  //   const assetId2 = "14JojSTdBZvP7f77rCxB3oQK78skTVD6DiXrXUL4objg";

  //   const tree1 = new anchor.web3.PublicKey(
  //     "trezdkTFPKyj4gE9LAJYPpxn8AYVCvM7Mc4JkTb9X5B"
  //   );
  //   const tree2 = new anchor.web3.PublicKey(
  //     "Feywkti8LLBLfxhSGmYgzUBqpq89qehfB1SMTYV1zCu"
  //   );

  //   const receiver1 = new anchor.web3.PublicKey(
  //     "Andys9wuoMdUeRiZLgRS5aJwYNFv4Ut6qQi8PNDTAPEM"
  //   );
  //   const receiver2 = new anchor.web3.PublicKey(
  //     "Andys9wuoMdUeRiZLgRS5aJwYNFv4Ut6qQi8PNDTAPEM"
  //   );
  //   // ---

  //   const [treeAuthority1, _bump2] =
  //     anchor.web3.PublicKey.findProgramAddressSync(
  //       [tree1.toBuffer()],
  //       BUBBLEGUM_PROGRAM_ID
  //     );
  //   const [treeAuthority2, _bump3] =
  //     anchor.web3.PublicKey.findProgramAddressSync(
  //       [tree2.toBuffer()],
  //       BUBBLEGUM_PROGRAM_ID
  //     );

  //   const asset1 = await getAsset(assetId1);
  //   const asset2 = await getAsset(assetId2);

  //   const proof1 = await getAssetProof(assetId1);
  //   const proofPathAsAccounts1 = mapProof(proof1);
  //   const proof2 = await getAssetProof(assetId2);
  //   const proofPathAsAccounts2 = mapProof(proof2);

  //   const ixData1 = getInstructionData(asset1, proof1);
  //   const ixData2 = getInstructionData(asset2, proof2);

  //   const remainingAccounts: AccountMeta[] = [
  //     ...proofPathAsAccounts1,
  //     ...proofPathAsAccounts2,
  //   ];

  //   const sx = await program.methods
  //     .withdrawTwoCnfts(...ixData1, ...ixData2)
  //     .accounts({
  //       leafOwner: vaultPDA,
  //       merkleTree1: tree1,
  //       newLeafOwner1: receiver1,
  //       treeAuthority1: treeAuthority1,
  //       merkleTree2: tree2,
  //       newLeafOwner2: receiver2,
  //       treeAuthority2: treeAuthority2,
  //       bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
  //       compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  //       logWrapper: SPL_NOOP_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .remainingAccounts(remainingAccounts)
  //     .rpc();
  //   console.log("Success!");
  //   console.log(`   Tx Signature: ${sx}`);
  // });
});

function getInstructionData(
  asset: any,
  proof: any
): [number[], number[], number[], anchor.BN, number, number] {
  const root = decode(proof.root);
  const dataHash = decode(asset.compression.data_hash);
  const creatorHash = decode(asset.compression.creator_hash);
  const nonce = new anchor.BN(asset.compression.leaf_id);
  const index = asset.compression.leaf_id;
  const proofLength = proof.proof.length;
  return [root, dataHash, creatorHash, nonce, index, proofLength];
}
