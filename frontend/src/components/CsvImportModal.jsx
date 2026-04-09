import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FileUp, Loader2, X, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function CsvImportModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStats, setParseStats] = useState(null);
  const [importStatus, setImportStatus] = useState('idle'); // idle, importing, success, error
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef();
  const queryClient = useQueryClient();

  const bulkImportMutation = useMutation({
    mutationFn: (leadsArray) => axios.post('/api/leads/bulk', leadsArray).then(res => res.data),
    onSuccess: (data) => {
      setImportStatus('success');
      setParseStats(prev => ({ ...prev, importedCount: data.count }));
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err) => {
      setImportStatus('error');
      setErrorMsg(err.response?.data?.error || err.message);
    }
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setParseStats(null);
      setImportStatus('idle');
      setErrorMsg('');
    } else {
      alert("Please upload a valid .csv file");
    }
  };

  const processCsv = () => {
    if (!file) return;
    
    setIsParsing(true);
    setImportStatus('idle');
    setErrorMsg('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        const mappedLeads = results.data.map(row => {
          // Robustly clean rating
          let ratingValue = null;
          if (row['Average Rating']) {
             const parsed = parseFloat(row['Average Rating']);
             if (!isNaN(parsed)) ratingValue = parsed;
          }
          
          return {
            googlePlaceId: row['Place Id'] || `csv_import_${Math.random().toString(36).substring(2, 10)}`,
            businessName: row['Name'] || "Unknown Business",
            address: row['Fulladdress'] || "",
            phoneNumber: row['Phone'] || null,
            website: row['Website'] || null,
            googleMapsLink: row['Google Maps URL'] || null,
            rating: ratingValue,
            callStatus: "Not Called",
            tag: "New Lead",
            searchKeyword: row['Search Keyword'] || null,
          };
        });
        
        setParseStats({ totalRows: results.data.length, mappedLeads });
      },
      error: (err) => {
        setIsParsing(false);
        setImportStatus('error');
        setErrorMsg(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const doImport = () => {
    if (!parseStats || !parseStats.mappedLeads) return;
    setImportStatus('importing');
    bulkImportMutation.mutate(parseStats.mappedLeads);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Import Leads from CSV</h2>
            <p className="text-sm text-slate-500">Upload exports from mapping tools (Outscraper, DataMiner, etc).</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {importStatus === 'success' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Import Successful!</h3>
              <p className="text-slate-600">
                Successfully imported <span className="font-bold text-slate-900">{parseStats.importedCount}</span> leads. <br/>
                <span className="text-sm text-slate-500">(Duplicates were safely skipped)</span>
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Upload Dropzone Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                  ${file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".csv"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <>
                    <FileUp size={36} className="text-blue-500 mb-3" />
                    <p className="text-slate-800 font-semibold">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                  </>
                ) : (
                  <>
                    <FileUp size={36} className="text-slate-400 mb-3" />
                    <p className="text-slate-700 font-medium mb-1">Click to browse or drag a CSV file here</p>
                    <p className="text-xs text-slate-400">Must include headers (Name, Phone, Fulladdress, etc)</p>
                  </>
                )}
              </div>

              {/* Status & Actions */}
              <div className="mt-6">
                {!parseStats && file && (
                  <button 
                    onClick={processCsv}
                    disabled={isParsing}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isParsing ? <Loader2 size={18} className="animate-spin" /> : null}
                    Parse CSV Data
                  </button>
                )}

                {parseStats && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-slate-700 mb-2">Ready to Import</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Found <span className="font-bold text-slate-900">{parseStats.totalRows}</span> rows in the CSV. Mapped properly to database structure.
                    </p>
                    <button 
                      onClick={doImport}
                      disabled={importStatus === 'importing'}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {importStatus === 'importing' ? <Loader2 size={18} className="animate-spin" /> : null}
                      Import {parseStats.totalRows} Leads to Database
                    </button>
                  </div>
                )}

                {importStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <strong>Error:</strong> {errorMsg}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
