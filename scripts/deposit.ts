import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vaultana } from "../target/types/vaultana";
import { PublicKey } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "bn.js";

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Vaultana as Program<Vaultana>;

    const args = process.argv.slice(2);
    const mintAddress = new PublicKey(args[0]);
    const amount = new BN(args[1]);

    console.log("Mint:", mintAddress.toBase58());
    console.log("Amount:", amount.toString());

    const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("state"), provider.publicKey.toBuffer(), mintAddress.toBuffer()],
        program.programId
    );

    const vaultAta = await getAssociatedTokenAddress(mintAddress, statePda, true);
    const userAta = await getAssociatedTokenAddress(mintAddress, provider.publicKey);

    console.log("Depositing...");
    try {
        const tx = await program.methods
            .deposit(amount)
            .accounts({
                user: provider.publicKey,
                userTokenAccount: userAta,
                vault: vaultAta,
                state: statePda,
            } as any)
            .rpc();
        console.log("Deposit successful! Tx:", tx);
    } catch (e) {
        console.error("Error depositing:", e);
    }
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);
