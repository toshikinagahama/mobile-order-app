-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Food',
    "calories" INTEGER,
    "alcoholContent" REAL,
    "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '点',
    "quantityStep" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Product" ("createdAt", "id", "imageUrl", "isSoldOut", "name", "price", "updatedAt") SELECT "createdAt", "id", "imageUrl", "isSoldOut", "name", "price", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
