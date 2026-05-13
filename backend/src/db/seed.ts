import { db } from "./index";
import { users, news, events, bpmj, jemaat, pelsus } from "./schema";
import bcrypt from "bcryptjs";

console.log("Seeding database...");

// Create admin user
const passwordHash = await bcrypt.hash("admin123", 10);
await db.insert(users).values({
  username: "admin",
  passwordHash,
  role: "admin",
}).onConflictDoNothing();

// Seed bpmj
await db.insert(bpmj).values([
  { name: "Pdt. Dr. Cherly Lora Nirwana Naray M.Th", position: "Ketua Jemaat", displayOrder: 1 },
  { name: "Pnt. Ir Jelfina Costansje Alouw, M.Sc, PhD", position: "Wakil Ketua Jemaat", displayOrder: 2 },
  { name: "Pnt. Indah Jelita Sondakh, S.Th", position: "Sekretaris Jemaat", displayOrder: 3 },
  { name: "Pnt. dr George Arthur Mantiri MLM SpPK(K)", position: "Wakil Sekretaris Jemaat", displayOrder: 4 },
  { name: "Dkn. Beatrix V Kolanus", position: "Bendahara", displayOrder: 5 },
  { name: "Dkn. Jilly Stephanie Tuturoong, S.Kom", position: "Wakil Bendahara", displayOrder: 6 },
  { name: "Pnt. Novi Dalos", position: "Anggota", displayOrder: 7 },
]).onConflictDoNothing();

// Seed pelsus
await db.insert(pelsus).values([
  { name: "Pdt. Dr. Cherly Lora Nirwana Naray M.Th", position: "Pendeta Ketua", pelayanan: "Pendeta" },
  { name: "Pdt Regina Jessica Gabriela Sumlang, S.Th", position: "Pendeta Pelayan", pelayanan: "Pendeta" },
  { name: "Pnt. dr George Arthur Mantiri MLM SpPK(K)", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 1" },
  { name: "Dkn. Marsha Rilya Rondo, SE", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 1" },
  { name: "Pnt. Tommy Efraim Nandito Lambuaso, SH", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 2" },
  { name: "Dkn. Beatrix V Kolanus", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 2" },
  { name: "Pnt. Jeanne Malingkas", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 3" },
  { name: "Dkn. Anita Porawouw", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 3" },
  { name: "Pnt. Harsen Roy Tampomuri, S.IP., M.A", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 4" },
  { name: "Pnt. Dedi Leonard Tarandung", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 5" },
  { name: "Dkn. Meyrcilia Angelina Jacobs, SE", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 5" },
  { name: "Pnt. Novi Dalos", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 6" },
  { name: "Dkn. Fandy Maurets Endey", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 6" },
  { name: "Pnt. Zefanya Yosua Jocom", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 7" },
  { name: "Dkn. Meidy Wawoh", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 7" },
  { name: "Pnt. Franiriette Hosrate Hosang", position: "Penatua", pelsus: "kolom", pelayanan: "Kolom 8" },
  { name: "Dkn. Jilly Stephanie Tuturoong, S.Kom", position: "Diaken", pelsus: "kolom", pelayanan: "Kolom 8" },
  { name: "Pnt. Daniel Andria Bonafides Sihombing", position: "Penatua", pelsus: "bipra", pelayanan: "PKB" },
  { name: "Pnt. Ir Jelfina Costansje Alouw, M.Sc, PhD", position: "Penatua", pelsus: "bipra", pelayanan: "WKI" },
  { name: "Pnt. Indah Jelita Sondakh, S.Th", position: "Penatua", pelsus: "bipra", pelayanan: "Pemuda" },
  { name: "Pnt. Kevinsy Johsua Monding, S.T", position: "Penatua", pelsus: "bipra", pelayanan: "Remaja" },
  { name: "Pnt. Rebecca Christy Adolfiane Mantiri", position: "Penatua", pelsus: "bipra", pelayanan: "ASM" },
]).onConflictDoNothing();

// Seed news
await db.insert(news).values([
  {
    title: "Pendaftaran Katekisasi Perdana 2026",
    slug: "pendaftaran-katekisasi-perdana-2026",
    excerpt: "Gereja Gloria membuka pendaftaran kelas katekisasi bagi anggota baru yang ingin belajar tentang Firman Tuhan.",
    content: "Gereja Gloria membuka pendaftaran Kelas Katekisasi Perdana 2026 mulai tanggal 6 April 2026. Kelas ini ditujukan bagi calon anggota jemaat baru dan warga gereja yang ingin memperdalam pengetahuan iman Kristen.\n\nKelas akan berlangsung setiap Senin pukul 19.00 - 21.00 WIB selama 3 bulan. Materi yang akan dibahas meliputi Alkitab, Pengakuan Iman, Sakramen, dan kehidupan bergereja.\n\nPendaftaran dapat dilakukan di sekretariat gereja atau melalui formulir online di website ini.",
    isPublished: true,
    publishedAt: new Date("2026-04-10"),
    authorId: 1,
  },
]).onConflictDoNothing();

// Seed events
await db.insert(events).values([
  {
    title: "Ibadah Minggu Pagi",
    description: "Ibadah rutin setiap minggu pagi. Diundang seluruh jemaat dan simpatisan untuk dapat beribadah bersama kami pada ibadah minggu pagi (disesdiakan makan siang sederhana setelah ibadah) .",
    location: "GMIM Gloria Jakarta Selatan",
    startDate: new Date("2025-01-05T08:00:00"),
    endDate: new Date("2999-12-31T10:00:00"),
    isActive: true,
  },
  {
    title: "Ibadah Minggu Pagi",
    description: "Ibadah rutin setiap minggu pagi. Diundang seluruh jemaat dan simpatisan untuk dapat beribadah bersama kami pada ibadah minggu sore (disesdiakan makan siang sederhana setelah ibadah) .",
    location: "GMIM Gloria Jakarta Selatan",
    startDate: new Date("2025-01-05T08:00:00"),
    endDate: new Date("2999-12-31T10:00:00"),
    isActive: true,
  },
  {
    title: "Glorious Service",
    description: "Ibadah Pemuda dan Remaja GMIM Gloria Jakarta Selatan setiap hari Jumat pukul 19.00",
    location: "GMIM Gloria Jakarta Selatan",
    startDate: new Date("2025-02-14T07:00:00"),
    endDate: new Date("2999-02-16T17:00:00"),
    isActive: true,
  },
]).onConflictDoNothing();

// Seed sample jemaat
await db.insert(jemaat).values([
  {
    idJemaat: "2605001",
    nama: "Matthew Jotham Katuuk",
    gender: "L",
    tempatLahir: "Batam",
    tanggalLahir: "2000-01-04",
    phone: "082284349943",
    email: "matthew@email.com",
    statusPernikahan: "Belum Menikah",
    kolom: "9",
    pekerjaan: "Karyawan Swasta",
    keluarga: "Waluyan (Mozad)",
    bipra: "Pemuda",
    isActive: true,
    joinDate: "1999-01-16",
  },
  {
    idJemaat: "2605002",
    nama: "Mozad Timothy Waluyan S.Si",
    gender: "L",
    tempatLahir: "Bandung",
    tanggalLahir: "1982-07-22",
    phone: "082345678901",
    email: "mozad@email.com",
    statusPernikahan: "Belum Menikah",
    kolom: "1",
    pekerjaan: "Karyawan Swasta",
    keluarga: "Katuuk (Matthew)",
    bipra: "Pemuda",
    isActive: true,
    joinDate: "2005-06-10",
  },
]).onConflictDoNothing();

console.log("Seeding completed!");
console.log("Admin credentials: username=admin, password=admin123");
process.exit(0);
