import dotenv from "dotenv";
import { WrapperConnection } from '../ReadApi/WrapperConnection';
dotenv.config();

const wrappedConnection = new WrapperConnection(process.env.RPC_URL as string, 'confirmed');
wrappedConnection.getParsedTransaction("53wZLfGptKanot4yLGvcWQLRxS3JLFTccoozGzSEG1XVgtE1rNW7RLnRAQsuepxtwQFviLxZ479ZBNi2vXvkqodU")
  .then((res) => {
    console.log(JSON.stringify(res))
  })