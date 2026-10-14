// My Account (WooCommerce page 8), v3 (2026-10-03). The page itself is just a heading + the WooCommerce shortcode: no page root,
// so v3.css's theme/WooCommerce layer styles it, and chrome/k1-account.css adds the account frame (menu column, tables, forms)
// plus the $1K member area (.k1a.k1v3, printed by the WPCode "My $1k Plan Snippet" from automation/k1-launch).
// Replaces the old pageStyle({woo:true}) prelude (shared.css + the .scx marker that kept v3 off this page).
// Never rebuild this page with legacy.mjs (stale 2026-09-21 baseline).
export const id = 8;
export const title = 'My Account';

// Kept from the old page's accessibility block: reduced motion + Windows high-contrast focus. Its amber #f59e0b focus ring
// (2.2:1, accessibility.md) is dropped: v3.css gives every control a 3px #111 outline.
const A11Y = '@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}}@media(forced-colors:active){a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid Highlight!important}}';

export function build() {
  return `<!-- wp:html -->\n<style id="k1-acct-a11y">${A11Y}</style>\n<!-- /wp:html -->
<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">My Account</h1><!-- /wp:heading -->
<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->`;
}
