add_action('woocommerce_email_header', function( $email_heading, $email ) {
    if ( is_a( $email, 'WC_Email' ) && $email->id === 'customer_processing_order' && scrolly_order_has_seo_audit( $email->object ) ) {
        ob_start();
    }
}, 15, 2);

add_action('woocommerce_email_order_details', function( $order, $sent_to_admin, $plain_text, $email ) {
    if ( is_a( $email, 'WC_Email' ) && $email->id === 'customer_processing_order' && scrolly_order_has_seo_audit( $order ) ) {
        $buffered = ob_get_clean();

        // Remove the two default lines, keep the "Hi John," greeting.
        $buffered = preg_replace('/<p>[^<]*now being processed[^<]*<\/p>\s*/i', '', $buffered);
        $buffered = preg_replace('/<p>[^<]*reminder of what you[^<]*<\/p>\s*/i', '', $buffered);

        echo $buffered;

        $message = "Thanks for choosing The Ambition Department to help you grow your business!\n\nWe are excited to help you.\n\nUpon receiving your completed Tally form, our Site Audits take up to two business days to complete. You should receive it via email within two business days. That being said, we are often able to complete them earlier, and in that case will send it as soon as it is completed and reviewed.\n\nPlease note: We are unable to start the audit until you complete and submit the requested intake form.\n\nIf you need any help with your order, you can reach us at hello@theambitiondepartment.com\n\nWe look forward to helping you,\nThe Ambition Department team.";
        echo '<div style="margin:0 0 16px;">' . wp_kses_post( wpautop( wptexturize( $message ) ) ) . '</div>';
    }
}, 5, 4);

// True only when the order contains the SEO Site Audit (product ID 24).
function scrolly_order_has_seo_audit( $order ) {
    if ( ! is_a( $order, 'WC_Order' ) ) {
        return false;
    }
    foreach ( $order->get_items() as $item ) {
        if ( (int) $item->get_product_id() === 24 ) {
            return true;
        }
    }
    return false;
}
