import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { wartaApi, eventsApi, type Warta, type Event } from "../lib/api";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function HeroSection() {
  return (
    <section className="relative bg-primary-800 text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600')" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <p className="text-gold-300 font-semibold tracking-widest uppercase text-sm mb-6">We’re grateful to have you here</p>
        <h1 className="text-5xl md:text-7xl font-bold mb-1 leading-tight bg-gradient-to-r from-white to-gold-600 bg-clip-text text-transparent">GMIM Gloria</h1>
        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Jakarta Selatan</h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
          "Terpujilah Allah karena hikmat-Nya besar. Kemuliaan hanya bagi Tuhan"
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
            Tentang Kami <ChevronRight className="w-4 h-4" />
          </Link>
          <Link to="/event" className="btn-outline border-white text-white hover:bg-white hover:text-primary-800 inline-flex items-center gap-2">
            Jadwal Ibadah <Calendar className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Service times strip */}
      <div className="relative bg-primary-900/80 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-gold-300" />
            <span><strong className="text-white">Ibadah Minggu Pertama:</strong> 10.00 WIB</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-gold-300" />
            <span><strong className="text-white">Ibadah Minggu Kedua:</strong> 17.30 WIB</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WartaCard({ item }: { item: Warta }) {
  return (
    <div className="card">
      {item.coverImage && (
        <img src={item.coverImage} alt={item.title} className="w-full h-48 object-cover" />
      )}
      {!item.coverImage && (
        <div className="w-full h-48 bg-primary-100 flex items-center justify-center">
          <span className="text-primary-300 text-4xl font-bold">{item.title.charAt(0)}</span>
        </div>
      )}
      <div className="p-5">
        <p className="text-xs text-gold-500 font-semibold uppercase tracking-wide mb-1">
          {item.publishedAt ? format(new Date(item.publishedAt), "d MMMM yyyy", { locale: id }) : ""}
        </p>
        <h3 className="font-bold text-primary-800 text-lg mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.excerpt}</p>
        <Link
          to={`/warta/${item.slug}`}
          className="text-primary-700 font-semibold text-sm hover:text-primary-900 inline-flex items-center gap-1"
        >
          Baca selengkapnya <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function EventCard({ item }: { item: Event }) {
  const start = new Date(item.startDate);
  return (
    <div className="flex gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="bg-primary-700 text-white rounded-lg p-3 text-center min-w-[60px] flex flex-col items-center">
        <span className="text-2xl font-bold leading-none">{format(start, "d")}</span>
        <span className="text-xs uppercase">{format(start, "MMM", { locale: id })}</span>
      </div>
      <div>
        <h4 className="font-bold text-primary-800">{item.title}</h4>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <Clock className="w-3 h-3" />
          <span>{format(start, "HH.mm")} WIB</span>
        </div>
        {item.location && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: wartaData } = useQuery({
    queryKey: ["warta"],
    queryFn: () => wartaApi.list().then((r) => r.data),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list().then((r) => r.data),
  });

  const latestWarta = wartaData?.slice(0, 3) ?? [];
  const upcomingEvents = eventsData?.slice(0, 4) ?? [];

  return (
    <>
      <HeroSection />

      {/* Welcome */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Selamat Datang di Keluarga Kami</h2>
          <p className="section-subtitle">Bergabunglah bersama kami dalam perjalanan iman yang penuh kasih</p>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Gereja Gloria adalah komunitas iman yang berdiri dengan fondasi kasih Kristus. Kami percaya bahwa setiap
            orang berhak merasakan kasih Tuhan dan bertumbuh dalam iman. Bersama-sama kita membangun tubuh Kristus
            yang kuat, saling mendukung, dan menjadi terang bagi dunia.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: "🙏", title: "Beribadah", desc: "Hadir dalam ibadah dan rasakan kehadiran Tuhan yang nyata" },
              { icon: "❤️", title: "Bersekutu", desc: "Bangun relasi yang bermakna dengan sesama anggota jemaat" },
              { icon: "🌟", title: "Melayani", desc: "Gunakan karunia Anda untuk melayani Tuhan dan sesama" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-primary-800 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Warta */}
      {latestWarta.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="section-title">Warta Terbaru</h2>
                <p className="text-gray-500">Info & warta jemaat terkini</p>
              </div>
              <Link to="/warta" className="btn-outline text-sm">
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestWarta.map((item) => (
                <WartaCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="section-title">Kegiatan Mendatang</h2>
                <p className="text-gray-500">Jangan lewatkan acara spesial kami</p>
              </div>
              <Link to="/event" className="btn-outline text-sm">
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((item) => (
                <EventCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ingin Bergabung dengan Jemaat Kami?</h2>
          <p className="text-gray-300 mb-8">
            Kami dengan terbuka menyambut Anda. Datanglah dan rasakan kehangatan keluarga Gereja Gloria.
          </p>
          <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
            Pelajari Lebih Lanjut <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
