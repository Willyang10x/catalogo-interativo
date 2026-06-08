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
  
  // Novo estado: Controla se a gaveta (drawer) está aberta no celular
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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
    return products.filter((sneaker) => {
      const matchesSearch = sneaker.name.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sneaker.brand);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(sneaker.category);
      
      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [debouncedQuery, selectedBrands, selectedCategories]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans relative">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Sneaker Store
        </h1>
        
        {/* Agrupamos o Input e o Botão de Filtro Mobile */}
        <div className="flex gap-2 w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar modelo..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
          
          {/* Botão que só aparece em telas pequenas (md:hidden) */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            Filtros
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* OVERLAY ESCURO DO MOBILE (Clica fora para fechar) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* === SIDEBAR / DRAWER === 
            No mobile: fixed, z-50, tela cheia com translate para animar.
            No desktop (md:): volta a ser relativo, sem translate, com glassmorphism.
        */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-white p-6 shadow-2xl overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:w-1/4 md:max-w-none md:bg-white/60 md:backdrop-blur-md md:border md:border-white/40 md:shadow-xl md:rounded-2xl md:overflow-visible
        `}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filtros</h2>
            {/* Botão de Fechar do Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="md:hidden text-gray-400 hover:text-gray-700 text-3xl leading-none"
            >
              &times;
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Marcas</h3>
              <div className="space-y-2">
                {AVAILABLE_BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors" 
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-200/50" />

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Categorias</h3>
              <div className="space-y-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors" 
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Botão extra no mobile para confirmar e fechar a gaveta */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl md:hidden active:bg-blue-700"
            >
              Ver resultados
            </button>
          </div>
        </aside>

        {/* === GRID DE PRODUTOS === */}
        <main className="w-full md:w-3/4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 text-lg">Nenhum tênis encontrado.</p>
              <button 
                onClick={() => { setSelectedBrands([]); setSelectedCategories([]); setSearchQuery(''); }}
                className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((sneaker: Sneaker) => (
                <div 
                  key={sneaker.id} 
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative border border-gray-100 group-hover:shadow-md transition-all">
                    <div className="w-full h-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500 ease-in-out">
                      <Image 
                        src={sneaker.image} 
                        alt={`Tênis ${sneaker.name}`} 
                        fill
                        className="object-contain p-4 mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">{sneaker.brand}</p>
                    <h3 className="font-bold text-gray-900 text-lg truncate" title={sneaker.name}>
                      {sneaker.name}
                    </h3>
                    
                    <div className="flex justify-between items-end pt-3">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">{sneaker.category}</span>
                        <span className="text-gray-400 text-xs">{sneaker.color}</span>
                      </div>
                      <p className="font-extrabold text-gray-900 text-lg">
                        {sneaker.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}