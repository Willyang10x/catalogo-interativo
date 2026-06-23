import { cookies } from 'next/headers';
import { LoginForm, Dashboard } from './components';

// 1. Transformamos a função em async
export default async function AdminPage() {
  // 2. Colocamos o await antes de chamar o cookies()
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  
  const isAuthenticated = session?.value === 'authorized';

  // Se não estiver logado, envia apenas o formulário
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Se passou pela segurança, exibe o painel
  return <Dashboard />;
}