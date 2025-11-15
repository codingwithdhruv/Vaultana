import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vaultana } from "../target/types/vaultana";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("vaultana", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  console.log("Wallet public key:", provider.wallet.publicKey.toBase58());

  const program = anchor.workspace.vaultana as Program<Vaultana>;

  const vaultState = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("state"), provider.publicKey.toBuffer()], program.programId)[0];
  
  const vault = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), vaultState.toBytes()], program.programId)[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
    .initialize(new anchor.BN(2 * anchor.web3.LAMPORTS_PER_SOL))
    .accounts({
      user: provider.publicKey,
      state: vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,

    })

    .rpc();
    console.log("Your transaction signature", tx);
  });
});


// user cant deposit less than 1 sol per trx
// user cant withdraw more than 2 sol per trx