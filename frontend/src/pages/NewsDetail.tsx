import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { newsApi } from "../lib/api";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["news", slug],
    queryFn: () => newsApi.getBySlug(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Berita tidak ditemukan</h2>
        <Link to="/news" className="btn-primary">
          Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/news" className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Berita
      </Link>

      {data.coverImage && (
        <img
          src={data.coverImage}
          alt={data.title}
          className="w-full h-72 object-cover rounded-xl mb-8"
        />
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          {data.publishedAt ? format(new Date(data.publishedAt), "d MMMM yyyy", { locale: id }) : "-"}
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-primary-800 mb-6 leading-tight">{data.title}</h1>

      {data.excerpt && (
        <p className="text-lg text-gray-600 border-l-4 border-gold-400 pl-4 mb-8 italic">{data.excerpt}</p>
      )}

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
        {data.content}
      </div>
    </article>
  );
}
