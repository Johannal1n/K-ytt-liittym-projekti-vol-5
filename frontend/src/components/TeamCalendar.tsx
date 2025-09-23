import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { View } from 'react-big-calendar';
import Layout from './AppLayout';

type Absence = {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  esihenkiloId: string | null;
};

const locales = { fi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TeamCalendar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/absences');
        const data: Absence[] = await response.json();

        const teamAbsences = data.filter(
    (a) => (String(a.esihenkiloId) === String(user.id) || String(a.employeeId) === String(user.id))
  )
  .filter((a) => a.status === 'hyväksytty'); // vain hyväksytyt

        const mapped = teamAbsences.map((a) => ({
          id: a.id,
          title: `${a.employeeName} – ${a.reason}`,
          start: new Date(a.startDate),
          end: new Date(a.endDate),
          allDay: true,
          reason: a.reason,
        }));

        setEvents(mapped);
      } catch (error) {
        console.error('Virhe poissaolojen haussa:', error);
      }
    };

    fetchAbsences();
  }, [user.id]);

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#ccc';
    if (event.reason === 'loma') backgroundColor = '#4A90E2';
    else if (event.reason === 'saldovapaa') backgroundColor = '#F5A623';
    else if (event.reason === 'työmatka') backgroundColor = '#FFAD4B7';
    else backgroundColor = '#9e9e9e';

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '4px',
        padding: '2px',
        fontSize: '0.85rem',
      },
    };
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (view === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handlePrev = () => {
    const prev = new Date(currentDate);
    if (view === 'week') prev.setDate(prev.getDate() - 7);
    else prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleBack = () => {
    if (user.rooli === 'esihenkilo') {
      window.location.href = '/manager';
    } else {
      window.location.href = '/home';
    }
  };

  // Funktio isolla alkukirjaimella
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Layout>
      <div className="p-4 relative max-w-5xl mx-auto">
       
       

        {/* Kuukausi ja vuosi */}
        <h3 className="text-xl font-semibold mb-4 text-purple-600">
          {capitalize(currentDate.toLocaleString('fi-FI', { month: 'long' }))} {currentDate.getFullYear()}
        </h3>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setView('month')} className="bg-white text-purple-600 border border-purple-400 px-3 py-1 rounded hover:bg-blue-600 transition-colors">Kuukausinäkymä</button>
          <button onClick={() => setView('week')} className="bg-white text-purple-600 border border-purple-400 px-3 py-1 rounded hover:bg-blue-600 transition-colors">Viikkonäkymä</button>
          <button onClick={handlePrev} className="bg-purple-300 px-3 py-1 rounded hover:bg-purple-100 transition-colors">Edellinen</button>
          <button onClick={() => setCurrentDate(new Date())} className="bg-purple-300 px-3 py-1 rounded hover:bg-purple-100 transition-colors">Nykyinen</button>
          <button onClick={handleNext} className="bg-purple-300 px-3 py-1 rounded hover:bg-purple-100 transition-colors">Seuraava</button>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }} // hieman pienempi korkeus
          eventPropGetter={eventStyleGetter}
          view={view}
          views={['week', 'month']}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          onView={(newView) => setView(newView)}
          toolbar={false}
          culture="fi" // Viikonpäivät suomeksi
          popup
          className="rounded-lg shadow-lg"
        />
      </div>
    </Layout>
  );
};

export default TeamCalendar;
