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

## 10. Environment Variables

Create a `.env` file in the project root:

```
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusxchange
SESSION_SECRET=a_very_long_random_string_here
```

**Never commit `.env` to Git.** The `.env.example` file shows what variables are needed — with no real values.

---

## 11. Running Locally

```bash
npm run dev    # development with auto-restart (nodemon)
npm start      # production
```

Open http://localhost:3000

---

## 12. Deployment (Render)

1. Push your code to GitHub (ensure `.env` is in `.gitignore`)
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repository
4. Build command: `npm install`
5. Start command: `node app.js`
6. Add Environment Variables in Render dashboard:
   - `MONGO_URI` — MongoDB Atlas connection string
   - `SESSION_SECRET` — Long random string
   - `NODE_ENV` — `production`
7. In MongoDB Atlas: Network Access → Allow `0.0.0.0/0` (all IPs)
8. Deploy

---

## 13. Security Notes

- **Passwords** are hashed with bcryptjs (10 salt rounds) before storage. Plain text passwords are never saved.
- **Sessions** are stored in MongoDB (not RAM), survive server restarts, expire after 7 days.
- **httpOnly cookies** prevent JavaScript from accessing the session token (XSS protection).
- **Helmet** adds standard HTTP security headers (X-Frame-Options, X-Content-Type-Options, etc.).
- **Ownership checks** are always server-side in `isOwner.js` — we never trust hidden form fields.
- **File uploads** are validated for MIME type (JPG/PNG/WEBP) and size (5MB max) by Multer.
- **Mongoose schema validation** catches invalid data before it reaches the database.
- **Unique indexes** on email (User), {user, listing} (SavedListing), {listing, reportedBy} (Report) enforce data integrity at DB level.
- **CastError handling** — invalid MongoDB ObjectIds in URLs return a clean 404 page.

---

## 14. Future Enhancements

These are ideas for future development — **none are currently implemented**:

- **College email verification** — verify @college.edu email before allowing listings
- **Online payments** — integrate Razorpay for in-platform transactions
- **Real-time chat** — Socket.io messaging between buyer and seller
- **Cloud image storage** — upload to Cloudinary or AWS S3 instead of local disk
- **Admin moderation panel** — review reported listings and manage users
- **AI-based recommendations** — suggest listings based on user browsing history
- **Push notifications** — notify seller when a new inquiry is received
- **Rating system** — rate buyers and sellers after a transaction

---

## 15. Screenshots

> _Add screenshots here after deployment._

- Home page
- Marketplace with filters
- Listing detail page
- Dashboard
- Inquiries page

---

## 16. Author

Built by Bismay Sahu — ECE, OUTR (Batch 2021–2025)
For placement portfolio — demonstrates full-stack MVC development with Node.js, Express, MongoDB.

---

# INTERVIEW PREPARATION

## A. 60-Second Interview Explanation

> "I built CampusXchange, a peer-to-peer marketplace for college students. The problem I solved is that there's no campus-specific platform for students to sell used textbooks, calculators, or hostel items to juniors.
>
> The tech stack is Node.js with Express on the backend, MongoDB Atlas with Mongoose for the database, EJS for server-side rendering, and Bootstrap 5 for the UI. Authentication uses Passport.js with a local strategy, bcrypt for password hashing, and MongoDB-backed sessions.
>
> The core workflow is: a student signs up, posts a listing with photos using Multer, another student finds it through search or filters, sends an inquiry message, they meet offline to complete the transaction, and the seller marks it as sold. I also built features like save/wishlist, report listing, a dashboard, and a complete inquiry system.
>
> I used method-override to handle PUT and DELETE requests from HTML forms since forms only support GET and POST natively. Every protected route checks authentication and ownership server-side — never trusting the client."

---

## B. 5-Minute Detailed Explanation

**Problem Statement:**
Students accumulate useful items each semester that lose value when unused. There's no campus-specific trust network for exchanges. CampusXchange addresses this by restricting the marketplace to campus peers.

**Architecture (MVC):**
- **Model** — 5 Mongoose schemas: User, Listing, SavedListing, Inquiry, Report
- **View** — EJS templates with Bootstrap 5, organized as partials (navbar, footer, flash, card)
- **Controller** — 4 controllers: auth, listing, user, inquiry — each with focused, single-purpose functions

**Authentication:**
Passport.js Local Strategy with bcryptjs. When a user logs in, Passport calls `serializeUser` which stores only the user's MongoDB `_id` in the session. On every subsequent request, `deserializeUser` reads that ID from the session, fetches the user from MongoDB, and attaches it to `req.user`. Sessions are stored in MongoDB via connect-mongo, not in memory, so they survive server restarts.

**Listing CRUD:**
Create → Multer handles multipart/form-data image upload → Controller validates fields → Mongoose creates document. Read → findById with .populate("seller"). Update → isOwner middleware verifies ownership before controller runs. Delete → cascades to remove SavedListing, Inquiry, and Report records plus disk images.

**Search/Filter:**
All filtering happens in MongoDB queries using `$regex` for text search (case-insensitive) and range operators (`$lt`, `$gte`) for price. All filters combine into one query object — clean, readable, and efficient.

**Key Design Decisions:**
- Sessions over JWT because this is a server-rendered app — simpler to implement with Passport and more secure for browser clients (httpOnly cookie vs localStorage)
- MongoDB over SQL because the Gemini analysis output and listing data are document-shaped arrays, not relational tables
- EJS over React because it keeps the stack simple enough to explain in 30 seconds per file

---

## C. Complete Route Table

| Method | Route | Auth? | Description |
|--------|-------|-------|-------------|
| GET | `/` | No | Home page with recent listings |
| GET | `/signup` | No | Signup form |
| POST | `/signup` | No | Create account |
| GET | `/login` | No | Login form |
| POST | `/login` | No | Authenticate user |
| POST | `/logout` | Yes | Destroy session |
| GET | `/listings` | No | Marketplace (search/filter/sort/paginate) |
| GET | `/listings/new` | Yes | New listing form |
| POST | `/listings` | Yes | Create listing + upload images |
| GET | `/listings/:id` | No | Listing detail page |
| GET | `/listings/:id/edit` | Yes+Owner | Edit form |
| PUT | `/listings/:id` | Yes+Owner | Update listing |
| DELETE | `/listings/:id` | Yes+Owner | Delete listing |
| POST | `/listings/:id/sold` | Yes+Owner | Mark as sold |
| POST | `/listings/:id/save` | Yes | Save listing |
| POST | `/listings/:id/unsave` | Yes | Remove from saved |
| POST | `/listings/:id/inquiries` | Yes | Send inquiry to seller |
| POST | `/listings/:id/report` | Yes | Submit report |
| GET | `/dashboard` | Yes | User dashboard |
| GET | `/profile` | Yes | User profile |
| GET | `/saved` | Yes | Saved items |
| GET | `/inquiries` | Yes | Received inquiries |
| POST | `/inquiries/:id/read` | Yes | Mark inquiry as read |

---

## D. 30 Technical Interview Questions & Answers

**Q1. Explain your project in one sentence.**
A: "CampusXchange is a peer-to-peer campus marketplace where students can list, search, save, and inquire about used items through an MVC web app built with Node.js, Express, MongoDB, and Bootstrap."

**Q2. What is MVC and how did you use it here?**
A: "MVC means Model-View-Controller. Models are Mongoose schemas (User, Listing, etc.) that define data shape. Views are EJS templates that render HTML. Controllers contain the business logic that connects routes to models. This keeps code organized and each file has one job."

**Q3. Why did you choose MongoDB over MySQL?**
A: "Listing data contains arrays — images[], matchingSkills[], etc. MongoDB stores these natively as documents without needing join tables. For a project where schema can evolve quickly, document-based storage is simpler to develop with."

**Q4. What is Mongoose and why use it?**
A: "Mongoose is an ODM (Object Data Modeling) library for MongoDB. Raw MongoDB has no schema enforcement. Mongoose adds schemas, validation, hooks (like pre-save for password hashing), and methods (like comparePassword). It makes MongoDB queries cleaner and safer."

**Q5. How does Passport.js work?**
A: "Passport uses strategies. We use LocalStrategy which receives email and password. It finds the user by email, calls bcrypt.compare() to check the password. If valid, serializeUser stores the user ID in the session. On every request, deserializeUser reads the ID and fetches the full user from MongoDB, attaching it to req.user."

**Q6. What is bcrypt and why is it used for passwords?**
A: "bcrypt is a one-way hashing algorithm designed to be deliberately slow. This makes brute-force attacks impractical. It generates a unique salt for each hash, so two identical passwords produce different hashes. We can never decrypt it — during login we hash the input again and compare."

**Q7. What is express-session?**
A: "express-session stores user state across requests. HTTP is stateless — each request knows nothing about previous ones. Sessions solve this by giving the browser a session ID in a cookie. The server stores session data (user ID, flash messages) in MongoDB. On each request, the session ID is read, and the data is retrieved."

**Q8. Why sessions over JWT?**
A: "For a server-rendered EJS app, sessions are simpler. JWT stores data in the client (localStorage), which is vulnerable to XSS. Sessions store only an ID in an httpOnly cookie — JavaScript can't read it. Sessions can also be invalidated server-side instantly, while JWTs must wait to expire."

**Q9. What is the event loop in Node.js?**
A: "Node.js is single-threaded but handles concurrent requests through the event loop. When an async operation starts (like a database query), Node hands it to the OS and moves on to the next request. When the DB responds, the callback is queued and executed. This makes Node highly efficient for I/O-heavy applications."

**Q10. What is middleware in Express?**
A: "Middleware is a function that runs between the incoming request and the final route handler. It has access to req, res, and next(). Examples: express.urlencoded() parses form data, passport.session() restores the user, isLoggedIn.js redirects unauthenticated users. Middleware runs in the order it's registered."

**Q11. What is method-override and why do you need it?**
A: "HTML forms only support GET and POST. But REST conventions require PUT for updates and DELETE for deletions. method-override reads a ?_method= query parameter and changes req.method accordingly. So `<form method='POST' action='/listings/123?_method=PUT'>` is treated as a PUT request by Express."

**Q12. What is Multer?**
A: "Multer is Express middleware for handling multipart/form-data — the encoding used when browsers upload files. Standard Express body parsers can't handle binary file data. Multer reads the file stream, validates type and size, renames the file with a unique name, and saves it to disk. It puts file info in req.file or req.files."

**Q13. What is populate() in Mongoose?**
A: "populate() is Mongoose's version of a SQL JOIN. When a field stores an ObjectId reference to another collection, populate() fetches the referenced document and embeds it in the result. Example: `Listing.findById(id).populate('seller')` fetches the seller's full User document instead of just their ID."

**Q14. What is connect-flash?**
A: "connect-flash stores one-time messages in the session. req.flash('success', 'Done!') stores the message. On the next request, req.flash('success') reads and clears it. This is used to show success/error messages after form submissions and redirects."

**Q15. What is the isOwner middleware?**
A: "isOwner verifies that the logged-in user owns the listing they're trying to modify. It fetches the listing by ID from MongoDB, compares listing.seller (an ObjectId) with req.user._id using Mongoose's .equals() method. If they don't match, it redirects with an error. This prevents unauthorized edits/deletes even if someone crafts a direct HTTP request."

**Q16. How did you implement search?**
A: "Search uses MongoDB's $regex operator with the 'i' flag for case-insensitive matching. The query uses $or to search across title, description, and category fields simultaneously. All active filters (category, condition, price range) are combined into a single query object passed to Listing.find()."

**Q17. How does pagination work?**
A: "Pagination uses MongoDB's .skip() and .limit(). For page 2 with 12 items per page: skip = (2-1) * 12 = 12. We also use countDocuments() to get the total count for calculating totalPages. The EJS template builds page URLs using a server-side helper function — no browser APIs needed in server-rendered templates."

**Q18. What is a Mongoose pre-save hook?**
A: "A pre-save hook runs automatically before every .save() call. In User.js, we use it to hash the password. `if (!this.isModified('password')) return next()` skips hashing if the password wasn't changed (important for profile updates). The hook runs regardless of which controller saves the user, so hashing can't be forgotten."

**Q19. What is a compound index?**
A: "A compound index covers multiple fields. In SavedListing, we have `{ user: 1, listing: 1 }` with unique: true. This means the same user cannot save the same listing twice — enforced at the database level, not just in application code. Error code 11000 means a duplicate key violation."

**Q20. What is Helmet?**
A: "Helmet sets security-related HTTP response headers. It adds headers like X-Frame-Options (prevent clickjacking), X-Content-Type-Options (prevent MIME sniffing), and others. It's one npm package that provides multiple security improvements with almost no configuration."

**Q21. What is connect-mongo?**
A: "connect-mongo is a session store that saves Express sessions in MongoDB instead of RAM. Without it, sessions are stored in memory — they're lost on every server restart. Using MongoDB means sessions survive restarts and can be shared across multiple server instances."

**Q22. What is res.locals?**
A: "res.locals is an object that's automatically passed to the EJS view in every render. In app.js we set res.locals.user, res.locals.success, res.locals.error, and helper functions. Every template gets these automatically — we don't need to pass them manually to every res.render() call."

**Q23. What happens when you delete a listing?**
A: "The delete controller: (1) reads the listing from req.listing set by isOwner, (2) loops through listing.images[] and deletes each file from the uploads directory using fs.unlinkSync, (3) deletes all related SavedListing records, (4) deletes all related Inquiry records, (5) deletes all related Report records, (6) deletes the listing itself. This prevents orphaned data."

**Q24. What is an ObjectId?**
A: "ObjectId is MongoDB's default document ID type. It's a 12-byte BSON value that encodes a timestamp, machine ID, process ID, and random counter. It's globally unique and sortable by time. In Mongoose, we use mongoose.Schema.Types.ObjectId to reference documents across collections."

**Q25. What is async/await?**
A: "async/await is syntactic sugar over Promises. An async function always returns a Promise. await pauses execution until the Promise resolves. Used with try/catch for error handling. Without it, we'd use .then()/.catch() chains, which are harder to read. Example: `const user = await User.findById(id)` instead of `User.findById(id).then(user => ...)`.

**Q26. Why EJS instead of React?**
A: "React requires a separate frontend build, state management, API design, and significant additional complexity. EJS is a simple templating engine — it renders HTML on the server and sends it to the browser. For an MVC project that needs to be explained in a placement interview, EJS is much simpler to reason about and demonstrate."

**Q27. How do you prevent a user from editing another person's listing?**
A: "The isOwner middleware runs before the edit and delete route handlers. It fetches the listing by ID, compares listing.seller with req.user._id using .equals() (a Mongoose method that handles ObjectId type comparison correctly), and redirects with an error if they don't match. The check is always server-side."

**Q28. What is the difference between findById() and findOne()?**
A: "findById(id) is shorthand for findOne({ _id: id }). Both return a single document or null. findById is cleaner when you already have the ID. findOne is used when searching by other fields, like User.findOne({ email })."

**Q29. How does the inquiry system work?**
A: "When a buyer clicks 'Contact Seller', a modal form opens. On submit, POST /listings/:id/inquiries creates an Inquiry document in MongoDB with fields: listing ID, seller ID (from the listing), buyer ID (from req.user), message text, and status: 'unread'. The seller sees all inquiries at GET /inquiries. Clicking 'Mark as Read' sends POST /inquiries/:id/read which updates status to 'read'."

**Q30. What is Render and how do you deploy?**
A: "Render is a cloud platform similar to Heroku. To deploy: push code to GitHub, connect the repo on Render, set build command to 'npm install' and start command to 'node app.js'. Add environment variables (MONGO_URI, SESSION_SECRET) in Render's dashboard. Render provides a free tier with automatic HTTPS and a public URL. The PORT variable is set automatically by Render."

---

## E. Resume Entry

### CampusXchange | Node.js · Express · MongoDB · Bootstrap 5
- Built a full-stack peer-to-peer campus marketplace with complete CRUD for listings, image upload via Multer (up to 4 images, 5MB each), and a search/filter system using MongoDB $regex and range operators with pagination.
- Implemented secure authentication using Passport.js Local Strategy, bcryptjs password hashing (10 rounds), and MongoDB-backed session management with connect-mongo; protected routes with custom isLoggedIn and isOwner middleware.
- Designed an inquiry system allowing buyers to message sellers (stored in MongoDB), a save/wishlist feature with duplicate prevention via compound unique index, and a report listing system — all connected through an MVC architecture with 5 Mongoose models and 22 RESTful routes.

---

## F. Testing Checklist

### Authentication
- [ ] Signup with valid data creates account and logs in
- [ ] Duplicate email is rejected with error message
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password shows error
- [ ] Logout destroys session
- [ ] Accessing /dashboard while logged out redirects to /login

### Listings
- [ ] Create listing with all fields and images works
- [ ] Create listing with empty required fields shows validation error
- [ ] Listing appears in marketplace after creation
- [ ] Listing detail page shows all fields (title, price, condition, category, description, location, branch, batch)
- [ ] Edit listing updates data and redirects
- [ ] Delete listing removes from DB and deletes image files
- [ ] Another user cannot access edit page (redirected with error)
- [ ] Mark as Sold removes from marketplace, shows SOLD badge

### Marketplace
- [ ] Search by keyword returns relevant results
- [ ] Category filter works
- [ ] Condition filter works
- [ ] Price range filter works
- [ ] Sort by price works
- [ ] Sold listings do not appear in active marketplace
- [ ] Pagination works correctly

### Save / Unsave
- [ ] Save a listing saves it to DB
- [ ] Saving the same listing twice shows "Already saved" error
- [ ] Unsave removes the record
- [ ] Saved items page shows all saved listings
- [ ] Deleted listings are filtered out of saved items page

### Inquiry
- [ ] Buyer can send inquiry to seller
- [ ] Inquiry appears in seller's /inquiries page
- [ ] Inquiry shows buyer name, message, listing title, date
- [ ] Mark as Read changes status
- [ ] Cannot send inquiry on sold listing
- [ ] Seller cannot send inquiry to themselves

### Reports
- [ ] Report is saved to DB with reason and optional message
- [ ] Second report from same user on same listing is rejected (duplicate index)

### Error Handling
- [ ] Invalid listing ID URL returns clean 404 page
- [ ] Non-existent listing URL redirects to marketplace
- [ ] Uploading non-image file shows error
