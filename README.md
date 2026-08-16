# CampusXchange — Student Marketplace Platform

## 1. Project Title
**CampusXchange** — A peer-to-peer campus marketplace for college students.

---

## 2. Project Overview
CampusXchange is a full-stack web application that allows college students to buy, sell, and exchange used academic items, electronics, hostel essentials, and more — within their campus community. Built with Node.js, Express, MongoDB, and Bootstrap 5. No payment gateway, no cart, no delivery — just a clean discovery-to-contact workflow.

---

## 3. Problem Statement
College students regularly accumulate useful items — textbooks, calculators, lab equipment — that go unused after a semester. There is no trusted, campus-specific platform to exchange these items. General platforms like OLX have no campus context and are not student-friendly. CampusXchange solves this by building a dedicated peer-to-peer marketplace within the campus community.

---

## 4. Features

### Core Features
- **Browse & Search** — Search by keyword, filter by category, condition, price range. Sort by newest or price.
- **Listings** — Create, view, edit, delete listings. Upload up to 4 product images.
- **Contact Seller** — Send an inquiry message to the seller. No email exposed publicly.
- **Save Items** — Bookmark listings for later. Duplicate saves prevented at database level.
- **Mark as Sold** — Seller marks listing as sold; it disappears from active marketplace.
- **Report Listing** — Report inappropriate/fake listings. One report per user per listing enforced.
- **Dashboard** — View your listings, stats, received inquiries, and navigate to saved items.
- **Auth** — Signup, Login, Logout with Passport.js Local Strategy + bcrypt + MongoDB sessions.

### Business Rules
- Sold listings do not appear in the active marketplace.
- Owners cannot save or inquire on their own listings.
- Buyers cannot contact sellers about sold items.
- Only the listing owner can edit, delete, or mark sold.
- File uploads accept only JPG, PNG, WEBP — max 5MB per file.

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | Passport.js (Local Strategy) |
| Sessions | express-session + connect-mongo |
| Password Hashing | bcryptjs |
| File Upload | Multer |
| Security | Helmet, httpOnly cookies |
| UI | Bootstrap 5 + custom CSS |
| Method Override | method-override (PUT/DELETE via forms) |
| Flash Messages | connect-flash |

---

## 6. Architecture

```
Browser (EJS + Bootstrap 5)
         │  HTTP Request
         ▼
app.js — Express server
         │
         ├── Helmet (security headers)
         ├── express.urlencoded (form body parsing)
         ├── method-override (fake PUT/DELETE from HTML forms)
         ├── express-session + connect-mongo (session storage)
         ├── Passport.js (authentication)
         ├── connect-flash (one-time messages)
         └── res.locals (user, flash, helpers injected to all views)
                  │
         ┌────────┼─────────────────────────────────┐
         │        │                                 │
    routes/   middleware/                     controllers/
    auth.js   isLoggedIn.js                  authController.js
    listings.js isOwner.js                  listingController.js
    users.js  upload.js                     userController.js
    inquiries.js errorHandler.js            inquiryController.js
    reports.js
                  │
              models/
              User.js   Listing.js   SavedListing.js
              Inquiry.js   Report.js
                  │
           MongoDB Atlas
```

### Authentication Flow
```
Browser submits login form
  → POST /login
  → Passport LocalStrategy
      → User.findOne({ email })
      → bcrypt.compare(password, hash)
      → serializeUser: stores user._id in session
  → Session saved to MongoDB via connect-mongo
  → Browser receives session cookie (httpOnly)

On every subsequent request:
  → Session cookie sent automatically
  → deserializeUser: fetches user by _id
  → req.user populated
  → res.locals.user available in every EJS view
```

### Image Upload Flow
```
Browser submits multipart/form-data form
  → Multer middleware
      → Validates file type (JPG/PNG/WEBP only)
      → Validates file size (max 5MB)
      → Saves to /uploads/ with unique filename
  → Controller stores /uploads/filename in Listing.images[]
  → View renders image via /uploads/filename URL
```

---

## 7. Folder Structure

```
campusxchange/
├── app.js                        ← Entry point: middleware stack, routes, server
├── config/
│   ├── database.js               ← MongoDB connection
│   └── passport.js               ← Passport Local Strategy setup
├── controllers/
│   ├── authController.js         ← Signup, Login, Logout
│   ├── listingController.js      ← CRUD, search/filter, save, report, inquiry
│   ├── userController.js         ← Dashboard, Profile, Saved Items
│   └── inquiryController.js      ← View inquiries, mark read
├── middleware/
│   ├── isLoggedIn.js             ← Redirect unauthenticated users
│   ├── isOwner.js                ← Verify listing ownership server-side
│   ├── upload.js                 ← Multer config for image uploads
│   └── errorHandler.js           ← 404 and global error pages
├── models/
│   ├── User.js                   ← name, email, password (bcrypt), branch, batch
│   ├── Listing.js                ← title, desc, price, category, condition, images[], seller
│   ├── SavedListing.js           ← user + listing (unique compound index)
│   ├── Inquiry.js                ← listing, seller, buyer, message, status
│   └── Report.js                 ← listing, reportedBy, reason (unique compound index)
├── routes/
│   ├── auth.js                   ← /login, /signup, /logout
│   ├── listings.js               ← /listings/* (all listing actions)
│   ├── users.js                  ← /dashboard, /profile, /saved
│   ├── inquiries.js              ← /inquiries, /inquiries/:id/read
│   └── reports.js                ← (future admin routes)
├── utils/
│   └── helpers.js                ← formatDate, truncate, formatPrice
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/placeholder.png
├── uploads/                      ← User-uploaded product images (gitignored)
│   └── .gitkeep
├── views/
│   ├── partials/
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   ├── flash.ejs
│   │   └── listing-card.ejs
│   ├── home.ejs
│   ├── marketplace.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   ├── listing-new.ejs
│   ├── listing-edit.ejs
│   ├── listing-show.ejs
│   ├── dashboard.ejs
│   ├── saved.ejs
│   ├── inquiries.ejs
│   ├── profile.ejs
│   ├── 404.ejs
│   └── error.ejs
├── .env                          ← NOT committed to Git
├── .env.example                  ← Committed — shows required variable names only
├── .gitignore
├── package.json
└── README.md
```

---

## 8. Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| email | String | Required, unique, lowercase |
| password | String | bcrypt hash — never plain text |
| branch | String | CSE, ECE, ME, CE, EE, IT, Chemical, Other |
| batch | String | e.g. "2021-2025" |
| createdAt | Date | Auto-set |

### Listing
| Field | Type | Notes |
|-------|------|-------|
| title | String | Max 100 chars |
| description | String | Max 1000 chars |
| price | Number | Min 0 |
| category | String | Enum |
| condition | String | New / Like New / Good / Fair |
| images | [String] | Array of /uploads/filename paths |
| seller | ObjectId→User | Populated on fetch |
| branch | String | Seller's branch |
| batch | String | Seller's batch |
| location | String | Hostel block / campus zone |
| status | String | "active" or "sold" |
| createdAt, updatedAt | Date | timestamps: true |

### SavedListing
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId→User | Required |
| listing | ObjectId→Listing | Required |
| createdAt | Date | Auto |
| — | — | Unique index on {user, listing} |

### Inquiry
| Field | Type | Notes |
|-------|------|-------|
| listing | ObjectId→Listing | Required |
| seller | ObjectId→User | Required |
| buyer | ObjectId→User | Required |
| message | String | Max 500 chars |
| status | String | "unread" or "read" |
| createdAt | Date | Auto |

### Report
| Field | Type | Notes |
|-------|------|-------|
| listing | ObjectId→Listing | Required |
| reportedBy | ObjectId→User | Required |
| reason | String | Enum: Fake listing, Spam, etc. |
| message | String | Optional, max 300 chars |
| createdAt | Date | Auto |
| — | — | Unique index on {listing, reportedBy} |

---

## 9. Installation

```bash
git clone <your-repo-url>
cd campusxchange
npm install
cp .env.example .env
# Fill in .env with your values
npm run dev
```

---

# Running Locally

```bash
npm run dev    # development with auto-restart (nodemon)
npm start      # production
```

Open http://localhost:3000

---

