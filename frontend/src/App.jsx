import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Settings, PlusCircle, Search, DownloadCloud, FileSpreadsheet, LogOut, UserPlus } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchLeadsModal from './components/SearchLeadsModal';
import ScrapeModal from './components/ScrapeModal';
import CsvImportModal from './components/CsvImportModal';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext.jsx';

function AuthenticatedLayout({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrapeOpen, setIsScrapeOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="font-bold text-xl tracking-tight text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            BLM Leads
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
            <Home size={18} /> Dashboard
          </Link>
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Actions
          </div>
          
          <button 
            onClick={() => setIsScrapeOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium transition-colors border border-emerald-100"
          >
            <DownloadCloud size={18} /> Scrape Google Maps
          </button>

          <button 
            onClick={() => setIsCsvOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium transition-colors border border-blue-100 mt-2"
          >
            <FileSpreadsheet size={18} /> Import CSV Leads
          </button>

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors mt-2"
          >
            <Search size={18} /> API Place Search
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors mt-2">
            <PlusCircle size={18} /> Add Custom Lead
          </button>
          
          {user?.role === 'ADMIN' && (
            <Link to="/add-user" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium transition-colors border border-purple-100 mt-2">
              <UserPlus size={18} /> Create User
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
          <div className="px-3 py-2 text-sm text-slate-500 font-medium">
            Role: {user?.role}
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
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
