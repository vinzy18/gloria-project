import { useQuery } from "@tanstack/react-query";
import { organizationApi, type OrgMember } from "../lib/api";
import { Users } from "lucide-react";

function groupByDepartment(members: OrgMember[]) {
  const groups: Record<string, OrgMember[]> = {};
  for (const m of members) {
    const dept = m.department ?? "Umum";
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(m);
  }
  return groups;
}

function MemberCard({ member }: { member: OrgMember }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary-100"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 ring-4 ring-primary-50">
          <Users className="w-10 h-10 text-primary-400" />
        </div>
      )}
      <h3 className="font-bold text-primary-800 text-lg leading-tight">{member.name}</h3>
      <p className="text-gold-600 font-semibold text-sm mt-1">{member.position}</p>
    </div>
  );
}

export default function Organization() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organization"],
    queryFn: () => organizationApi.list().then((r) => r.data),
  });

  const groups = data ? groupByDepartment(data) : {};

  return (
    <>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 text-gold-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Struktur Organisasi</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Mengenal para hamba Tuhan yang melayani di Gereja Gloria
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
          {data && data.length === 0 && (
            <div className="text-center py-20 text-gray-500">Data struktur organisasi belum tersedia.</div>
          )}
          {Object.entries(groups).map(([dept, members]) => (
            <div key={dept} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-0.5 w-8 bg-gold-400" />
                <h2 className="text-2xl font-bold text-primary-800">{dept}</h2>
                <div className="h-0.5 flex-1 bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {members.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
