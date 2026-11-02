import { Link, Outlet, useLocation } from 'react-router-dom';

const NAV = [
  { path: '/', label: '📊 Дашборд' },
  { path: '/agents', label: '🖥 Агенты' },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗄️</span>
            <h1 className="text-xl font-semibold text-gray-900">Frontol Management</h1>
          </div>
          <nav className="flex gap-1">
            {NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}