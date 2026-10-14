// Read-only snapshot of the live checkout setup the $1K checkout redesign depends on (GET requests only).
import { wp } from './wp-client.mjs';

const opt = async (group, id) => (await wp(`/wp-json/wc/v3/settings/${group}/${id}`)).json?.value;
const out = {};
out.checkout_page_id = await opt('advanced', 'woocommerce_checkout_page_id');
out.terms_page_id = await opt('advanced', 'woocommerce_terms_page_id');
out.guest_checkout = await opt('account', 'woocommerce_enable_guest_checkout');
out.signup_at_checkout = await opt('account', 'woocommerce_enable_signup_and_login_from_checkout');
out.generate_password = await opt('account', 'woocommerce_registration_generate_password');
out.ship_to_countries = await opt('general', 'woocommerce_ship_to_countries');
out.specific_ship_to = await opt('general', 'woocommerce_specific_ship_to_countries');
out.ship_to_destination = await opt('shipping', 'woocommerce_ship_to_destination');
const page = (await wp(`/wp-json/wp/v2/pages/${out.checkout_page_id}?context=edit`)).json;
out.checkout_page = { slug: page.slug, template: page.template, content: page.content?.raw };
for (const id of [279, 280]) {
  const p = (await wp(`/wp-json/wc/v3/products/${id}`)).json;
  out['p' + id] = { name: p.name, status: p.status, type: p.type, price: p.price, virtual: p.virtual, downloadable: p.downloadable, shipping_class: p.shipping_class, catalog_visibility: p.catalog_visibility, attributes: p.attributes?.map((a) => [a.name, a.options]) };
}
for (const id of [582, 583]) {
  const v = (await wp(`/wp-json/wc/v3/products/279/variations/${id}`)).json;
  out['v' + id] = { price: v.price, status: v.status, virtual: v.virtual, downloadable: v.downloadable, shipping_class: v.shipping_class, attributes: v.attributes, downloads: v.downloads?.map((d) => d.name) };
}
const gws = (await wp('/wp-json/wc/v3/payment_gateways')).json;
out.gateways = gws.filter((g) => g.enabled).map((g) => ({ id: g.id, title: g.title, testmode: g.settings?.testmode?.value }));
const zones = (await wp('/wp-json/wc/v3/shipping/zones')).json;
out.zones = [];
for (const z of zones) {
  const m = (await wp(`/wp-json/wc/v3/shipping/zones/${z.id}/methods`)).json;
  out.zones.push({ id: z.id, name: z.name, methods: m.map((x) => [x.method_id, x.title, x.enabled]) });
}
const sys = (await wp('/wp-json/wc/v3/system_status')).json;
out.wc_version = sys.environment?.version;
out.wp_version = sys.environment?.wp_version;
out.theme = sys.theme?.name;
out.plugins = sys.active_plugins?.map((p) => `${p.name} ${p.version}`);
console.log(JSON.stringify(out, null, 1));
