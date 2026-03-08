predicate;

use std::block;

/// Reference-only predicate for MVP demos.
/// Inputs are passed explicitly by the caller to keep logic minimal and auditable.
fn main(
    provided_expiry: u64,
    provided_max_spend: u64,
    provided_allowed_contract: b256,
    requested_contract: b256,
    requested_amount: u64,
) -> bool {
    // 1) Expiry check
    if block::timestamp() > provided_expiry {
        return false;
    }

    // 2) Allowed contract target check
    if requested_contract != provided_allowed_contract {
        return false;
    }

    // 3) Max spend check for single call
    if requested_amount > provided_max_spend {
        return false;
    }

    true
}
