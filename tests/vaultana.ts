import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vaultana } from "../target/types/vaultana";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("vaultana", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

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

it("rejects deposits < 1sol", async () => {
  try {
    await program.methods
    .deposit(new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL))
    .accounts({
      user: provider.publicKey,
      state: vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
    assert.fail("Should have failed because deposit < 1sol")
  } catch (err) {

  }
});

it("accepts deposits >= 1sol", async () => {
  const tx = await program.methods
  .deposit(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL))
  .accounts({
    user: provider.publicKey,
    state: vaultState,
    vault,
    systemProgram: anchor.web3.SystemProgram.programId
  })
  .rpc();
  assert.ok(tx);
})


});



// user cant deposit less than 1 sol per trx
// user cant withdraw more than 2 sol per trx


// Challenges:
// Check that the withdraw leaves the vault with a rent-exempt balance
// Check the account has enough funds for the user to withdraw
// Implement a context to close the account
// Tip: Look for a close contraint
// Don't forget to manually close the vault account (how do you do that? In doubt ask Ayodeji)
// Don't the withdraw and deposit context have the same accounts? Can't we just use the same context in different instructions?