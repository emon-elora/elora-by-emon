# Elora by Emon — Permanent Admin + Customer Catalog

This version uses Cloudflare Pages Functions + D1. Products and orders live in the server database, so customers see the same product catalog across phones and browsers.

## 1) Create D1
Cloudflare Dashboard → Workers & Pages → D1 SQL Database → Create database.
Name: `elora-by-emon-db`

## 2) Initialize database
Run the SQL in `schema.sql` in the D1 Console.

## 3) Bind D1 to the Pages project
Workers & Pages → your Pages project → Settings → Bindings → Add → D1 database.
Variable name: `DB`
Select `elora-by-emon-db`.
Redeploy after binding.

## 4) Add the admin password as a Secret
Workers & Pages → your Pages project → Settings → Variables and Secrets → Add.
Name: `ADMIN_PASSWORD`
Value: your new admin password.
Choose Encrypt.

Do NOT put the password in `wrangler.jsonc` or JavaScript.

## 5) Important: deployment method
Cloudflare's current documentation says Pages Functions are not supported with Direct Upload. Connect this project to GitHub/GitLab (or deploy with Wrangler) so the `/functions` directory is deployed.

## 6) Replace the placeholder D1 ID
If deploying with Wrangler, replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.jsonc` with your D1 database ID.

Customer site: `/`
Admin: `/admin.html`
Products API: `/api/products`
Orders API: `/api/orders`

The customer checkout creates an order in D1. Admin can see and update order status. Product changes made in Admin appear on the customer site because both use the same D1 database.
