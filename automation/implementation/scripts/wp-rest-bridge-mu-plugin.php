<?php
/**
 * Plugin Name: Scrolly REST Bridge
 * Description: Exposes the specific postmeta fields the Scrolly
 *              Implementation Agent reads and writes via the WordPress REST
 *              API (Yoast/Rank Math SEO fields, plus Elementor's edit-mode
 *              flag for page-builder detection — read-only in practice, we
 *              never write it). Does not expose anything else. Install as a
 *              single mu-plugin file (wp-content/mu-plugins/) on any
 *              customer site before running the Implementation Agent
 *              against it — see methodology/implementation-agent.md §10.
 *
 * Why this exists: WordPress core does not auto-expose postmeta via REST,
 * and none of these plugins register their own meta for REST access by
 * default. This turns that on for exactly these keys, gated behind the same
 * capability (edit_posts) an Application Password auth'd user already needs
 * to write anything else here.
 */

add_action('init', function () {
    $keys = [
        '_yoast_wpseo_title',
        '_yoast_wpseo_metadesc',
        'rank_math_title',
        'rank_math_description',
        '_elementor_edit_mode', // page-builder detection (implementation-agent.md §13) — value is 'builder' when Elementor authored this page's content
    ];

    foreach (['post', 'page', 'product'] as $post_type) {
        foreach ($keys as $key) {
            register_post_meta($post_type, $key, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => 'string',
                'auth_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ]);
        }
    }

    // Product/product_cat category-level SEO fields (Yoast/Rank Math both
    // also store term-level title/description under the same meta keys).
    foreach (['product_cat', 'category'] as $taxonomy) {
        foreach ($keys as $key) {
            register_term_meta($taxonomy, $key, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => 'string',
                'auth_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ]);
        }
    }
});
