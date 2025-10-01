import { useEffect, useState } from "react";
import Layout from "./AppLayout"; // Layout-komponentti

type Absence = {
  id: string;
  employeeName: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "odottaa" | "hyväksytty" | "hylätty" | "palautettu" | string;
  esihenkiloId: string | null;
  approvedDate?: string | null;
};

const ManagerView = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  // Käyttäjä localStoragesta
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔒 Tarkista rooli
  useEffect(() => {
    if (user.rooli !== "esihenkilo") {
      setUnauthorized(true);
    }
  }, [user.rooli]);

  // Hae poissaolot jos esihenkilö
  useEffect(() => {
    if (user.rooli === "esihenkilo") {
      const fetchAbsences = async () => {
        try {
          const res = await fetch("http://localhost:3001/api/absences");
          const data: Absence[] = await res.json();
          const filtered = data.filter(
            (a) => String(a.esihenkiloId) === String(user.id)
          );
          setAbsences(filtered);
        } catch (err) {
          console.error("Virhe poissaolojen haussa:", err);
        }
      };
      fetchAbsences();
    }
  }, [user.id, user.rooli]);

  const handleStatusUpdate = async (absenceId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/absences/${absenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Tilan päivitys epäonnistui");

      const updated = await res.json();
      setAbsences((prev) =>
        prev.map((a) =>
          a.id === absenceId
            ? { ...a, status: updated.status, approvedDate: updated.approvedDate }
            : a
        )
      );
    } catch (err) {
      console.error(err);
      alert("Poissaolon tilan päivitys epäonnistui.");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fi-FI");

  // Jos ei oikeuksia → näytetään virhesivu
  if (unauthorized) {
    return (
      <Layout>
        <div className="p-6 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ei käyttöoikeutta</h2>
          <p className="text-gray-700 mb-4">
            Tämä näkymä on tarkoitettu vain esihenkilöille.
          </p>
          <a
            href="/home"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Takaisin etusivulle
          </a>
        </div>
      </Layout>
    );
  }

  // Suodatus työntekijän perusteella
  const filteredAbsences = filterEmployee
    ? absences.filter((a) => a.employeeName === filterEmployee)
    : absences;

  const employees = Array.from(new Set(absences.map((a) => a.employeeName)));

  const columns = {
    odottaa: filteredAbsences.filter((a) => a.status === "odottaa"),
    hyväksytty: filteredAbsences.filter(
      (a) => a.status === "hyväksytty" || a.reason === "työmatka"
    ),
    hylätty: filteredAbsences.filter((a) => a.status === "hylätty"),
    palautettu: filteredAbsences.filter((a) => a.status === "palautettu"),
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Esihenkilön näkymä</h2>

        {/* Suodatus */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Suodata työntekijän mukaan:</label>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-60"
          >
            <option value="">Kaikki</option>
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>

        {/* Kolumnit */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Odottavat */}
          <section className="border rounded p-4 bg-white/90 shadow-sm">
            <h3 className="font-semibold mb-3">Odottavat</h3>
            <div className="flex flex-col gap-4">
              {columns.odottaa.length === 0 ? (
                <div className="text-sm text-gray-500">Ei odottavia hakemuksia</div>
              ) : (
                columns.odottaa.map((a) => (
                  <article
                    key={a.id}
                    className="p-3 border rounded shadow-sm flex flex-col gap-2 min-w-[220px] max-w-full"
                  >
                    <div className="font-medium">{a.employeeName}</div>
                    <div className="text-gray-600">
                      {a.reason} — {formatDate(a.startDate)} – {formatDate(a.endDate)}
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <button
                        className="flex-1 bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 text-xs"
                        onClick={() => handleStatusUpdate(a.id, "hyväksytty")}
                      >
                        Hyväksy
                      </button>
                      <button
                        className="flex-1 bg-pink-500 text-white px-2 py-1 rounded hover:bg-pink-600 text-xs"
                        onClick={() => handleStatusUpdate(a.id, "hylätty")}
                      >
                        Hylkää
                      </button>
                      <button
                        className="flex-1 bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 text-xs"
                        onClick={() => handleStatusUpdate(a.id, "palautettu")}
                      >
                        Palauta
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Hyväksytyt */}
          <section className="border rounded p-4 bg-white/90 shadow-sm">
            <h3 className="font-semibold mb-3">Hyväksytyt</h3>
            <div className="flex flex-col gap-4">
              {columns.hyväksytty.length === 0 ? (
                <div className="text-sm text-gray-500">Ei hyväksyttyjä</div>
              ) : (
                columns.hyväksytty.map((a) => (
                  <article
                    key={a.id}
                    className="p-3 border rounded bg-purple-50 text-sm shadow-sm min-w-[220px] max-w-full"
                  >
                    <div className="font-medium">{a.employeeName}</div>
                    <div className="text-gray-600">
                      {a.reason} — {formatDate(a.startDate)} – {formatDate(a.endDate)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Hylätyt */}
          <section className="border rounded p-4 bg-white/90 shadow-sm">
            <h3 className="font-semibold mb-3">Hylätyt</h3>
            <div className="flex flex-col gap-4">
              {columns.hylätty.length === 0 ? (
                <div className="text-sm text-gray-500">Ei hylättyjä</div>
              ) : (
                columns.hylätty.map((a) => (
                  <article
                    key={a.id}
                    className="p-3 border rounded bg-red-50 text-sm shadow-sm min-w-[220px] max-w-full"
                  >
                    <div className="font-medium">{a.employeeName}</div>
                    <div className="text-gray-600">
                      {a.reason} — {formatDate(a.startDate)} – {formatDate(a.endDate)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Palautetut */}
          <section className="border rounded p-4 bg-white/90 shadow-sm">
            <h3 className="font-semibold mb-3">Palautetut</h3>
            <div className="flex flex-col gap-4">
              {columns.palautettu.length === 0 ? (
                <div className="text-sm text-gray-500">Ei palautettuja</div>
              ) : (
                columns.palautettu.map((a) => (
                  <article
                    key={a.id}
                    className="p-3 border rounded bg-yellow-50 text-sm shadow-sm min-w-[220px] max-w-full"
                  >
                    <div className="font-medium">{a.employeeName}</div>
                    <div className="text-gray-600">
                      {a.reason} — {formatDate(a.startDate)} – {formatDate(a.endDate)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerView;
