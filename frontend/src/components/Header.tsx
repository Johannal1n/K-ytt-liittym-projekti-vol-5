const Header = () => {
  return (
    <header className="w-full text-white shadow-md py-4 mb-6">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-4">
        {/* Pieni emoji-logon tyyppinen elementti */}
        <div className="p-2 flex items-center justify-center">
          <span className="text-2xl">📅</span>
        </div>
        {/* Sovelluksen nimi liilana reunuksella */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide px-4 py-2 border-2 border-purple-600 text-purple-600 rounded">
          Poissaolosovellus
        </h1>
      </div>
    </header>
  );
};

export default Header;
