-- Check if the admin user exists and debug the authentication
SELECT 
    id, 
    email, 
    password_hash,
    is_active,
    created_at
FROM admin_users 
WHERE email = 'jeremyw@dobeu.net';