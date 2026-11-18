-- AlterTable
ALTER TABLE "Presensi" ADD COLUMN IF NOT EXISTS "jenis_presensi" TEXT;
ALTER TABLE "Presensi" ADD COLUMN IF NOT EXISTS "lokasi" TEXT;

