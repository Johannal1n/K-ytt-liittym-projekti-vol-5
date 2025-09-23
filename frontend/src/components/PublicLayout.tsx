// src/components/Layout.tsx
import type { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-white">
      {children}

      {/* Koristekuva oikeassa alakulmassa */}
      <div className="absolute bottom-10 right-40 p-8 pointer-events-none">
        <img
          src="/background.png"
          alt="Decorative background"
          className="w-240 h-auto opacity-80"
        />
      </div>
    </div>
  );
};

export default Layout;
