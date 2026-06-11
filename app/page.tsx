'use client';

import { useState, useMemo, useEffect } from 'react';
import { products, type Sneaker } from "../data/products";
import Image from 'next/image';

const AVAILABLE_BRANDS = ["Nike", "Adidas"];
const AVAILABLE_CATEGORIES = ["Casual", "Running", "Skate"];

export default function Home() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('sneaker-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Erro ao carregar favoritos:", e);
      }
    }

    const savedTheme = localStorage.getItem('sneaker-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (favorites.length >= 0) {
      localStorage.setItem('sneaker-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('sneaker-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('sneaker-theme', 'light');
      }
      return newMode;
    });
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => 
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]                
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => 
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((sneaker) => {
      const matchesSearch = sneaker.name.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sneaker.brand);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(sneaker.category);
      
      return matchesSearch && matchesBrand && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      return 0; 
    });
  }, [debouncedQuery, selectedBrands, selectedCategories, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans relative transition-colors duration-300">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-fade-in-up">
          Sneaker Store
        </h1>
        
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          <button
            onClick={toggleDarkMode}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Alternar tema"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-4.22 4.22a1 1 0 010 1.415l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm4.22-4.22a1 1 0 010-1.415l-.708-.708a1 1 0 011.414 1.414l-.708.708a1 1 0 01-1.415 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>

          <div className="relative w-full md:w-80 flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg aria-hidden="true" className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <input 
              type="text" 
              placeholder="Buscar modelo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="flex-1 md:flex-none px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="">Relevância</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="name-asc">Ordem Alfabética (A-Z)</option>
          </select>

          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm font-semibold text-gray-700 dark:text-gray-200 active:bg-gray-50 dark:active:bg-gray-700"
          >
            Filtros
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        <aside className={`
          fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-white dark:bg-gray-900 p-6 shadow-2xl overflow-y-auto
          transform transition-transform duration-300 ease-in-out animate-fade-in-up
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:w-1/4 md:max-w-none md:bg-white/60 md:dark:bg-gray-800/80 md:backdrop-blur-md md:border md:border-gray-200/50 md:dark:border-gray-700/50 md:shadow-xl md:rounded-2xl md:overflow-visible
        `} style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filtros</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="md:hidden text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none"
            >
              &times;
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Marcas</h3>
              <div className="space-y-2">
                {AVAILABLE_BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 transition-colors" 
                    />
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-200/50 dark:border-gray-700/50" />

            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Categorias</h3>
              <div className="space-y-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 transition-colors" 
                    />
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl md:hidden active:bg-blue-700 dark:bg-blue-500 dark:active:bg-blue-600"
            >
              Ver resultados
            </button>
          </div>
        </aside>

        <main className="w-full md:w-3/4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum tênis encontrado.</p>
              <button 
                onClick={() => { setSelectedBrands([]); setSelectedCategories([]); setSearchQuery(''); setSortOrder(''); }}
                className="mt-4 px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div 
              key={debouncedQuery + selectedBrands.join() + selectedCategories.join() + sortOrder}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((sneaker: Sneaker, index: number) => {
                const isFavorite = favorites.includes(sneaker.id);
                
                return (
                  <div 
                    key={sneaker.id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group relative animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <button
                      onClick={() => toggleFavorite(sneaker.id)}
                      className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-500 transition-all active:scale-95"
                      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <svg 
                        className={`w-5 h-5 transition-colors duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 dark:text-gray-500'}`} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>

                    <div className="aspect-square bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 overflow-hidden relative border border-gray-100 dark:border-gray-700 group-hover:shadow-md transition-all">
                      <div className="relative w-full h-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500 ease-in-out">
                        <Image 
                          src={sneaker.image} 
                          alt={`Tênis ${sneaker.name}`} 
                          fill
                          priority={index < 4} 
                          className="object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{sneaker.brand}</p>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate" title={sneaker.name}>
                        {sneaker.name}
                      </h3>
                      
                      <div className="flex justify-between items-end pt-3">
                        <div className="flex flex-col">
                          <span className="text-gray-400 dark:text-gray-500 text-xs">{sneaker.category}</span>
                          <span className="text-gray-400 dark:text-gray-500 text-xs">{sneaker.color}</span>
                        </div>
                        <p className="font-extrabold text-gray-900 dark:text-white text-lg">
                          {sneaker.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}