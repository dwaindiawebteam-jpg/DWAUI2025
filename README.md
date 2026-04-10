# 📚 DWA India

## 📄 Description

A modern blog platform built with React and Next.js that empowers the Dalit Welfare organisation to create and publish content with ease. For 32 years, our Dalit organisation has uplifted Dalit communities and rural villages, breaking cycles of poverty, inequality, and discrimination through education, livelihoods, women's empowerment, and community development.

The platform features a TipTap-powered rich text editor, intelligent read tracking, automated image optimization, and secure cloud storage — all wrapped in a responsive, performant Next.js application.

## ✨ Key Features
- **👥 Three-Tier Role System** – Clean separation between Admins (full control), Authors (their own content only), and Readers (public access)
- **📝 Rich JSON Editor** – TipTap-powered content creation with structured output stored in Firestore
- **🖼️ Smart Image Pipeline** – Two-stage compression: client-side resizing (max 1600px, ~80% quality) + server-side AVIF/WebP optimization with Sharp
- **👁️ Accurate Read Tracking** – Combines localStorage flags and IP verification for reliable, lightweight view counting
- **🔒 Enterprise-Grade Security** – Firebase Authentication with email verification + hCaptcha protection against bots
- **☁️ Modern Storage Architecture** – ImageKit for images, Firestore for content and metadata
- **🚀 Vercel Deployment** – Continuous deployment, automatic preview builds, and free hosting tier
- **📱 Fully Responsive** – Seamless reading and editing experience across all devices	

## 🛠️ Technologies Used
- **React** – UI component library
- **Next.js** – Server-side rendering, routing, and performance optimization
- **TipTap** – Headless rich text editor with JSON output
- **Firebase** – Authentication & Firestore database
- **ImageKit** – Image asset storage
- **Sharp** – Server-side image optimization
- **browser-image-compression** – Client-side image preprocessing
- **hCaptcha** – Bot protection
- **Vercel** – Hosting and deployment


## 📦 Installation
1. 	Clone the repository:
```bash
git clone https://github.com/dwaindiawebteam-jpg/DWAUI2025.git
```

2.	Install dependencies
```bash
npm install
# or
yarn install
```
3. 	Set up environment variables
	Create a .env.local file with your configuration:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_HCAPTCHA_SITEKEY=your_sitekey
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"{your_project_name}","private_key":"-----BEGIN PRIVATE KEY-----"{your_key}"=\n-----END PRIVATE KEY-----\n","client_email":"{your_client_key}","client_id":"{your_client_id}","auth_uri":"{your_auth_uri}","token_uri":"{your_token_uri}","auth_provider_x509_cert_url":"{your_auth_provider}"}'
IMAGEKIT_PUBLIC_KEY_ACCOUNT_ID=your_account_id
IMAGEKIT_PRIVATE_KEY=your_access_key
IMAGEKIT_URL_ENDPOINT=your_secret_key
```

4.	Run the development server:
```bash
npm run dev
# or
yarn dev
```
Open http://localhost:3000 to see your blog.
-✅ Node Target: 18+
-✅ Browser Support: Modern browsers (Chrome, Firefox, Safari, Edge)


## 📝 Content Creation Guidelines
To ensure the best experience with DWA India, follow these guidelines when creating content:

- *Rich Text* – Use the TipTap editor for formatted content; all text is stored as JSON for flexibility and security
- *Image Uploads* – Upload images directly through the editor; they'll be automatically optimized:
- *Client-side*: Resized to max 1600px, ~80% JPEG quality, <1.2MB
- *Server-side*: Converted to AVIF/WebP with ImageKIt
- *Special handling*: SVGs pass through, GIFs become animated WebP
- *Read Tracking* – Views are counted once per IP + device combination to ensure accuracy

## 📌 Example Article Structure
```bash
{
  "id": "article-123",
  "title": "Getting Started with DWA India",
  "author": "author@example.com",
  "createdAt": "2024-01-15T10:00:00Z",
  "publishedAt": "2024-01-16T09:00:00Z",
  "readCount": 1247,
  "coverImage": "https://ik.imagekit.io/covers/getting-started.webp",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Welcome to Modern Blogging" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "DWA India makes content creation..." }]
      }
    ]
  }
}
```

## 👥 User Roles & Permissions
### 👑 Admin
- Full system access
- Manage all users (authors, admins)
- Create, edit, publish, delete any article
- Configure site settings
- View analytics and read statistics

### ✍️ Author
- Create new articles
- Edit their own drafts and published posts
- Delete their own unpublished drafts
- View read counts for their articles
- Cannot modify other authors' content

### 👤 Reader
- Read all published articles
- No content creation permissions

## 🔐 Security Features
- Firebase Authentication – Secure email/password login with verification
- hCaptcha Protection – Blocks bots during registration and login
- Role-Based Access Control – Strict permissions at API and UI levels
- Secure Image Pipeline – Validation and optimization before storage
- IP + localStorage Tracking – Prevents view count manipulation

## 📊 Database Schema

articles

- id: string (auto-generated)
- title: string
- authorId: string (references users)
- authorEmail: string
- content: JSON (TipTap output)
- coverImage: string (ImageKit URL)
- createdAt: timestamp
- updatedAt: timestamp
- publishedAt: timestamp (null if draft)
- readCount: number
- readIps: array<string> (last 100 unique IPs)

users (managed by Firebase Auth, with Firestore extensions)
- email: string
- role: "admin" | "author" | "reader"
- createdAt: timestamp
- emailVerified: boolean

## 📝 License
This project is licensed under the **[Apache License 2.0](LICENSE)**.
