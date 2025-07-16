# Chitrakosha: Artwork Marketplace - Development Plan

This document outlines a comprehensive plan for building a full-featured artwork marketplace using Next.js, shadcn/ui, and Tailwind CSS.

---

### 1. Core Philosophy & Technology Stack

#### a. Account Model: Unified User Account
A single account model is recommended. A user can sign up and seamlessly switch between buying and selling activities. We can have a boolean flag, `isArtist`, on the User model. An internal process (e.g., filling out a form, manual approval) can grant a user artist privileges, unlocking the seller dashboard. This simplifies the user experience significantly.

#### b. Technology Stack
- **Framework:** Next.js (App Router)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Database & ORM:** PostgreSQL with Prisma. Prisma provides excellent type safety and works seamlessly with Next.js.
- **Authentication:** NextAuth.js (now Auth.js). It's the standard for Next.js and will be configured for email/password authentication only.
- **Payments (India-specific):**
    - **Primary:** Razorpay. Excellent API, widely used in India.
    - **Secondary:** Stripe (with full India support).
- **File Storage:** A cloud-based storage solution is essential for artwork images.
    - **Recommended:** AWS S3, Cloudinary, or Vercel Blob Storage.
- **Real-time Features (Auctions, Chat):**
    - **Recommended:** Pusher or Ably. Managed WebSocket services that simplify real-time communication.

---

### 2. Database Schema (Data Models)

Here are the core Prisma models we'll need.

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?   // Profile Picture URL
  password      String?   // For credentials-based login
  bio           String?
  isArtist      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  artworks      Artwork[]
  bids          Bid[]
  orders        Order[]
  posts         Post[]
  comments      Comment[]
  memberships   CommunityMember[]
  accounts      Account[]
  sessions      Session[]
}

model Artwork {
  id          String   @id @default(cuid())
  title       String
  description String
  imageUrl    String
  price       Float    // For direct sale
  status      ArtStatus @default(FOR_SALE) // e.g., FOR_SALE, IN_AUCTION, SOLD
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  artistId    String
  artist      User     @relation(fields: [artistId], references: [id])
  
  auction     Auction?
  order       Order?
}

enum ArtStatus {
  FOR_SALE
  IN_AUCTION
  SOLD
}

model Auction {
  id          String   @id @default(cuid())
  startingBid Float
  currentBid  Float
  startTime   DateTime
  endTime     DateTime
  status      AuctionStatus @default(ACTIVE)

  artworkId   String   @unique
  artwork     Artwork  @relation(fields: [artworkId], references: [id])
  bids        Bid[]
}

enum AuctionStatus {
  ACTIVE
  ENDED
  CANCELLED
}

model Bid {
  id        String   @id @default(cuid())
  amount    Float
  createdAt DateTime @default(now())

  auctionId String
  auction   Auction  @relation(fields: [auctionId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model Order {
  id          String      @id @default(cuid())
  amount      Float
  paymentId   String      @unique // From Razorpay/Stripe
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())

  buyerId     String
  buyer       User        @relation(fields: [buyerId], references: [id])
  artworkId   String      @unique
  artwork     Artwork     @relation(fields: [artworkId], references: [id])
}

enum OrderStatus {
  PENDING
  COMPLETED
  FAILED
}

model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  creatorId   String
  createdAt   DateTime @default(now())

  posts       Post[]
  members     CommunityMember[]
}

model Post {
  id        String    @id @default(cuid())
  title     String
  content   Json?
  createdAt DateTime  @default(now())

  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  communityId String
  community   Community @relation(fields: [communityId], references: [id])
  comments    Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  text      String
  createdAt DateTime @default(now())

  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
}

model CommunityMember {
  id          String   @id @default(cuid())
  communityId String
  community   Community @relation(fields: [communityId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  @@unique([communityId, userId])
}

// Models for NextAuth.js
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String? 
  access_token       String? 
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? 
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 3. Phased Development Plan

#### Phase 1: Foundation & Setup
1.  **Project Initialization:**
    - `npx create-next-app@latest .` (already done)
    - `npx shadcn-ui@latest init`
2.  **Dependency Installation:**
    - `npm install prisma @prisma/client`
    - `npm install next-auth`
    - `npm install @auth/prisma-adapter`
    - `npm install razorpay`
3.  **Setup Prisma:**
    - `npx prisma init`
    - Add schema models to `prisma/schema.prisma`.
    - `npx prisma db push` to sync schema with the database.
4.  **Setup Authentication:**
    - Configure NextAuth.js with the Prisma adapter and at least one provider (e.g., Email or Google).
    - Create login, logout, and signup flows and pages.
5.  **Basic Layout:**
    - Create a main layout (`app/layout.tsx`) with a Navbar and Footer using `shadcn/ui` components.

#### Phase 2: User Profiles & Artist Features
1.  **User Profile Page:**
    - Create a dynamic page `app/profile/[userId]/page.tsx`.
    - Display user information (bio, name, artworks).
    - Create an "Edit Profile" page for authenticated users.
2.  **Artist Onboarding:**
    - Create a form for users to apply to become an artist.
    - Build an admin-only interface to approve artist requests (for now, this can be a manual database flag change).
3.  **Artist Dashboard:**
    - Create a new section `/dashboard` for artists.
    - **CRUD for Artworks:**
        - Form to upload new artwork (`title`, `description`, `price`, `image`).
        - Logic to upload the image file to Vercel Blob or S3.
        - View, edit, and delete existing artworks.

#### Phase 3: Marketplace & Purchasing
1.  **Browse Artworks Page:**
    - Create a main marketplace page (`/`) to display all artworks `FOR_SALE`.
    - Implement filtering (by artist, price range) and sorting.
2.  **Artwork Detail Page:**
    - Create a dynamic page `app/artwork/[artworkId]/page.tsx`.
    - Display detailed information, artist profile link, and a "Buy Now" button.
3.  **Payment Integration:**
    - On "Buy Now" click, create an order in the database with `PENDING` status.
    - Call the Razorpay API to create a payment order.
    - Use the Razorpay Web Checkout SDK on the client-side.
    - Create a webhook (`app/api/payment-webhook/route.ts`) to listen for successful payment events from Razorpay to securely update the order status to `COMPLETED` and the artwork status to `SOLD`.

#### Phase 4: Auctions
1.  **Auction Creation:**
    - Add an option in the Artist Dashboard to list an artwork for auction instead of direct sale, specifying `startingBid` and `endTime`.
2.  **Auction Detail Page:**
    - Display auction status, current bid, and time remaining.
    - Show a real-time list of bids.
3.  **Real-time Bidding:**
    - When a user places a bid, send it to the server via an API route.
    - The server validates the bid (e.g., > current bid).
    - Use Pusher/Ably to broadcast the new bid to all clients viewing that auction page, updating the UI in real-time.
4.  **Auction Conclusion:**
    - Use a cron job (e.g., Vercel Cron Jobs) to check for auctions whose `endTime` has passed.
    - When an auction ends, determine the winner, and create a `PENDING` order for them. Notify the winner to complete the payment.

#### Phase 5: Communities & Social Features
1.  **Community Management:**
    - Allow users to create and discover communities.
    - Page to display a community's posts and members.
    - Join/leave community functionality.
2.  **Posts & Comments:**
    - Within a community, allow members to create posts (with a rich text editor if desired).
    - Allow users to comment on posts.
    - This can be extended with real-time chat features using the same WebSocket service from auctions.

---

### 4. Proposed File Structure

```
/
├── app/
│   ├── (auth)/             # Route group for auth pages
│   │   ├── login/page.tsx
│   │   └── ...
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── payment-webhook/route.ts
│   ├── artwork/
│   │   └── [artworkId]/page.tsx
│   ├── community/
│   │   └── [communityId]/page.tsx
│   ├── dashboard/          # Artist dashboard
│   │   └── page.tsx
│   ├── profile/
│   │   └── [userId]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Homepage / Marketplace
├── components/
│   ├── ui/                 # shadcn-ui components
│   ├── auth-button.tsx
│   ├── artwork-card.tsx
│   └── navbar.tsx
├── lib/
│   ├── auth.ts             # NextAuth options
│   ├── db.ts               # Prisma client instance
│   ├── razorpay.ts         # Razorpay client instance
│   └── utils.ts            # Helper functions
├── prisma/
│   └── schema.prisma
└── ... (config files)
```

---

### 5. Next Steps

1.  **Start with Phase 1:** Set up the technical foundation. This is the most critical part.
2.  **Implement Incrementally:** Follow the phases, building and testing each feature block before moving to the next.
3.  **Testing:** For a project of this scale, consider adding automated tests using Jest/Vitest for unit tests and Playwright/Cypress for end-to-end tests.
4.  **Deployment:** Deploy early and often using a platform like Vercel, which is optimized for Next.js.
