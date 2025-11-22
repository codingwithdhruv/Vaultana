use anchor_lang::{prelude::*};
use anchor_spl::token::{self, Token, TokenAccount, Transfer as TokenTransfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("8b1gGyfBb45nA8nsWDmsHLXMTtcb3yds4GGqhzojQXtv");

#[program]
pub mod vaultana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)?;
        Ok(())
    }

    pub fn deposit(ctx: Context<Operations>, amount: u64) -> Result<()> {
        ctx.accounts.deposit_token(amount)?;
        Ok(())
    }

    pub fn withdrawal(ctx: Context<Operations>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw_token(amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        seeds = [b"state".as_ref(), user.key().as_ref(), mint.key().as_ref()],
        bump,
        space = VaultState::INIT_SPACE
    )]
    pub state: Account<'info, VaultState>,

    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = state,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()> {
        self.state.mint = self.mint.key();
        self.state.state_bump = bumps.state;
        self.state.amount = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Operations<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_token_account.mint == state.mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault.mint == state.mint
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"state".as_ref(), user.key().as_ref(), state.mint.as_ref()],
        bump = state.state_bump,
    )]
    pub state: Account<'info, VaultState>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Operations<'info> {
    pub fn deposit_token(&mut self, amount: u64) -> Result<()> {

        let cpi_accounts = TokenTransfer {
            from: self.user_token_account.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.user.to_account_info()
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        self.state.amount = self.state.amount.checked_add(amount).unwrap();

        Ok(())
    }

    pub fn withdraw_token(&mut self, amount: u64) -> Result<()> {
        
        let cpi_accounts = TokenTransfer {
            from: self.vault.to_account_info(),
            to: self.user_token_account.to_account_info(),
            authority: self.state.to_account_info(),
        };

        let seeds = &[
            b"state".as_ref(),
            self.user.to_account_info().key.as_ref(),
            self.state.mint.as_ref(),
            &[self.state.state_bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(), 
            cpi_accounts, 
            signer_seeds
        );
        require!(self.state.amount >= amount, CustomError::InsufficientFunds);
        token::transfer(cpi_ctx, amount)?;
        self.state.amount = self.state.amount.checked_sub(amount).unwrap();
        Ok(())
    }
}



#[account]
pub struct VaultState{
    pub state_bump: u8,
    pub mint: Pubkey,
    pub amount: u64,
}

impl VaultState {
    const INIT_SPACE: usize = 8 + 1 + 32 + 8; //discriminator +  statebump + mint pubkey + amount u64
}

#[error_code]
pub enum CustomError {
    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Overflow error")]
    Overflow,

    #[msg("Underflow error")]
    Underflow,

}