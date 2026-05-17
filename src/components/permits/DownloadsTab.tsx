import React from 'react';
import { 
  Download, 
  FileText, 
  FileCheck, 
  FileCode, 
  Search,
  ExternalLink,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function DownloadsTab() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const forms = [
    { title: 'Unified Building Permit Form', type: 'PDF', size: '2.4 MB', category: 'BUILDING' },
    { title: 'Sanitary Permit Application', type: 'PDF', size: '1.2 MB', category: 'SANITARY' },
    { title: 'Locational Clearance Form', type: 'PDF', size: '840 KB', category: 'ZONING' },
    { title: 'Electrical Load Data Form', type: 'XLSX', size: '450 KB', category: 'ELECTRICAL' },
    { title: 'Certificate of Occupancy Request', type: 'PDF', size: '1.5 MB', category: 'COMPLETION' },
    { title: 'Fencing Permit Application', type: 'PDF', size: '1.1 MB', category: 'FENCING' },
    { title: 'Notice of Construction Form', type: 'DOCX', size: '320 KB', category: 'PROJECT' },
    { title: 'Mechanical Permit Application', type: 'PDF', size: '1.3 MB', category: 'MECHANICAL' },
  ];

  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-brand-blue mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Download size={32} className="text-brand-blue" />
            <h2 className="text-2xl font-black text-brand-blue uppercase tracking-tight">DOWNLOADABLE FORMS</h2>
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-tight italic">
            "Access official documentation for offline preparation and legal verification."
          </p>
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex items-center gap-1"><Printer size={14} /> Printable</div>
             <div className="h-4 w-px bg-slate-200"></div>
             <div className="flex items-center gap-1"><ShieldCheck size={14} /> Verified</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search forms by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm focus:border-brand-blue outline-none transition-all"
        />
      </div>

      {/* Grid of Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-blue transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded border border-slate-100">{form.type}</span>
            </div>
            
            <h3 className="text-[11px] font-black text-brand-blue uppercase tracking-tight mb-2 group-hover:text-brand-blue transition-colors">{form.title}</h3>
            
            <div className="flex items-center gap-2 mb-6">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{form.category} MODULE</span>
               <div className="w-1 h-1 rounded-full bg-slate-200"></div>
               <span className="text-[9px] font-bold text-slate-400 leading-none">{form.size}</span>
            </div>

            <button className="w-full py-3 bg-slate-50 group-hover:bg-brand-blue group-hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all border border-slate-100 group-hover:border-brand-blue">
               <Download size={14} /> DOWNLOAD DOCUMENT
            </button>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-16 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
               <ExternalLink size={20} />
            </div>
            <div>
               <h4 className="text-[11px] font-black text-brand-blue uppercase tracking-widest">Digital Filing Portal</h4>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Already have your forms filled out? Submit them digitally.</p>
            </div>
         </div>
         <button className="px-8 py-3 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-lg transition-all">
            GO TO PERMIT PORTAL
         </button>
      </div>
    </div>
  );
}
