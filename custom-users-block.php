<?php
/**
 * Plugin Name:       Custom Users Block
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       custom-users-block
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_custom_users_block_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'create_block_custom_users_block_block_init' );








// get alll users

// Create REST API endpoint to fetch users data
function custom_user_routes() {
    register_rest_route('custom-users/v1', '/users', array(
        'methods' => 'GET',
        'callback' => 'custom_get_all_users',
        'permission_callback' => 'custom_permission_callback', // Allow public access or customize as needed
    ));


    // Route to get user by email
    register_rest_route('custom-users/v1', '/user/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'custom_get_user_by_email',
        'permission_callback' => '__return_true', 
        'args' => array(
            'id' => array(
                'required' => true,
                'validate_callback' => function($param, $request, $key) {
                    return is_numeric($param); // Ensure the parameter is a valid numeric ID
                }
            ),
        ),
    ));

    register_rest_route('custom-users/v1', '/user/(?P<id>\d+)', array(
        'methods' => 'PUT',
        'callback' => 'custom_update_user',
        'permission_callback' => '__return_true', // Customize this for your needs
        'args' => array(
            'id' => array(
                'required' => true,
                'validate_callback' => function($param, $request, $key) {
                    return is_numeric($param);
                }
            ),
            'user_nicename' => array(
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field', // Sanitize user_nicename
            ),
            'display_name' => array(
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field', // Sanitize display_name
            ),
            'user_email' => array(
                'required' => true,
                'validate_callback' => function($param, $request, $key) {
                    return filter_var($param, FILTER_VALIDATE_EMAIL); // Validate the email
                },
                'sanitize_callback' => 'sanitize_email', // Sanitize the email
            ),
        ),
    ));
    
	
}



add_action('rest_api_init', 'custom_user_routes');


// enqueue 
function enqueue_my_react_script() {
    // Enqueue your React app
    wp_enqueue_script('my-react-app', plugin_dir_url(__FILE__) . 'build/index.js', array('wp-element'), '1.0', true);

    // Create nonce for secure API calls
    $nonce = wp_create_nonce('wp-rest');

    // Pass nonce to your React app via wp_localize_script
    wp_localize_script('my-react-app', 'MyAppData', array(
        'nonce' => $nonce,
    ));
}

add_action('wp_enqueue_scripts', 'enqueue_my_react_script');

add_action('enqueue_block_editor_assets', 'enqueue_my_react_script');




// verify nonce
function custom_permission_callback(WP_REST_Request $request){
    // Check the nonce
    $nonce = $request->get_header('X-WP-Nonce');

        // Verify nonce
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return 0;
        }
}



// Callback function to fetch all users data
function custom_get_all_users() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'users';

    $results = $wpdb->get_results("SELECT user_email, ID FROM $table_name" ); 

    if (empty($results)) {
        return new WP_REST_Response(array('message' => 'No users found'), 404);
    }

    return new WP_REST_Response($results, 200);
}



// get user by email
function custom_get_user_by_email(WP_REST_Request $request){
	global $wpdb;
    $table_name = $wpdb->prefix . 'users';
    $user_id = intval($request['id']);

    // Prepare and execute the SQL query to fetch user details by ID
    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $user_id));

    if (empty($user)) {
        return new WP_REST_Response(array('message' => 'User not found'), 404);
    }

    return new WP_REST_Response($user, 200);
}




function custom_update_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'users';
    $user_id = intval($request['ID']);
    
    // Get the new data from the request
    $user_nicename = sanitize_text_field($request['user_nicename']);
    $display_name = sanitize_text_field($request['display_name']);
    $user_email = sanitize_email($request['user_email']);

    // Check if the required fields are provided
    if (empty($user_nicename) || empty($display_name) || empty($user_email)) {
        return new WP_REST_Response(array('message' => 'Missing required fields'), 400);
    }

    // Prepare and execute the SQL query to update user details
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
        // SQL error occurred
        return new WP_REST_Response(array('message' => 'Error updating user'), 500);
    } elseif ($result === 0) {
        // No rows updated
        return new WP_REST_Response(array('message' => 'No changes made to the user'), 200);
    }

    // Return the updated user data
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


