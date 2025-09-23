/*
  Warnings:

  - Added the required column `esihenkiloId` to the `Absence` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Absence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "esihenkiloId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Absence" ("createdAt", "employeeId", "employeeName", "endDate", "id", "reason", "startDate", "status") SELECT "createdAt", "employeeId", "employeeName", "endDate", "id", "reason", "startDate", "status" FROM "Absence";
DROP TABLE "Absence";
ALTER TABLE "new_Absence" RENAME TO "Absence";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
