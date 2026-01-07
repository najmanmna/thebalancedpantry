# Elvyn Store

Elvyn Store is a modern ecommerce web application built with Next.js, TypeScript, and Sanity CMS. It provides a seamless shopping experience for users, including product browsing, cart management, checkout, and order processing.

## Features

- Product catalog with categories, brands, and search
- Shopping cart and order summary
- Checkout flow with address, shipping, and payment options
- Real-time stock validation and inventory management
- Admin studio for product and order management (Sanity Studio)
- Responsive design for mobile and desktop
- Email notifications for customers and admins
- Privacy policy and terms agreement

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Sanity CMS
- **Database:** Sanity (content and product management)
- **Email:** Custom email sender via API
- **Deployment:** Netlify

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Sanity CLI (for admin studio)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/najmanmna/elvyn-store.git
   cd elvyn-store
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local` and fill in required values (Sanity API token, etc.)
4. Run the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
5. Access the app at `http://localhost:3000`

### Sanity Studio (Admin)

- To manage products and orders, run:
  ```sh
  npm run sanity
  ```
- Access the studio at `/admin/studio`

## Folder Structure

- `app/` - Next.js app routes and pages
- `components/` - Reusable UI and feature components
- `constants/` - Static data and configuration
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and API clients
- `public/` - Static assets
- `sanity/` - Sanity schemas, queries, and admin studio
- `types/` - TypeScript type definitions

## Environment Variables

- `SANITY_API_TOKEN` - Required for backend API access
- Other variables as needed for deployment and email

## Deployment

- The app is configured for deployment on Netlify. See `netlify.toml` for details.

## Contributing

Pull requests and issues are welcome! Please follow conventional commit messages and code style.

## License

This project is licensed under the MIT License.

## Contact

For support or inquiries, contact info@elvynstore.com
