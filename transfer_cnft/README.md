# Solana Program cNFT Transfer example

This repo contains example code of how you can work with Metaplex compressed NFTs inside of Solana Anchor programs.

The basic idea is to allow for transfering cNFTs that are owned by a PDA account. So our program will have a vault (this PDA) that you can send cNFTs to manually and then withdraw them using the program instructions.

There are two instructions: one simple transfer that can withdraw one cNFT, and one instructions that can withdraw two cNFTs at the same time.

This program can be used as an inspiration on how to work with cNFTs in Solana programs.

## Components

The Anchor program can be found in the *programs* folder and *tests* some client-side tests. There are also some typescript node scripts in *tests/scripts* to run them individually (plus there is one called *withdrawWithLookup.ts* which demonstrates the use of the program with account lookup tables). 

## Deployment

The program is deployed on devnet at `4grkXgo3Y4wBv5gFT4b9rhhhDaFsTPUqB92a2JAgHgkW`. 
You can deploy it yourself by changing the respective values in lib.rs and Anchor.toml.

## Limitations

This is just an example implementation. It is missing all logic whether a transfer should be performed or not (everyone can withdraw any cNFT in the vault). 
Furthermore it is not optimized for using lowest possible compute. It is intended as a proof of concept and reference implementation only. 

## Requirement

- solana-cli 1.16.0 
- anchor-cli 0.29.0
- rustc 1.73.0