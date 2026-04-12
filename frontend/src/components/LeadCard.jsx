import React from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Phone, Globe, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const INTEREST_COLORS = {
  'Pending': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  'Interested': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'Not Interested': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'Call Later': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'Meet': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  'Converted': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Potential': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  'Not Potential': 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

const STATUS_COLORS = {
  'Not Called': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Called': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function LeadCard({ lead, viewMode = 'grid' }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/api/users`).then(res => res.data),
    enabled: user?.role === 'ADMIN',
  });

  const updateLead = useMutation({
    mutationFn: (updates) => axios.patch(`${import.meta.env.VITE_API_URL}/api/leads/${lead.id}`, updates).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const deleteLead = useMutation({
    mutationFn: () => axios.delete(`${import.meta.env.VITE_API_URL}/api/leads/${lead.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const handleStatusChange = (e) => updateLead.mutate({ callStatus: e.target.value });
  const handleInterestChange = (e) => updateLead.mutate({ interestStatus: e.target.value });
  const handleNotesChange = (e) => updateLead.mutate({ notes: e.target.value });
  const handleMeetingChange = (e) => updateLead.mutate({ meetingDate: e.target.value ? new Date(e.target.value).toISOString() : null });
  const handleCallLaterChange = (e) => updateLead.mutate({ callLaterDate: e.target.value ? new Date(e.target.value).toISOString() : null });

  if (viewMode === 'row') {
    return (
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
        <td className="px-4 py-3">
          <div className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-[200px]" title={lead.businessName}>
            {lead.businessName}
          </div>
          {user?.role === 'ADMIN' && (
            <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
              Assigned: {lead.user ? lead.user.email : 'Unassigned'}
            </div>
          )}
          {lead.address && (
            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px] flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="shrink-0" />
              {lead.address}
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <div className={`px-2 py-0.5 rounded-md inline-flex text-xs font-medium border ${INTEREST_COLORS[lead.interestStatus] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'}`}>
            <select 
              value={lead.interestStatus || 'Pending'} 
              onChange={handleInterestChange}
              className="bg-transparent appearance-none outline-none cursor-pointer pr-1"
            >
              {Object.keys(INTEREST_COLORS).map(s => <option key={s} value={s} className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">{s}</option>)}
            </select>
          </div>
        </td>
        <td className="px-4 py-3">
          <select 
            value={lead.callStatus} 
            onChange={handleStatusChange}
            className={`w-full text-xs rounded-md border-0 py-1.5 px-2 ${STATUS_COLORS[lead.callStatus] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'} ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 outline-none`}
          >
            <option value="Not Called">Not Called</option>
            <option value="Called">Called</option>
          </select>
        </td>
        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
          {lead.phoneNumber && (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Phone size={12} className="shrink-0 text-slate-400 dark:text-slate-500" />
              {lead.phoneNumber}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-xs">
          {(lead.interestStatus === 'Meet' || lead.interestStatus === 'Call Later') ? (
            <input 
              type="datetime-local" 
              value={lead.interestStatus === 'Meet' 
                ? formatDateForInput(lead.meetingDate)
                : formatDateForInput(lead.callLaterDate)
              }
              onChange={lead.interestStatus === 'Meet' ? handleMeetingChange : handleCallLaterChange}
              className="w-full text-xs rounded-md border-0 py-1.5 px-2 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          ) : (
            <span className="text-slate-400 dark:text-slate-600 italic">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={lead.notes || ''}
            onChange={handleNotesChange}
            placeholder="Add notes..."
            className="w-full text-xs rounded-md py-1.5 px-2 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-end gap-2">
            {lead.googleMapsLink && (
              <a href={lead.googleMapsLink} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors" title="Open Maps">
                <ExternalLink size={14} />
              </a>
            )}
            {user?.role === 'ADMIN' && (
              <button onClick={() => { if(window.confirm('Delete lead permanently?')) deleteLead.mutate() }} className="p-1.5 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-md transition-colors" title="Delete Lead">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow duration-200 group flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight pr-2 line-clamp-2">
            {lead.businessName}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${INTEREST_COLORS[lead.interestStatus] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'}`}>
              <select 
                value={lead.interestStatus || 'Pending'} 
                onChange={handleInterestChange}
                className="bg-transparent appearance-none outline-none cursor-pointer pr-1"
              >
                {Object.keys(INTEREST_COLORS).map(s => (
                  <option key={s} value={s} className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">{s}</option>
                ))}
              </select>
            </div>
            {lead.searchKeyword && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded text-[10px] uppercase font-bold tracking-wider max-w-[120px] truncate" title={lead.searchKeyword}>
                {lead.searchKeyword}
              </span>
            )}
            {user?.role === 'ADMIN' && (
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded text-[10px] font-bold tracking-wider max-w-[120px] truncate" title={lead.user?.email || 'Unassigned'}>
                {lead.user ? lead.user.email : 'Unassigned'}
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-5 flex-1">
          {lead.address && (
            <div className="flex items-start text-sm text-slate-600 dark:text-slate-400 gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="line-clamp-2">{lead.address}</span>
            </div>
          )}
          {lead.phoneNumber && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 gap-2">
              <Phone size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
              <span>{lead.phoneNumber}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {lead.googleMapsLink && (
            <a href={lead.googleMapsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors">
              <ExternalLink size={14} /> Open Maps
            </a>
          )}
          {lead.website && (
            <a href={lead.website.match(/^https?:\/\//) ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Globe size={14} /> Website
            </a>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Call Status</label>
              <select 
                value={lead.callStatus} 
                onChange={handleStatusChange}
                className={`w-full text-sm rounded-lg border-0 py-1.5 px-3 ${STATUS_COLORS[lead.callStatus] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'} ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 bg-white dark:bg-slate-800`}
              >
                <option value="Not Called">Not Called</option>
                <option value="Called">Called</option>
              </select>
            </div>
            
            {lead.interestStatus === 'Meet' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Meeting Date</label>
                <input 
                  type="datetime-local" 
                  value={formatDateForInput(lead.meetingDate)}
                  onChange={handleMeetingChange}
                  className="w-full text-sm rounded-lg border-0 py-1 px-2 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                />
              </div>
            )}
            
            {lead.interestStatus === 'Call Later' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Call Later Date</label>
                <input 
                  type="datetime-local" 
                  value={formatDateForInput(lead.callLaterDate)}
                  onChange={handleCallLaterChange}
                  className="w-full text-sm rounded-lg border-0 py-1 px-2 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                />
              </div>
            )}
          </div>
          
          <div className="relative">
            <textarea 
              value={lead.notes || ''}
              onChange={handleNotesChange}
              placeholder="Add personal notes here..."
              rows={2}
              className="w-full text-sm rounded-lg border-0 py-2 px-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 resize-none outline-none"
              onBlur={handleNotesChange}
            />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
         <span className="text-xs text-slate-400 dark:text-slate-500">Added {new Date(lead.createdAt).toLocaleDateString()}</span>
         
         <div className="flex items-center gap-3">
           {user?.role === 'ADMIN' && users && (
             <select
               value={lead.userId || ''}
               onChange={(e) => updateLead.mutate({ userId: e.target.value })}
               className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded py-1 px-2"
             >
               <option value="" disabled>Assign to...</option>
               {users.map(u => (
                 <option key={u.id} value={u.id}>{u.email}</option>
               ))}
             </select>
           )}

           {user?.role === 'ADMIN' && (
             <button onClick={() => { if(window.confirm('Delete lead permanently?')) deleteLead.mutate() }} className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
               <Trash2 size={16} />
             </button>
           )}
         </div>
      </div>
    </div>
  );
}
