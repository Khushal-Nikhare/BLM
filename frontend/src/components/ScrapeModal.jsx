import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, MapPin, Loader2, X, CheckSquare, Square, Download, StopCircle } from 'lucide-react';

export default function ScrapeModal({ onClose }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  
  // Job state
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState('idle'); // idle, running, completed, error, stopped
  const queryClient = useQueryClient();

  // Poll for status
  useEffect(() => {
    let interval;
    if (activeJobId && jobStatus === 'running') {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`/scrape/status/${activeJobId}`);
          setResults(res.data.results);
          // Automatically select all new items
          setSelectedIndices(new Set(res.data.results.map((_, i) => i)));
          setJobStatus(res.data.status);
          
          if (res.data.error) {
             alert("Scraping error: " + res.data.error);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeJobId, jobStatus]);

  const startJob = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) return;
    
    setHasSearched(true);
    setResults([]);
    setSelectedIndices(new Set());
    setJobStatus('running');
    
    try {
      const res = await axios.post('/scrape/start', { keyword, location });
      setActiveJobId(res.data.job_id);
    } catch (err) {
      alert("Failed to start job: " + err.message);
      setJobStatus('error');
    }
  };

  const stopJob = async () => {
    if (!activeJobId) return;
    setJobStatus('stopped'); // immediately assume stopped for UI
    try {
      await axios.post(`/scrape/stop/${activeJobId}`);
    } catch(err) {
      console.error("Failed to stop job", err);
    }
  };

  const saveLead = useMutation({
    mutationFn: (lead) => axios.post('/api/leads', lead),
  });

  const toggleSelectAll = () => {
    if (selectedIndices.size === results.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(results.map((_, i) => i)));
    }
  };

  const toggleSelect = (index) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const importSelected = async () => {
    const selectedLeads = results.filter((_, i) => selectedIndices.has(i));
    for (const lead of selectedLeads) {
      await saveLead.mutateAsync({
        googlePlaceId: lead.googlePlaceId,
        businessName: lead.businessName,
        address: lead.address,
        phoneNumber: lead.phoneNumber,
        website: lead.website,
        googleMapsLink: lead.googleMapsLink,
        rating: lead.rating,
        callStatus: "Not Called",
        tag: "New Lead",
        searchKeyword: keyword
      });
    }
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Automated Google Maps Scraper</h2>
            <p className="text-sm text-slate-500">Collects 50-100 targeted leads using deep extraction for exact phone numbers and websites.</p>
          </div>
          <button onClick={() => { stopJob(); onClose(); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Input Form */}
        <div className="p-6 pb-2 border-b border-slate-100 bg-slate-50/50">
          <form className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keyword</label>
               <input 
                 value={keyword} onChange={e=>setKeyword(e.target.value)}
                 disabled={jobStatus === 'running'}
                 placeholder="e.g. Restaurants, Law Firms"
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-800 disabled:opacity-50"
               />
            </div>
            <div className="flex-1">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
               <input 
                 value={location} onChange={e=>setLocation(e.target.value)}
                 disabled={jobStatus === 'running'}
                 placeholder="e.g. Chicago, IL"
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-800 disabled:opacity-50"
               />
            </div>
            <div className="flex items-end">
              {jobStatus === 'running' ? (
                <button 
                  type="button"
                  onClick={stopJob}
                  className="w-full sm:w-auto h-12 bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <StopCircle size={18} /> Stop Scraping
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={startJob}
                  disabled={!keyword.trim() || !location.trim()}
                  className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <Search size={18} /> Start Deep Scrape
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          
          {hasSearched && results.length === 0 && jobStatus === 'running' && (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 py-12">
               <Loader2 size={32} className="animate-spin text-blue-500" /> 
               <div className="text-center">
                 <p className="font-semibold text-slate-700">Warming up scraper...</p>
                 <p className="text-sm">Scrolling maps panel to isolate leads. Extraction will start shortly...</p>
               </div>
             </div>
          )}

          {hasSearched && results.length === 0 && jobStatus !== 'running' && (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500">
              <p>No results found or process aborted early.</p>
            </div>
          )}

          {hasSearched && results.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="font-medium text-slate-700 flex items-center gap-4">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                       {selectedIndices.size === results.length ? <CheckSquare size={18}/> : <Square size={18}/>}
                       {selectedIndices.size === results.length ? "Deselect All" : "Select All"}
                    </button>
                    <span className="text-slate-400">|</span>
                    <span>{selectedIndices.size} of {results.length} selected</span>
                  </div>
                  {jobStatus === 'running' && (
                    <span className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                      <Loader2 size={12} className="animate-spin" /> Scraping more...
                    </span>
                  )}
                  {jobStatus === 'completed' && (
                    <span className="text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">Done</span>
                  )}
                  {jobStatus === 'stopped' && (
                    <span className="text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-xs font-semibold">Stopped intentionally</span>
                  )}
                </div>
                <button 
                  onClick={importSelected}
                  disabled={selectedIndices.size === 0 || saveLead.isPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {saveLead.isPending ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                  Import Selected
                </button>
              </div>

              <div className="space-y-3">
                {results.map((place, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleSelect(idx)}
                      className={`flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="pr-4 hidden sm:block">
                        {isSelected ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-300" size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                           <h4 className="font-bold text-slate-800 text-base">{place.businessName}</h4>
                           {place.rating && <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded font-semibold text-xs shrink-0 flex items-center gap-1">⭐ {place.rating}</span>}
                        </div>
                        <div className="text-sm text-slate-500 space-y-1">
                          {place.address && <div className="flex items-center gap-1"><MapPin size={14} className="shrink-0 text-slate-400"/> {place.address}</div>}
                          <div className="flex items-center gap-4 text-xs font-medium">
                            {place.phoneNumber ? <span className="text-emerald-600">{place.phoneNumber}</span> : <span className="text-slate-300 italic">No Phone</span>}
                            {place.website ? <a href={place.website} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="text-blue-600 hover:underline">Website</a> : <span className="text-slate-300 italic">No Website</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!hasSearched && (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400">
              <Download size={48} className="text-slate-200 mb-4 opacity-50" />
              <p>Execute a scraper job to pull high-quality deep leads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
