# Supabase setup

Project database should contain `categories`, `products`, `orders`, and `order_items`.

Create an Admin user in Supabase Authentication, then grant that user admin authorization using the project's chosen RLS strategy. Do not expose the service-role key in the browser.

For production, add Storage bucket `product-images` and restrict uploads to authenticated admins.
