-- CreateTable
CREATE TABLE "DiscountTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discountId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscountTier_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "VolumeDiscount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VolumeDiscount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "productIds" TEXT,
    "collectionIds" TEXT,
    "customerTags" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "minOrderAmount" REAL,
    "maxDiscountAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VolumeDiscount" ("createdAt", "description", "discountType", "discountValue", "id", "isActive", "maxQuantity", "minQuantity", "productIds", "shop", "title", "updatedAt") SELECT "createdAt", "description", "discountType", "discountValue", "id", "isActive", "maxQuantity", "minQuantity", "productIds", "shop", "title", "updatedAt" FROM "VolumeDiscount";
DROP TABLE "VolumeDiscount";
ALTER TABLE "new_VolumeDiscount" RENAME TO "VolumeDiscount";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DiscountTier_discountId_idx" ON "DiscountTier"("discountId");
