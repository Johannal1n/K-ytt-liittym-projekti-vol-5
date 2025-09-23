// tämä tuo vasempaan reunaan sidebarin sekä oikeaan alareunaan kuvan



import Sidebar from './sidebar';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-white relative">
      <Sidebar />

      <main className="ml-64 p-6 w-full">
        {children}
      </main>

      {/* Koristekuva oikeassa alakulmassa */}
      <div className="absolute bottom-10 right-40 p-8 pointer-events-none">
        <img
          src="/background.png"
          alt="Decorative background"
          className="w-[600px] h-auto opacity-80"
        />
      </div>
    </div>
  );
};

export default AppLayout;
