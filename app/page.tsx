'use client';

import { useState, useMemo, useEffect } from 'react';
import { products, type Sneaker } from "./data/products";

const AVAILABLE_BRANDS = ["Nike", "Adidas"];
const AVAILABLE_CATEGORIES = ["Casual", "Running", "Skate"];

export default function Home() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Estados para a barra de pesquisa e o debounce
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Lógica do Debounce: Aguarda 300ms após o usuário parar de digitar para atualizar a busca real
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

  // Filtra cruzando a pesquisa em texto, as marcas e as categorias
  const filteredProducts = useMemo(() => {
    return products.filter((sneaker) => {
      const matchesSearch = sneaker.name.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sneaker.brand);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(sneaker.category);
      
      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [debouncedQuery, selectedBrands, selectedCategories]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      
      {/* Header com a Barra de Pesquisa */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Sneaker Store
        </h1>
        
        <input 
          type="text" 
          placeholder="Buscar modelo de tênis..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        <aside className="w-full md:w-1/4 h-fit p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Filtros</h2>
          
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
          </div>
        </aside>

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
                  <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative border border-gray-100">
                    <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <span className="text-gray-400 font-medium text-sm">
                        {sneaker.image.split('/').pop()}
                      </span>
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