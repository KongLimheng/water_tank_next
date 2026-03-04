/*
  Warnings:

  - You are about to drop the column `facebookUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "facebookUrl",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "socials" JSONB;
