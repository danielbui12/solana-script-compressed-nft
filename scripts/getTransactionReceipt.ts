import dotenv from "dotenv";
import { WrapperConnection } from '../ReadApi/WrapperConnection';
import { PublicKey } from "@metaplex-foundation/js";
dotenv.config();


const validateBurnTransaction = (
    transaction: any,
    expectedNFTOwnerPublicKey: any,
  ) => {
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Check if the transaction was successful
  if (transaction.meta.err !== null) {
    throw new Error('Transaction failed');
  }

  // Extract the instructions from the transaction
  const instructions = transaction.transaction.message.instructions;

  // Iterate through instructions to find the burn instruction
  for (const instruction of instructions) {
    // Check if the instruction targets the expected NFT owner's public key
    if (instruction.programId.equals(new PublicKey(expectedNFTOwnerPublicKey))) {
      console.log('Burn instruction found');
      return;
    }
  }

  throw new Error('No burn instruction found in the transaction');
};

const wrappedConnection = new WrapperConnection(process.env.RPC_URL as string, 'confirmed');
wrappedConnection.getParsedTransaction("9KFTkxtoHx9B9v9gXNZa2zcwFtid3r1gsBANzyW8j53enJbKxCdsotwn7XvfK6S4WYUX4AuDdCxASjDMfSKy2bw")
  .then((res) => {
    validateBurnTransaction(res, '7fbPDP3jAbkEVf7QAAxhBKHcbfLPttPkyXJNNkv62Xvd')
  })
