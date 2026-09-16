# Supabase setup

The marketplace uses `categories`, `products`, `orders`, `order_items`, and `admin_users`.

## Admin account

Create an admin user in Supabase Authentication, then insert its Auth UUID into `public.admin_users`. The dashboard verifies membership in that table before allowing access.

## Product images

The `product-images` bucket is public for displaying catalog images. Storage RLS restricts upload, update, and delete operations to users in `admin_users`. Maximum image size is 5 MB.

## Environment variables

Client:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server only:
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key in browser code or a `NEXT_PUBLIC_` variable.
