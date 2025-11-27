import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vaultana } from "../target/types/vaultana";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Vaultana as Program<Vaultana>;

    const args = process.argv.slice(2);
    const mintAddress = new PublicKey(args[0]);
    console.log("Mint:", mintAddress.toBase58());

    const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("state"), provider.publicKey.toBuffer(), mintAddress.toBuffer()],
        program.programId
    );

    const vaultAta = await getAssociatedTokenAddress(mintAddress, statePda, true);

    console.log("State PDA:", statePda.toBase58());
    console.log("Vault ATA:", vaultAta.toBase58());

    const stateAccount = await program.account.vaultState.fetchNullable(statePda);

    if (stateAccount) {
        console.log("Vault already initialized.");
        return;
    }

    console.log("Initializing Vault");
    try {
        const tx = await program.methods
            .initialize()
            .accounts({
                user: provider.publicKey,
                mint: mintAddress,
            })
            .rpc();
        console.log("Initialized. Tx:", tx);
    } catch (e) {
        console.error("Error initializing:", e);
    }
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);
