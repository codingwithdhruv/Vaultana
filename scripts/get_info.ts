import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

async function main() {
    // Fallback to devnet if not specified
    process.env.ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com";
    process.env.ANCHOR_WALLET = process.env.ANCHOR_WALLET || process.env.HOME + "/.config/solana/id.json";
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const programId = new PublicKey("AZWo7inNyu6C2azLZJ599ffTWSJYRkkx5aJSV2quh1tU");

    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Please provide mint address");
        return;
    }
    const mintAddress = new PublicKey(args[0]);

    const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("state"), provider.publicKey.toBuffer(), mintAddress.toBuffer()],
        programId
    );

    const vaultAta = await getAssociatedTokenAddress(mintAddress, statePda, true);
    const userAta = await getAssociatedTokenAddress(mintAddress, provider.publicKey);

    console.log("Wallet Address:", provider.publicKey.toBase58());
    console.log("Mint Address:", mintAddress.toBase58());
    console.log("State PDA:", statePda.toBase58());
    console.log("Vault ATA:", vaultAta.toBase58());
    console.log("User ATA:", userAta.toBase58());
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);
