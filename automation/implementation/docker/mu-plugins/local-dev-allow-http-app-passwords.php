<?php
/**
 * Plugin Name: Local Dev — Allow Application Passwords over HTTP
 * Description: DEV-ONLY. WordPress core disables Application Passwords by
 *              default unless the site is served over HTTPS
 *              (wp_is_application_passwords_available() checks is_ssl()).
 *              Confirmed via direct wp-cli eval on this disposable Docker
 *              site: it returned NOT_AVAILABLE, and every real customer
 *              site is expected to be real HTTPS already, so this override
 *              belongs only in this throwaway dev environment, never on a
 *              real site.
 */
add_filter('wp_is_application_passwords_available', '__return_true');
