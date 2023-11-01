import { getLeafAssetId } from "@metaplex-foundation/mpl-bubblegum";
import { WrapperConnection } from "./utils/WrapperConnection";
import { getAllChangeLogEventV1FromTransaction } from "./utils/compression";
import { BN } from "bn.js";


(async () => {
  const connection = new WrapperConnection("http://127.0.0.1:8899")
  // const txData = await connection.getTransaction("4XSPB8GE1ovvGeQFgjybw3aqEHJDvt5P6YSrCuyBEsGXd8GZ2xg3b5qqQVSGFe5xrPtNbis42ifFWQqZzXPaLWKV", {
  //   maxSupportedTransactionVersion: 0,
  // });
  // console.log("txData", txData);
  // if (txData) {
  //   const events = getAllChangeLogEventV1FromTransaction(txData);
  //   console.log(events);
  //   // compute the assetId of the compressed nft just minted
  //   const assetId = await getLeafAssetId(events[0].treeId, new BN(events[0].index));
  //   console.log(assetId);
  // }
})()