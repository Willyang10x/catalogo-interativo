'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products, type Sneaker } from '../../data/products';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState<Sneaker[]>([]);

  // Carrega os produtos para simular o banco de dados do estoque
  useEffect(() => {
    setInventory(products);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de autenticação (a senha secreta é "admin123")
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Acesso negado. Credenciais inválidas.');
    }
  };

  // ─── TELA DE LOGIN (Proteção de Rota) ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-[#00ff66] selection:text-black relative overflow-hidden">
        {/* Efeito de luz ao fundo */}
        <div className="absolute w-96 h-96 bg-[#00ff66]/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight">System<span className="text-[#00ff66]">Admin</span></h1>
            <p className="text-zinc-500 text-sm mt-2">Painel de controle restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Chave de Acesso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] transition-colors font-mono"
              />
              {error && <p className="text-red-500 text-xs mt-2 font-semibold">⚠️ {error}</p>}
              <p className="text-zinc-600 text-xs mt-2 italic">Dica: digite admin123 para testar</p>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-white text-black hover:bg-[#00ff66] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] font-black uppercase tracking-wider text-sm rounded-xl transition-all duration-300"
            >
              Autenticar
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
              &larr; Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD INTERNO ───
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ff66] selection:text-black">
      
      {/* NAVBAR DO ADMIN */}
      <nav className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black tracking-tight">Store<span className="text-[#00ff66]">Dashboard</span></span>
              <span className="hidden md:inline-block px-2 py-1 bg-zinc-800 rounded text-xs font-bold text-zinc-400 uppercase tracking-widest">Live</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Ver Loja</Link>
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-sm font-bold bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-300 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-500/50"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">Visão Geral</h2>
          <p className="text-zinc-400">Resumo de desempenho e inventário atual.</p>
        </div>

        {/* CARDS DE MÉTRICAS (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Receita Mensal</h3>
            <p className="text-3xl font-black text-white">R$ 48.250,00</p>
            <p className="text-[#00ff66] text-xs font-bold mt-2">↑ +12.5% desde o último mês</p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff66]/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Pedidos Realizados</h3>
            <p className="text-3xl font-black text-white">124</p>
            <p className="text-zinc-400 text-xs mt-2">Últimos 30 dias</p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Itens no Catálogo</h3>
            <p className="text-3xl font-black text-white">{inventory.length}</p>
            <p className="text-zinc-400 text-xs mt-2">Produtos ativos na vitrine</p>
          </div>
        </div>

        {/* TABELA DE INVENTÁRIO */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-lg font-black">Gerenciamento de Estoque</h3>
            <button className="bg-white text-black hover:bg-[#00ff66] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors">
              + Novo Produto
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Produto</th>
                  <th className="p-4 font-bold">Categoria</th>
                  <th className="p-4 font-bold">Cor</th>
                  <th className="p-4 font-bold">Preço</th>
                  <th className="p-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg relative p-1 flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-contain drop-shadow-md" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{item.name}</p>
                        <p className="text-xs text-zinc-500 uppercase">{item.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-300">{item.category}</td>
                    <td className="p-4 text-sm text-zinc-300 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zinc-700 block border border-zinc-600"></span>
                      {item.color}
                    </td>
                    <td className="p-4 text-sm font-bold text-[#00ff66]">
                      {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold underline decoration-zinc-700 underline-offset-4">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}