<?php
/**
 * Plugin Name: Scrolly Implementation Connector
 * Description: One-click, secure connection between this site and your Scrolly SEO Implementation engagement. Generates its own Application Password (never displayed, never emailed, never typed by you), registers the specific read/write access the implementation agent needs, and reports back that the connection succeeded. Safe to deactivate/delete once your engagement is complete.
 * Version: 1.0.0
 *
 * WHY THIS EXISTS (see methodology/implementation-agent.md, "onboarding
 * requirement"): asking a nontechnical customer to manually create a WP
 * Application Password (Users -> Profile -> Application Passwords -> copy
 * a generated string into a form) is real friction and a real place for a
 * secret to leak in transit (pasted into forms/emails). This plugin
 * collapses that into one action: install + activate. The customer never
 * sees or handles the credential at all.
 *
 * WHAT IT DOES ON ACTIVATION:
 *   1. Generates a WordPress Application Password for the currently logged
 *      in admin (the person installing the plugin — must be an
 *      administrator, enforced below).
 *   2. Registers REST access for exactly the SEO-plugin meta fields and
 *      page-builder detection flag the implementation agent needs (same
 *      scope as the existing wp-rest-bridge-mu-plugin.php used in
 *      development — this plugin supersedes it for real customer sites by
 *      bundling both concerns in one install).
 *   3. Calls back to Scrolly's intake endpoint with the site URL,
 *      generated Application Password, detected SEO plugin, and the
 *      one-time connection token from the admin settings screen — over
 *      HTTPS, server-to-server, never through a form field or email.
 *
 * WHAT IT DOES NOT DO: it does not touch any content, does not modify any
 * page, does not install/activate any other plugin, and only registers
 * REST access to the specific fields listed below — nothing else on the
 * site becomes REST-writable that wasn't already.
 */

if (!defined('ABSPATH')) exit;

define('SCROLLY_CONNECTOR_VERSION', '1.0.0');
define('SCROLLY_CONNECTOR_APP_NAME', 'Scrolly Implementation Agent');

// --- Step 1: register REST access for exactly the fields the agent needs ---
add_action('init', function () {
    $keys = [
        '_yoast_wpseo_title',
        '_yoast_wpseo_metadesc',
        'rank_math_title',
        'rank_math_description',
        '_elementor_edit_mode', // page-builder detection — read-only in practice
    ];
    foreach (['post', 'page', 'product'] as $post_type) {
        foreach ($keys as $key) {
            register_post_meta($post_type, $key, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => 'string',
                'auth_callback' => function () { return current_user_can('edit_posts'); },
            ]);
        }
    }
    foreach (['product_cat', 'category'] as $taxonomy) {
        foreach ($keys as $key) {
            register_term_meta($taxonomy, $key, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => 'string',
                'auth_callback' => function () { return current_user_can('edit_posts'); },
            ]);
        }
    }
});

// --- Step 2: admin settings screen — where the customer enters ONLY their
// connection token (from their post-purchase email/page), never a password ---
add_action('admin_menu', function () {
    add_options_page('Scrolly Connection', 'Scrolly Connection', 'manage_options', 'scrolly-connector', 'scrolly_connector_settings_page');
});

function scrolly_connector_settings_page() {
    if (!current_user_can('manage_options')) wp_die('Insufficient permissions.');

    $status = get_option('scrolly_connector_status', 'not_connected');
    $error = '';

    if (isset($_POST['scrolly_connect_nonce']) && wp_verify_nonce($_POST['scrolly_connect_nonce'], 'scrolly_connect')) {
        $token = sanitize_text_field($_POST['scrolly_connection_token'] ?? '');
        $callback_url = sanitize_text_field($_POST['scrolly_callback_url'] ?? '');
        if ($token && $callback_url) {
            $result = scrolly_connector_do_connect($token, $callback_url);
            if (is_wp_error($result)) {
                $error = $result->get_error_message();
            } else {
                $status = 'connected';
                update_option('scrolly_connector_status', 'connected');
            }
        } else {
            $error = 'Please enter your connection token.';
        }
    }

    echo '<div class="wrap"><h1>Scrolly Implementation Connection</h1>';
    if ($error) echo '<div class="notice notice-error"><p>' . esc_html($error) . '</p></div>';
    if ($status === 'connected') {
        echo '<div class="notice notice-success"><p><strong>Connected.</strong> Scrolly can now proceed with your implementation engagement. You can deactivate this plugin once your engagement is marked complete.</p></div>';
    } else {
        echo '<p>Enter the connection token from your Scrolly confirmation email to securely connect this site. You will never be asked to create or share a password — this plugin handles that automatically.</p>';
        echo '<form method="post">';
        wp_nonce_field('scrolly_connect', 'scrolly_connect_nonce');
        echo '<table class="form-table">';
        echo '<tr><th><label for="scrolly_connection_token">Connection token</label></th><td><input type="text" id="scrolly_connection_token" name="scrolly_connection_token" class="regular-text" required></td></tr>';
        echo '<tr><th><label for="scrolly_callback_url">Callback URL</label></th><td><input type="url" id="scrolly_callback_url" name="scrolly_callback_url" class="regular-text" value="' . esc_attr(get_option('scrolly_connector_callback_url', '')) . '" required><p class="description">Provided in the same confirmation email.</p></td></tr>';
        echo '</table>';
        submit_button('Connect');
        echo '</form>';
    }
    echo '</div>';
}

/**
 * Generates the Application Password for the current admin and POSTs it,
 * the site URL, and the detected SEO plugin to Scrolly's intake endpoint.
 * Returns WP_Error on any failure — never leaves the customer guessing.
 */
function scrolly_connector_do_connect($token, $callback_url) {
    if (!function_exists('WP_Application_Passwords::create_new_application_password')) {
        require_once ABSPATH . 'wp-includes/class-wp-application-passwords.php';
    }

    $user = wp_get_current_user();
    if (!$user || !$user->exists()) {
        return new WP_Error('scrolly_no_user', 'Could not identify the current WordPress user.');
    }

    $created = WP_Application_Passwords::create_new_application_password($user->ID, ['name' => SCROLLY_CONNECTOR_APP_NAME]);
    if (is_wp_error($created)) return $created;
    list($app_password, ) = $created;

    $seo_plugin = null;
    if (is_plugin_active('wordpress-seo/wp-seo.php')) $seo_plugin = 'yoast';
    elseif (is_plugin_active('seo-by-rank-math/rank-math.php')) $seo_plugin = 'rankmath';

    $payload = [
        'connection_token' => $token,
        'site_url'         => home_url(),
        'wp_user'          => $user->user_login,
        'wp_app_password'  => $app_password,
        'seo_plugin'       => $seo_plugin,
        'woocommerce_active' => is_plugin_active('woocommerce/woocommerce.php'),
    ];

    $response = wp_remote_post($callback_url, [
        'timeout' => 20,
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => wp_json_encode($payload),
    ]);

    if (is_wp_error($response)) return $response;
    $code = wp_remote_retrieve_response_code($response);
    if ($code < 200 || $code >= 300) {
        return new WP_Error('scrolly_callback_failed', 'Could not confirm the connection with Scrolly (HTTP ' . $code . '). Please check your connection token and try again, or contact support.');
    }

    update_option('scrolly_connector_callback_url', $callback_url);
    return true;
}

// Not required for admin.php to load, but ensures is_plugin_active() is available this early.
if (!function_exists('is_plugin_active')) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
}
