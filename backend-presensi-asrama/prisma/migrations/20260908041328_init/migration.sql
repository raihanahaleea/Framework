-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PENGHUNI', 'FASIL', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusPresensi" AS ENUM ('HADIR', 'TERLAMBAT', 'TIDAK_HADIR', 'IZIN');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StatusIzin" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "asal" TEXT NOT NULL,
    "nomor_kamar" TEXT,
    "jekel" "JenisKelamin" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PENGHUNI',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presensi" (
    "id" SERIAL NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "status" "StatusPresensi" NOT NULL,
    "foto_wajah" TEXT,
    "keterangan" TEXT,
    "tanggal" DATE NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gedung" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "id_user" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,

    CONSTRAINT "gedung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kamar" (
    "no_kamar" TEXT NOT NULL,
    "lantai" INTEGER NOT NULL,
    "id_gedung" INTEGER NOT NULL,

    CONSTRAINT "kamar_pkey" PRIMARY KEY ("no_kamar")
);

-- CreateTable
CREATE TABLE "izin" (
    "id" SERIAL NOT NULL,
    "jenis_izin" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "bukti" TEXT,
    "status" "StatusIzin" NOT NULL DEFAULT 'PENDING',
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "izin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nim_key" ON "users"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "presensi" ADD CONSTRAINT "presensi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gedung" ADD CONSTRAINT "gedung_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar" ADD CONSTRAINT "kamar_id_gedung_fkey" FOREIGN KEY ("id_gedung") REFERENCES "gedung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "izin" ADD CONSTRAINT "izin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "izin" ADD CONSTRAINT "izin_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
