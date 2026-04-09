import React from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Phone, Globe, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const INTEREST_COLORS = {
  'Pending': 'bg-slate-100 text-slate-800 border-slate-200',
  'Interested': 'bg-purple-100 text-purple-800 border-purple-200',
  'Not Interested': 'bg-red-100 text-red-800 border-red-200',
  'Call Later': 'bg-orange-100 text-orange-800 border-orange-200',
  'Meet': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Converted': 'bg-green-100 text-green-800 border-green-200',
};

const STATUS_COLORS = {
  'Not Called': 'bg-slate-100 text-slate-700',
  'Called': 'bg-emerald-100 text-emerald-800',
};

export default function LeadCard({ lead }) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200 group flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-slate-800 leading-tight pr-2 line-clamp-2">
            {lead.businessName}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${INTEREST_COLORS[lead.interestStatus] || 'bg-slate-100 text-slate-800'}`}>
              <select 
                value={lead.interestStatus || 'Pending'} 
                onChange={handleInterestChange}
                className="bg-transparent appearance-none outline-none cursor-pointer pr-1"
              >
                {Object.keys(INTEREST_COLORS).map(s => (
                  <option key={s} value={s} className="text-slate-800">{s}</option>
                ))}
              </select>
            </div>
            {lead.searchKeyword && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[10px] uppercase font-bold tracking-wider max-w-[120px] truncate" title={lead.searchKeyword}>
                {lead.searchKeyword}
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-5 flex-1">
          {lead.address && (
            <div className="flex items-start text-sm text-slate-600 gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-2">{lead.address}</span>
            </div>
          )}
          {lead.phoneNumber && (
            <div className="flex items-center text-sm text-slate-600 gap-2">
              <Phone size={16} className="shrink-0 text-slate-400" />
              <span>{lead.phoneNumber}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {lead.googleMapsLink && (
            <a href={lead.googleMapsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors">
              <ExternalLink size={14} /> Open Maps
            </a>
          )}
          {lead.website && (
            <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 transition-colors">
              <Globe size={14} /> Website
            </a>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 mt-auto">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Call Status</label>
              <select 
                value={lead.callStatus} 
                onChange={handleStatusChange}
                className={`w-full text-sm rounded-lg border-0 py-1.5 px-3 ${STATUS_COLORS[lead.callStatus] || 'bg-slate-100 text-slate-700'} ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600`}
              >
                <option value="Not Called">Not Called</option>
                <option value="Called">Called</option>
              </select>
            </div>
            
            {lead.interestStatus === 'Meet' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Meeting Date</label>
                <input 
                  type="datetime-local" 
                  value={lead.meetingDate ? new Date(lead.meetingDate).toISOString().slice(0,16) : ''}
                  onChange={handleMeetingChange}
                  className="w-full text-sm rounded-lg border-0 py-1 px-2 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 text-slate-700"
                />
              </div>
            )}
            
            {lead.interestStatus === 'Call Later' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Call Later Date</label>
                <input 
                  type="datetime-local" 
                  value={lead.callLaterDate ? new Date(lead.callLaterDate).toISOString().slice(0,16) : ''}
                  onChange={handleCallLaterChange}
                  className="w-full text-sm rounded-lg border-0 py-1 px-2 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 text-slate-700"
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
              className="w-full text-sm rounded-lg border-0 py-2 px-3 text-slate-700 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 resize-none"
              onBlur={handleNotesChange}
            />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
         <span className="text-xs text-slate-400">Added {new Date(lead.createdAt).toLocaleDateString()}</span>
         
         <div className="flex items-center gap-3">
           {user?.role === 'ADMIN' && users && (
             <select
               value={lead.userId || ''}
               onChange={(e) => updateLead.mutate({ userId: e.target.value })}
               className="text-xs bg-white border border-slate-200 text-slate-700 rounded py-1 px-2"
             >
               <option value="" disabled>Assign to...</option>
               {users.map(u => (
                 <option key={u.id} value={u.id}>{u.email}</option>
               ))}
             </select>
           )}

           {user?.role === 'ADMIN' && (
             <button onClick={() => { if(window.confirm('Delete lead permanently?')) deleteLead.mutate() }} className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors">
               <Trash2 size={16} />
             </button>
           )}
         </div>
      </div>
    </div>
  );
}
