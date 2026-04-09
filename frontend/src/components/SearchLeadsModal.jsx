import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, MapPin, Plus, Loader2, X } from 'lucide-react';

export default function SearchLeadsModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const queryClient = useQueryClient();

  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['searchPlaces', query],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/api/search?query=${query}`).then(res => res.data.results),
    enabled: false,
  });

  const saveLead = useMutation({
    mutationFn: (lead) => axios.post(`${import.meta.env.VITE_API_URL}/api/leads`, lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      // Could show a toast notification here
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      refetch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Find Businesses</h2>
            <p className="text-sm text-slate-500">Search on Google Maps and save them directly as leads.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-0">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Restaurants in Indore, IT companies near me..."
              className="w-full pl-12 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-800 transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Results Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading && (
            <div className="h-40 flex items-center justify-center text-slate-400 gap-3">
              <Loader2 size={24} className="animate-spin" /> Fetching places from Google Maps...
            </div>
          )}

          {!isLoading && hasSearched && results?.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500">
              <Search size={40} className="text-slate-200 mb-3" />
              <p>No results found for "{query}".</p>
            </div>
          )}

          {!isLoading && results?.length > 0 && (
            <div className="space-y-3">
              {results.map((place) => (
                <div key={place.googlePlaceId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm bg-white transition-all group">
                  <div className="mb-3 sm:mb-0 pr-4">
                    <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      {place.businessName}
                      {place.rating && <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded font-semibold text-xs flex items-center">⭐ {place.rating}</span>}
                    </h4>
                    <p className="text-sm text-slate-500 flex items-start gap-1 mt-1">
                      <MapPin size={14} className="mt-0.5 shrink-0" /> 
                      {place.address}
                    </p>
                  </div>
                  <button 
                    onClick={() => saveLead.mutate(place)}
                    disabled={saveLead.isPending && saveLead.variables?.googlePlaceId === place.googlePlaceId}
                    className="flex shrink-0 items-center gap-2 px-4 py-2 bg-slate-900 border border-transparent hover:bg-transparent hover:text-slate-900 hover:border-slate-900 text-white rounded-lg font-medium transition-colors text-sm w-full sm:w-auto justify-center disabled:opacity-50"
                  >
                    <Plus size={16} /> Save Lead
                  </button>
                </div>
              ))}
            </div>
          )}

          {!hasSearched && !isLoading && (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400">
              <MapPin size={48} className="text-slate-200 mb-4 opacity-50" />
              <p>Enter a keyword to discover places nearby.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
