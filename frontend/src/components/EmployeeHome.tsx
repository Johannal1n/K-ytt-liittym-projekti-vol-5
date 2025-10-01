import { useEffect, useState } from "react";
import Layout from "./AppLayout";
import Header from "./Header";

interface Absence {
  id: string;
  employeeName: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  approvedDate?: string | null;
}

const reasonColors: Record<string, string> = {
  loma: "#4A90E2",
  saldovapaa: "#F5A623",
  työmatka: "#FF6D28",
  muu: "#9E9E9E",
};

const EmployeeHome = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/absences");
        if (!res.ok) throw new Error("Virhe poissaolojen haussa");
        const data: Absence[] = await res.json();
        const ownAbsences = data.filter(a => String(a.employeeId) === String(user.id));
        setAbsences(ownAbsences);

        // Laske käytetyt päivät syykohtaisesti
        const tempTotals: Record<string, number> = {};
        ownAbsences.forEach(a => {
          const start = new Date(a.startDate);
          const end = new Date(a.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          tempTotals[a.reason] = (tempTotals[a.reason] || 0) + days;
        });
        setTotals(tempTotals);
      } catch (err) {
        console.error("Virhe poissaolojen haussa:", err);
        setError("Poissaolojen haku epäonnistui");
      }
    };
    fetchAbsences();
  }, [user.id]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("fi-FI");

  return (
    <Layout>
      <div className="min-h-screen relative">
        <div className="relative z-10">
          <Header />
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Tervetuloa, {user.etunimi}!</h2>
              <button
                onClick={() => (window.location.href = "/form")}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Lähetä poissaolohakemus
              </button>
            </div>

            <h3 className="text-xl font-semibold mb-4">Omat poissaolot</h3>

            {error ? (
              <div className="text-red-600 font-medium my-4" role="alert">
                {error}
              </div>
            ) : absences.length === 0 ? (
              <p className="text-gray-600">Ei poissaoloja.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {absences.map(a => {
                  const color = reasonColors[a.reason] || "#9E9E9E";
                  return (
                    <li
                      key={a.id}
                      className="relative border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow"
                    >
                      <span
                        style={{ backgroundColor: color }}
                        className="absolute top-2 right-2 w-4 h-4 rounded-full"
                      />
                      <div className="font-medium text-lg">
                        {a.reason.charAt(0).toUpperCase() + a.reason.slice(1)}
                      </div>
                      <div className="text-gray-700 text-sm mb-1">
                        {formatDate(a.startDate)} – {formatDate(a.endDate)}
                      </div>
                      <div className="text-sm">
                        Tila: <strong>{a.status}</strong>
                      </div>
                      {a.status === "hyväksytty" && a.approvedDate && (
                        <div className="text-gray-600 text-sm">
                          Hyväksytty: {formatDate(a.approvedDate)}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Käytetyt päivät */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2">Vuoden käytetyt päivät:</h4>
              <ul className="space-y-1">
                {Object.entries(totals).map(([reason, days]) => (
                  <li key={reason} className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: reasonColors[reason] || "#9E9E9E" }}
                      className="w-3 h-3 rounded-full"
                    />
                    <span>
                      {reason.charAt(0).toUpperCase() + reason.slice(1)}: {days} pv
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeHome;
