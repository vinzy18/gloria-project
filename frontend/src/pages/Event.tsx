import { useQuery } from "@tanstack/react-query";
import { eventsApi, type Event } from "../lib/api";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function EventCard({ item }: { item: Event }) {
  const start = new Date(item.startDate);
  const end = item.endDate ? new Date(item.endDate) : null;
  const isMultiDay = end && format(start, "yyyy-MM-dd") !== format(end, "yyyy-MM-dd");

  return (
    <div className="card">
      {item.coverImage ? (
        <img src={item.coverImage} alt={item.title} className="w-full h-52 object-cover" />
      ) : (
        <div className="w-full h-52 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
          <Calendar className="w-16 h-16 text-primary-300" />
        </div>
      )}
      <div className="p-6">
        {/* Date badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-primary-700 text-white rounded-lg px-3 py-1.5 text-center">
            <div className="text-2xl font-bold leading-none">{format(start, "d")}</div>
            <div className="text-xs uppercase">{format(start, "MMM yyyy", { locale: id })}</div>
          </div>
          {isMultiDay && end && (
            <>
              <span className="text-gray-400">—</span>
              <div className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-center">
                <div className="text-2xl font-bold leading-none">{format(end, "d")}</div>
                <div className="text-xs uppercase">{format(end, "MMM yyyy", { locale: id })}</div>
              </div>
            </>
          )}
        </div>

        <h3 className="font-bold text-primary-800 text-xl mb-2">{item.title}</h3>

        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>
              {format(start, "HH.mm")} WIB
              {end && !isMultiDay && ` – ${format(end, "HH.mm")} WIB`}
            </span>
          </div>
          {item.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>{item.location}</span>
            </div>
          )}
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default function EventPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list().then((r) => r.data),
  });

  return (
    <>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Calendar className="w-12 h-12 text-gold-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kegiatan & Event</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Jadwal kegiatan dan acara-acara spesial Gereja Gloria
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-700" />
              <p className="mt-4 text-gray-500">Memuat kegiatan...</p>
            </div>
          )}
          {isError && (
            <div className="text-center py-20 text-red-500">Gagal memuat data. Silakan coba lagi.</div>
          )}
          {data && data.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Belum ada kegiatan yang terjadwal saat ini.
            </div>
          )}
          {data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((item) => (
                <EventCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
