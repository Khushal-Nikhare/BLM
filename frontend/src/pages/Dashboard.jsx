import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Filter, SortDesc, Loader2, Inbox, LogOut } from 'lucide-react';
import LeadCard from '../components/LeadCard';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const [sortBy, setSortBy] = useState('dateDesc');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/api/leads`).then(res => res.data),
  });

  const filteredAndSortedLeads = React.useMemo(() => {
    if (!leads) return [];
    
    let result = leads.filter(lead => {
      // Search
      if (searchTerm && !lead.businessName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      // Filter Status
      if (filterStatus !== 'All' && lead.callStatus !== filterStatus) return false;
      // Filter Interest Status
      if (filterTag !== 'All' && lead.interestStatus !== filterTag) return false;
      
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dateDesc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'dateAsc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'nameAsc') return a.businessName.localeCompare(b.businessName);
      if (sortBy === 'meetDesc') {
        if (!a.meetingDate) return 1;
        if (!b.meetingDate) return -1;
        return new Date(b.meetingDate) - new Date(a.meetingDate);
      }
      if (sortBy === 'callLaterDesc') {
        if (!a.callLaterDate) return 1;
        if (!b.callLaterDate) return -1;
        return new Date(b.callLaterDate) - new Date(a.callLaterDate);
      }
      return 0;
    });

    return result;
  }, [leads, searchTerm, filterStatus, filterTag, sortBy]);

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Top Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Overview</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search saved leads..."
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors ml-4"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content scrollable area */}
      <div className="flex-1 overflow-auto p-8">
        
        {/* Filters Bar */}
        <div className="flex flex-wrap gap-4 mb-6 items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Filter size={16} className="text-slate-400" />
            <span className="font-medium text-slate-700">Status:</span>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-1.5 px-3 outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              <option value="Not Called">Not Called</option>
              <option value="Called">Called</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm">
             <span className="font-medium text-slate-700">Sentiment:</span>
             <select 
              value={filterTag} 
              onChange={e => setFilterTag(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-1.5 px-3 outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Sentiments</option>
              <option value="Pending">Pending</option>
              <option value="Interested">Interested</option>
              <option value="Call Later">Call Later</option>
              <option value="Meet">Meet</option>
              <option value="Converted">Converted</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm border-l border-slate-200 pl-4">
             <SortDesc size={16} className="text-slate-400" />
             <span className="font-medium text-slate-700">Sort by:</span>
             <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-1.5 px-3 outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="dateDesc">Newest Added</option>
              <option value="dateAsc">Oldest Added</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="meetDesc">Next Meeting Dates</option>
              <option value="callLaterDesc">Follow-up Call Dates</option>
            </select>
          </div>
        </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 gap-3">
             <Loader2 size={24} className="animate-spin" /> Loading Leads...
          </div>
        ) : filteredAndSortedLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredAndSortedLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-slate-100 border-dashed text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Inbox size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No Leads Found</h3>
            <p className="text-sm">Save your first lead using the "Find New Leads" button in the sidebar.</p>
          </div>
        )}

      </div>
    </div>
  );
}
