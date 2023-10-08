import dotenv from "dotenv";
import { WrapperConnection } from '../ReadApi/WrapperConnection';
dotenv.config();

const wrappedConnection = new WrapperConnection(process.env.RPC_URL as string, 'confirmed');
wrappedConnection.getParsedTransaction("9KFTkxtoHx9B9v9gXNZa2zcwFtid3r1gsBANzyW8j53enJbKxCdsotwn7XvfK6S4WYUX4AuDdCxASjDMfSKy2bw")
  .then((res) => {
    console.log(JSON.stringify(res))
  })