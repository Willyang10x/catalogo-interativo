'use server';

import { cookies } from 'next/headers';

export async function authenticate(password: string) {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    return { error: 'Senha do servidor não configurada no .env' };
  }

  if (password === secret) {
    // 1. Colocamos o await aqui também
    const cookieStore = await cookies();
    
    cookieStore.set('admin_session', 'authorized', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // Sessão expira em 8 horas
      path: '/',
    });
    return { success: true };
  }

  return { error: 'Acesso negado. Credenciais inválidas.' };
}

export async function logout() {
  // 2. Colocamos o await no logout
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}