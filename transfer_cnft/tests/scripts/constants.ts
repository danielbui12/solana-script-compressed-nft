import * as anchor from "@coral-xyz/anchor";
import { CnftVault } from "../../target/types/cnft_vault";
import { loadWalletKey } from "../../utils/utils";
import { IDL } from "../../target/types/cnft_vault";
import { WrapperConnection } from "../../utils/WrapperConnection";
require('dotenv').config();

export const connection = new WrapperConnection(
  "http://127.0.0.1:8899"
);
export const keypair = loadWalletKey(process.env.KEYPAIR_PATH);
export const wallet = new anchor.Wallet(keypair);
export const provider = new anchor.AnchorProvider(connection, wallet, {});
export const programID = new anchor.web3.PublicKey(
  "4grkXgo3Y4wBv5gFT4b9rhhhDaFsTPUqB92a2JAgHgkW"
);
export const program = new anchor.Program<CnftVault>(IDL, programID, provider);
