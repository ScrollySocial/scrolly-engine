#!/bin/sh
# Provisions the disposable dev WordPress+WooCommerce site: install core,
# WooCommerce, Yoast, pretty permalinks (required — our REST client uses
# /wp-json/ path routing, which only works with pretty permalinks on),
# an Application Password, and minimum sample data for each Checkpoint-1
# field type. Idempotent-ish: safe to re-run against a fresh volume.
set -e
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*"
WP="docker compose exec -T wpcli wp --path=/var/www/html --allow-root"

echo "== core install =="
$WP core install \
  --url="http://localhost:8890" \
  --title="Scrolly Impl Agent Dev Test" \
  --admin_user=admin \
  --admin_password=devpassword123 \
  --admin_email=dev@example.test \
  --skip-email

echo "== pretty permalinks (required for /wp-json/ routing) =="
$WP rewrite structure '/%postname%/' --hard
$WP rewrite flush --hard

echo "== plugins =="
$WP plugin install woocommerce --activate
$WP plugin install wordpress-seo --activate

echo "== application password =="
$WP user application-password create admin scrolly-implementation-agent --porcelain > /tmp/app-password.txt || \
$WP eval '
$user = get_user_by("login", "admin");
$created = WP_Application_Passwords::create_new_application_password($user->ID, ["name" => "scrolly-implementation-agent"]);
echo $created[0];
' > /tmp/app-password.txt
docker compose exec -T wpcli cat /tmp/app-password.txt

echo "== sample content: page =="
PAGE_ID=$($WP post create --post_type=page --post_title="About Mulberry Creek Test" --post_status=publish --porcelain)
echo "page id: $PAGE_ID"

echo "== sample content: media (real image, placeholder alt text) =="
MEDIA_ID=$($WP media import /fixtures/test-photo.png --title="Test Photo" --alt="Placeholder image for ABOUT" --porcelain)
echo "media id: $MEDIA_ID"

echo "== sample content: WooCommerce product =="
PRODUCT_ID=$($WP wc product create --name="Test Nursery Product" --regular_price=19.99 --description="" --short_description="" --user=admin --porcelain 2>/dev/null || echo "")
echo "product id: $PRODUCT_ID"

echo "== sample content: WooCommerce category =="
CAT_ID=$($WP wc product_cat create --name="Test Category" --description="" --user=admin --porcelain 2>/dev/null || echo "")
echo "category id: $CAT_ID"

echo "== DONE =="
echo "page_id=$PAGE_ID media_id=$MEDIA_ID product_id=$PRODUCT_ID category_id=$CAT_ID"
