import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { newsApi, type News } from "../lib/api";
import { Calendar, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function NewsCard({ item }: { item: News }) {
  return (
    <div className="card group">
      <div className="overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-52 bg-primary-100 flex items-center justify-center">
            <Newspaper className="w-16 h-16 text-primary-300" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Calendar className="w-3 h-3" />
          <span>
            {item.publishedAt ? format(new Date(item.publishedAt), "d MMMM yyyy", { locale: id }) : "-"}
          </span>
        </div>
        <h2 className="font-bold text-primary-800 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {item.title}
        </h2>
        {item.excerpt && <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.excerpt}</p>}
        <Link
          to={`/news/${item.slug}`}
          className="inline-block bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Baca Selengkapnya
        </Link>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["news"],
    queryFn: () => newsApi.list().then((r) => r.data),
  });

  return (
    <>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Newspaper className="w-12 h-12 text-gold-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita & Warta</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Informasi terkini seputar kegiatan dan kabar dari Gereja Gloria
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-700" />
              <p className="mt-4 text-gray-500">Memuat berita...</p>
            </div>
          )}
          {isError && (
            <div className="text-center py-20 text-red-500">
              Gagal memuat berita. Silakan coba lagi.
            </div>
          )}
          {data && data.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Belum ada berita yang dipublikasikan.
            </div>
          )}
          {data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
