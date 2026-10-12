# Connecting this backend to the VEL0URA storefront

1. Run the API (see README.md): `docker compose up -d`
2. Load the storefront's men's products + WELCOME10 coupon:
   `docker compose exec api python -m scripts.import_json data_export_veloura`
3. Add your storefront URL to `CORS_ORIGINS` in the backend `.env`.
4. In the frontend, set `VITE_API_URL=https://your-api-domain` and redeploy.

Checkout then sends every order to `POST /api/v1/orders`; the order appears in the admin panel at `/admin`.
Without `VITE_API_URL`, the storefront keeps working on device storage only.
