import { PrismaClient, Role, Jekel } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 1. Create 8 official dormitories (Gedung A-E: Putri, Gedung F-H: Putra)
  const gedungsData = [
    { id: 'gedung-a', nama: 'RPX' },
    { id: 'gedung-b', nama: 'Rusunawa' },
    { id: 'gedung-c', nama: 'PUPERA C (Putri)' },
    { id: 'gedung-d', nama: 'Menpera' },
    { id: 'gedung-e', nama: 'Roesma M. Sjaaf' },
    { id: 'gedung-f', nama: 'Orange' },
    { id: 'gedung-g', nama: 'Hijau' },
    { id: 'gedung-h', nama: 'PUPERA H (Putra)' },
  ]

  for (const g of gedungsData) {
    await prisma.gedung.upsert({
      where: { id: g.id },
      update: { nama: g.nama },
      create: { id: g.id, nama: g.nama },
    })
  }
  console.log(`Upserted ${gedungsData.length} gedungs`)

  // 2. Create official rooms (kamar)
  const kamarsData = [
    { no_kamar: 'A-101', lantai: 1, gedung_id: 'gedung-a' },
    { no_kamar: 'A-102', lantai: 1, gedung_id: 'gedung-a' },
    { no_kamar: 'B-101', lantai: 1, gedung_id: 'gedung-b' },
    { no_kamar: 'C-301', lantai: 3, gedung_id: 'gedung-c' },
    { no_kamar: 'C-302', lantai: 3, gedung_id: 'gedung-c' },
    { no_kamar: 'D-101', lantai: 1, gedung_id: 'gedung-d' },
    { no_kamar: 'E-101', lantai: 1, gedung_id: 'gedung-e' },
    { no_kamar: 'F-201', lantai: 2, gedung_id: 'gedung-f' },
    { no_kamar: 'G-101', lantai: 1, gedung_id: 'gedung-g' },
    { no_kamar: 'G-102', lantai: 1, gedung_id: 'gedung-g' },
    { no_kamar: 'H-101', lantai: 1, gedung_id: 'gedung-h' },
  ]

  for (const k of kamarsData) {
    await prisma.kamar.upsert({
      where: { no_kamar: k.no_kamar },
      update: { lantai: k.lantai, gedung_id: k.gedung_id },
      create: { no_kamar: k.no_kamar, lantai: k.lantai, gedung_id: k.gedung_id },
    })
  }
  console.log(`Upserted ${kamarsData.length} kamars`)

  // 3. Create / upsert real users
  const usersData = [
    {
      nama: 'Dr. Hendra Wijaya, M.Kom',
      email: 'admin@unand.ac.id',
      nim: '123456',
      password: hashedPassword,
      role: Role.ADMIN,
      jekel: Jekel.LAKI_LAKI,
      asal: 'Padang',
      nomor_kamar: null,
    },
    {
      nama: 'Rahmat Hidayat, S.T.',
      email: 'fasil@unand.ac.id',
      nim: '123457',
      password: hashedPassword,
      role: Role.PENGURUS,
      jekel: Jekel.LAKI_LAKI,
      asal: 'Padang',
      nomor_kamar: null,
    },
    {
      nama: 'Ahmad Fauzi',
      email: 'penghuni@unand.ac.id',
      nim: '2111012345',
      password: hashedPassword,
      role: Role.PENGHUNI,
      jekel: Jekel.LAKI_LAKI,
      asal: 'Padang Panjang',
      nomor_kamar: 'G-102',
    },
    {
      nama: 'Siti Rahmawati',
      email: 'siti@unand.ac.id',
      nim: '2111012346',
      password: hashedPassword,
      role: Role.PENGHUNI,
      jekel: Jekel.PEREMPUAN,
      asal: 'Bukittinggi',
      nomor_kamar: 'A-101',
    },
    {
      nama: 'Budi Pratama',
      email: 'budi@unand.ac.id',
      nim: '2111012347',
      password: hashedPassword,
      role: Role.PENGHUNI,
      jekel: Jekel.LAKI_LAKI,
      asal: 'Payakumbuh',
      nomor_kamar: 'F-201',
    },
    {
      nama: 'Dinda Lestari',
      email: 'dinda@unand.ac.id',
      nim: '2111012348',
      password: hashedPassword,
      role: Role.PENGHUNI,
      jekel: Jekel.PEREMPUAN,
      asal: 'Solok',
      nomor_kamar: 'C-302',
    },
  ]

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        nama: u.nama,
        nim: u.nim,
        password: u.password,
        role: u.role,
        jekel: u.jekel,
        asal: u.asal,
        nomor_kamar: u.nomor_kamar,
      },
      create: u,
    })
  }

  console.log(`Upserted ${usersData.length} users with official dorms & rooms`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
