<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Custom_Users_Block {
    
    public function __construct() {
        add_action( 'init', array( $this, 'register_block' ) );
        add_action( 'rest_api_init', array( $this, 'custom_user_routes' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_my_react_script' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_my_react_script' ) );
    }

    // Registers the block
    public function register_block() {
        register_block_type( __DIR__ . '/build' );
    }

    // Create REST API routes
    public function custom_user_routes() {
        register_rest_route('custom-users/v1', '/users', array(
            'methods' => 'GET',
            'callback' => array( $this, 'custom_get_all_users' ),
            'permission_callback' => array( $this, 'custom_permission_callback' ),
        ));

        register_rest_route('custom-users/v1', '/user/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array( $this, 'custom_get_user_by_email' ),
            'permission_callback' => array( $this, 'custom_permission_callback' ),
            'args' => array(
                'id' => array(
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));

        register_rest_route('custom-users/v1', '/user/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array( $this, 'custom_update_user' ),
            'permission_callback' => array( $this, 'custom_permission_callback' ),
            'args' => array(
                'id' => array(
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ),
                'user_nicename' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'display_name' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'user_email' => array(
                    'required' => true,
                    'validate_callback' => function($param) {
                        return filter_var($param, FILTER_VALIDATE_EMAIL);
                    },
                    'sanitize_callback' => 'sanitize_email',
                ),
            ),
        ));
    }

    // Enqueue the React script
    public function enqueue_my_react_script() {
        wp_enqueue_script('my-react-app', plugin_dir_url(__FILE__) . 'build/index.js', array('wp-element'), '1.0', true);
        $nonce = wp_create_nonce('wp_rest');
        wp_localize_script('my-react-app', 'MyAppData', array('nonce' => $nonce, 'apiUrl' => rest_url('/custom-users/v1')));
    }

    // Permission callback to verify nonce and admin role
    public function custom_permission_callback( WP_REST_Request $request ) {
        $current_user = wp_get_current_user();
        if ( empty( $current_user->roles ) || ! in_array( 'administrator', $current_user->roles, true ) ) {
            return new WP_Error('rest_forbidden', 'You do not have permission to access this resource.', array('status' => 403));
        }
        $nonce = $request->get_header('X-WP-Nonce');
        if ( ! wp_verify_nonce($nonce, 'wp_rest') ) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', array('status' => 403));
        }
        return true;
    }

    // Get all users callback
    public function custom_get_all_users() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'users';
        $results = $wpdb->get_results("SELECT user_email, ID FROM $table_name");

        if (empty($results)) {
            return new WP_REST_Response(array('message' => 'No users found'), 404);
        }

        return new WP_REST_Response($results, 200);
    }

    // Get user by email callback
    public function custom_get_user_by_email( WP_REST_Request $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'users';
        $user_id = intval($request['id']);
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $user_id));

        if (empty($user)) {
            return new WP_REST_Response(array('message' => 'User not found'), 404);
        }

        return new WP_REST_Response($user, 200);
    }

    // Update user callback
    public function custom_update_user( WP_REST_Request $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'users';
        $user_id = intval($request['ID']);
        $user_nicename = sanitize_text_field($request['user_nicename']);
        $display_name = sanitize_text_field($request['display_name']);
        $user_email = sanitize_email($request['user_email']);

        if (empty($user_nicename) || empty($display_name) || empty($user_email)) {
            return new WP_REST_Response(array('message' => 'Missing required fields'), 400);
        }

        $result = $wpdb->update(
            $table_name,
            array(
                'user_nicename' => $user_nicename,
                'display_name' => $display_name,
                'user_email' => $user_email,
            ),
            array('ID' => $user_id),
            array('%s', '%s', '%s'),
            array('%d')
        );

        if ($result === false) {
            return new WP_REST_Response(array('message' => 'Error updating user'), 500);
        } elseif ($result === 0) {
            return new WP_REST_Response(array('message' => 'No changes made to the user'), 200);
        }

        return new WP_REST_Response(array(
            'message' => 'User updated successfully',
            'user' => array(
                'ID' => $user_id,
                'user_nicename' => $user_nicename,
                'display_name' => $display_name,
                'user_email' => $user_email,
            )
        ), 200);
    }
}
