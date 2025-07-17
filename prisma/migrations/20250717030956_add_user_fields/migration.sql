-- CreateEnum
CREATE TYPE "ArtStatus" AS ENUM ('FOR_SALE', 'IN_AUCTION', 'SOLD');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ArtistApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "bio" TEXT,
    "isArtist" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artwork" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "ArtStatus" NOT NULL DEFAULT 'FOR_SALE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "startingBid" DOUBLE PRECISION NOT NULL,
    "currentBid" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'ACTIVE',
    "artworkId" TEXT NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "bio" TEXT NOT NULL,
    "status" "ArtistApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_artworkId_key" ON "Auction"("artworkId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_artworkId_key" ON "Order"("artworkId");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistApplication_userId_key" ON "ArtistApplication"("userId");

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistApplication" ADD CONSTRAINT "ArtistApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
