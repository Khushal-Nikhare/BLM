-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "googlePlaceId" TEXT,
    "businessName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "website" TEXT,
    "googleMapsLink" TEXT,
    "rating" DOUBLE PRECISION,
    "callStatus" TEXT NOT NULL DEFAULT 'Not Called',
    "notes" TEXT NOT NULL DEFAULT '',
    "meetingDate" TIMESTAMP(3),
    "callLaterDate" TIMESTAMP(3),
    "tag" TEXT NOT NULL DEFAULT 'New Lead',
    "interestStatus" TEXT NOT NULL DEFAULT 'Pending',
    "searchKeyword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_googlePlaceId_key" ON "Lead"("googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
