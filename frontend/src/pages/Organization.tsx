import { useQuery } from "@tanstack/react-query";
import { organizationApi, type Bpmj, type Pelsus } from "../lib/api";
import { Users } from "lucide-react";

function MemberCard({ name, position, photoUrl, subtitle }: {
  name: string;
  position: string;
  photoUrl: string | null;
  subtitle?: string | null;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary-100"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 ring-4 ring-primary-50">
          <Users className="w-10 h-10 text-primary-400" />
        </div>
      )}
      <h3 className="font-bold text-primary-800 text-lg leading-tight">{name}</h3>
      <p className="text-gold-600 font-semibold text-sm mt-1">{position}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-0.5 w-8 bg-gold-400" />
      <h2 className="text-2xl font-bold text-primary-800">{title}</h2>
      <div className="h-0.5 flex-1 bg-gray-200" />
    </div>
  );
}

function groupPelsusByCategory(members: Pelsus[]) {
  const groups: Record<string, Pelsus[]> = {};
  for (const m of members) {
    const key = m.pelsus ?? "Lainnya";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return groups;
}

export default function Organization() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organization"],
    queryFn: () => organizationApi.list().then((r) => r.data),
  });

  const pelsusGroups = data ? groupPelsusByCategory(data.pelsus) : {};

  return (
    <>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 text-gold-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Struktur Organisasi</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Mengenal BPMJ, Pendeta, dan Pelayan Khusus di GMIM Gloria Jakarta Selatan
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-700" />
            </div>
          )}
          {isError && (
            <div className="text-center py-20 text-red-500">Gagal memuat data. Silakan coba lagi.</div>
          )}

          {data && (
            <>
              {/* BPMJ Section */}
              {data.bpmj.length > 0 && (
                <div className="mb-14">
                  <SectionHeader title="Badan Pekerja Majelis Jemaat (BPMJ)" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {data.bpmj.map((m: Bpmj) => (
                      <MemberCard key={m.id} name={m.name} position={m.position} photoUrl={m.photoUrl} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pendeta Section */}
              {
                data.pelsus.some((m) => m.pelayanan === "Pendeta") && (
                  <div className="mb-14">
                    <SectionHeader title="Pendeta" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {data.pelsus
                        .filter((m) => m.pelayanan === "Pendeta")
                        .map((m) => (
                          <MemberCard key={m.id} name={m.name} position={m.position} photoUrl={m.photoUrl} subtitle={m.pelayanan} />
                        ))}
                    </div>
                  </div>
                )
              }

              {/* Pelsus Kolom Section */}
              {
                data.pelsus.some((m) => m.pelsus === "kolom") && (
                  <div className="mb-14">
                    <SectionHeader title="Pelayan Khusus Kolom" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {data.pelsus
                        .filter((m) => m.pelsus === "kolom")
                        .map((m) => (
                          <MemberCard key={m.id} name={m.name} position={m.position} photoUrl={m.photoUrl} subtitle={m.pelayanan} />
                        ))}
                    </div>
                  </div>
                )
              }

              {
                data.pelsus.some((m) => m.pelsus === "bipra") && (
                  <div className="mb-14">
                    <SectionHeader title="Pelayan Khusus BIPRA" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {data.pelsus
                        .filter((m) => m.pelsus === "bipra")
                        .map((m) => (
                          <MemberCard key={m.id} name={m.name} position={m.position} photoUrl={m.photoUrl} subtitle={m.pelayanan} />
                        ))}
                    </div>
                  </div>
                )
              }

              {data.bpmj.length === 0 && data.pelsus.length === 0 && (
                <div className="text-center py-20 text-gray-500">Data struktur organisasi belum tersedia.</div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
