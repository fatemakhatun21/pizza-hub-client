/**
 * Premium badges use several server field names:
 * - /api/me returns `isPremium` and effective `plan`.
 * - public menu items return vendor-provided `vendorIsPremium`/`vendorPlan`.
 *
 * Keep the display decision in one place so all surfaces agree.
 */
export function isPremiumAccount(account) {
    if (!account) return false;

    return (
        account.isPremium === true ||
        account.vendorIsPremium === true ||
        account.plan === "premium" ||
        account.vendorPlan === "premium"
    );
}
