import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Settings, PlusCircle, Search, DownloadCloud, FileSpreadsheet, LogOut, UserPlus, Moon, Sun } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchLeadsModal from './components/SearchLeadsModal';
import ScrapeModal from './components/ScrapeModal';
import CsvImportModal from './components/CsvImportModal';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';

function AuthenticatedLayout({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrapeOpen, setIsScrapeOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 justify-between">
          <div className="font-bold text-xl tracking-tight text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            BLM Leads
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 rounded-lg transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
            <Home size={18} /> Dashboard
          </Link>
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Actions
          </div>

          <button
            onClick={() => setIsScrapeOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium transition-colors border border-emerald-100 dark:border-emerald-900/50"
          >
            <DownloadCloud size={18} /> Scrape Google Maps
          </button>

          <button
            onClick={() => setIsCsvOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors border border-blue-100 dark:border-blue-900/50 mt-2"
          >
            <FileSpreadsheet size={18} /> Import CSV Leads
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mt-2"
          >
            <Search size={18} /> API Place Search
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mt-2">
            <PlusCircle size={18} /> Add Custom Lead
          </button>

          {user?.role === 'ADMIN' && (
            <Link to="/add-user" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-colors border border-purple-100 dark:border-purple-900/50 mt-2">
              <UserPlus size={18} /> Create User
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Role: {user?.role}
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Modals */}
      {isSearchOpen && <SearchLeadsModal onClose={() => setIsSearchOpen(false)} />}
      {isScrapeOpen && <ScrapeModal onClose={() => setIsScrapeOpen(false)} />}
      {isCsvOpen && <CsvImportModal onClose={() => setIsCsvOpen(false)} />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-user" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <RegisterPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
