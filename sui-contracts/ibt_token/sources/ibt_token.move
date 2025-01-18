module ibt_token::ibt_token {
    use sui::coin;

    // One-time witness type for the IBT token
    public struct IBT_TOKEN has drop {}

    // IBT token type
    public struct IBT has drop {}

    // Initialize the IBT token
    fun init(witness: IBT_TOKEN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency<IBT_TOKEN>(
            witness, // One-time witness
            18, // Decimals
            b"IBT", // Symbol
            b"Inter-Blockchain Token", // Name
            b"", // Description
            option::none(), // Icon URL (optional)
            ctx // Transaction context
        );
        transfer::public_transfer(treasury, tx_context::sender(ctx));
        transfer::public_transfer(metadata, tx_context::sender(ctx)); // Transfer metadata to the deployer
    }

    // Mint new IBT tokens
    public entry fun mint(
        treasury_cap: &mut coin::TreasuryCap<IBT>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coins = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coins, recipient);
    }

    // Burn IBT tokens
    public entry fun burn(
        treasury_cap: &mut coin::TreasuryCap<IBT>,
        coins: coin::Coin<IBT>,
        _ctx: &mut TxContext // Prefix with underscore to suppress unused variable warning
    ) {
        coin::burn(treasury_cap, coins);
    }
}