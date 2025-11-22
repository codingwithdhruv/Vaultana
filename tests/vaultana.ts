import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vaultana } from "../target/types/vaultana";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("vaultana - token vault tests", function () {
  // this.timeout(120_000);

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = provider.wallet.payer as Keypair;
  const program = anchor.workspace.Vaultana as Program<Vaultana>;

  let mintPubkey: PublicKey;
  let userAta: PublicKey;
  let statePda: PublicKey;
  let stateBump: number;
  let vaultAta: PublicKey;

  const DECIMALS = 6;
  const ONE = Math.pow(10, DECIMALS);

  before(async () => {
    mintPubkey = await createMint(
      connection, 
      payer, 
      payer.publicKey, 
      null, 
      DECIMALS
    );
    console.log("mint:", mintPubkey.toBase58());

    const userAtaAcct = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintPubkey,
      provider.publicKey
    );
    userAta = userAtaAcct.address;
    console.log("user ATA:", userAta.toBase58());

    await mintTo(
      connection, 
      payer, 
      mintPubkey, 
      userAta, 
      payer, 
      10 * ONE);
      
    const userAcc = await getAccount(connection, userAta);
    assert.equal(Number(userAcc.amount), 10 * ONE, "minting to user ATA failed");

    [statePda, stateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), provider.publicKey.toBuffer(), mintPubkey.toBuffer()],
      program.programId
    );

    vaultAta = await getAssociatedTokenAddress(mintPubkey, statePda, true);
    console.log("statePda:", statePda.toBase58(), "vault ATA:", vaultAta.toBase58());
  });

  it("initialize: create state PDA and vault ATA", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        user: provider.publicKey,
        mint: mintPubkey,
        state: statePda,
        vault: vaultAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    console.log("initialize tx:", tx);

    const stateAcct = await program.account.vaultState.fetch(statePda);
    assert.ok(stateAcct.mint.equals(mintPubkey), "state.mint must equal created mint");
    assert.ok(Number(stateAcct.amount) === 0, "state.amount should be initialized to 0");
    assert.ok(stateAcct.stateBump === stateBump, "stored bump must match derived bump");

    const vaultAcc = await getAccount(connection, vaultAta);
    assert.ok(vaultAcc.mint.equals(mintPubkey), "vault ATA mint mismatch");
    assert.ok(Number(vaultAcc.amount) === 0, "vault ATA should have 0 tokens at init");
  });
})
 