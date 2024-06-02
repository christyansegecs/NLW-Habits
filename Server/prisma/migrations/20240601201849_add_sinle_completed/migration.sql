-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_single_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "day_id" TEXT NOT NULL,
    CONSTRAINT "single_tasks_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "days" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_single_tasks" ("created_at", "date", "day_id", "id", "title") SELECT "created_at", "date", "day_id", "id", "title" FROM "single_tasks";
DROP TABLE "single_tasks";
ALTER TABLE "new_single_tasks" RENAME TO "single_tasks";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
