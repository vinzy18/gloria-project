import { BookOpen, Heart, Users } from "lucide-react";
import LogoGMIM from "../components/LogoGMIM";

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <LogoGMIM width={250} height={250} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang GMIM Gloria</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Mengenal lebih jauh tentang siapa kami, sejarah, dan tujuan pelayanan kami
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Sejarah Gereja</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Gereja Gloria berdiri pada tahun 1985, bermula dari sebuah kelompok persekutuan kecil yang dirintis oleh
                  beberapa keluarga Kristen di wilayah Jakarta Selatan. Dengan iman dan kerja keras, persekutuan ini
                  berkembang menjadi jemaat yang semakin besar.
                </p>
                <p>
                  Pada tahun 1990, gereja secara resmi mendapatkan gedung sendiri dan ditahbiskan sebagai Gereja Gloria.
                  Sejak saat itu, gereja terus bertumbuh dan berkembang, dengan berbagai program pelayanan yang semakin
                  beragam.
                </p>
                <p>
                  Kini, Gereja Gloria telah melayani lebih dari 500 kepala keluarga dan terus berkomitmen untuk menjadi
                  rumah rohani bagi setiap jiwa yang mencari Tuhan.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-primary-100 rounded-2xl h-72 flex items-center justify-center">
                <LogoGMIM width={128} height={128} className="opacity-40" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gold-400 text-primary-900 rounded-xl p-4 font-bold text-center">
                <div className="text-3xl">40+</div>
                <div className="text-sm">Tahun Melayani</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Visi & Misi</h2>
            <p className="section-subtitle">Landasan pelayanan kami</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary-800 text-white rounded-2xl p-8">
              <BookOpen className="w-10 h-10 text-gold-300 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Visi</h3>
              <p className="text-gray-300 leading-relaxed">
                Menjadi gereja yang bertumbuh dalam iman, bersatu dalam kasih, dan berbuah dalam pelayanan — sebagai
                terang dan garam dunia yang memuliakan nama Tuhan Yesus Kristus di segala bidang kehidupan.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <Heart className="w-10 h-10 text-primary-700 mb-4" />
              <h3 className="text-2xl font-bold text-primary-800 mb-4">Misi</h3>
              <ul className="space-y-3 text-gray-600">
                {[
                  "Memberitakan Injil keselamatan kepada semua orang",
                  "Mendewasakan jemaat melalui pengajaran Firman Tuhan",
                  "Membangun persekutuan yang saling mengasihi dan mendukung",
                  "Melayani masyarakat dengan kasih Kristus yang nyata",
                  "Mendukung pekerjaan misi lokal dan internasional",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai-nilai */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Nilai-nilai Kami</h2>
            <p className="section-subtitle">Prinsip yang kami pegang teguh</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <BookOpen className="w-8 h-8" />, title: "Alkitabiah", desc: "Firman Tuhan adalah otoritas tertinggi dalam kehidupan dan pelayanan kami" },
              { icon: <Heart className="w-8 h-8" />, title: "Kasih", desc: "Mengasihi Tuhan dan sesama adalah perintah utama yang kami jalankan" },
              { icon: <Users className="w-8 h-8" />, title: "Komunitas", desc: "Kami percaya bahwa bertumbuh bersama lebih kuat daripada bertumbuh sendiri" },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl bg-primary-50 border border-primary-100">
                <div className="text-primary-700 mb-3 flex justify-center">{item.icon}</div>
                <h3 className="font-bold text-primary-800 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Ibadah */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Jadwal Ibadah</h2>
            <p className="text-gray-300">Bergabunglah bersama kami setiap minggunya</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { day: "Minggu", time: "08.00 WIB", label: "Ibadah Umum Pertama" },
              { day: "Minggu", time: "10.30 WIB", label: "Ibadah Umum Kedua" },
              { day: "Sabtu", time: "17.00 WIB", label: "Ibadah Pemuda" },
            ].map((item) => (
              <div key={item.label} className="bg-primary-700 rounded-xl p-6 text-center">
                <p className="text-gold-300 font-semibold">{item.day}</p>
                <p className="text-3xl font-bold my-2">{item.time}</p>
                <p className="text-gray-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
