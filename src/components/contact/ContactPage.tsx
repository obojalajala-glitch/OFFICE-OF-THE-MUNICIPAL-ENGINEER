import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Send,
  MessageSquare,
  Globe,
  Facebook,
  Info,
  HardHat,
  ExternalLink,
  Gavel
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage() {
  const contactInfo = [
    { label: 'Official Email', value: 'jalajalarizal.engineering@gmail.com', icon: Mail },
    { label: 'Office Address', value: 'Ground Floor, Municipal Hall, Special District, Jalajala, Rizal', icon: MapPin },
    { label: 'Contact Number', value: '(+63) 9XX-XXX-XXXX', icon: Phone },
    { label: 'Office Hours', value: 'Mon - Fri | 8:00 AM - 5:00 PM', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
      <div className="mb-12">
        <h2 className="text-2xl font-black text-brand-blue mb-1 uppercase tracking-tight">Transparency Portal</h2>
        <p className="text-slate-500 text-sm font-medium">Official communication channels and institutional transparency identifiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-brand-blue text-white rounded-lg p-8 shadow-xl border-b-4 border-brand-gold relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <HardHat size={200} />
            </div>
            
            <h3 className="text-brand-gold font-black uppercase text-xs tracking-[0.2em] mb-8">Office Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8 relative z-10">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-brand-gold shrink-0 border border-white/10">
                    <info.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">{info.label}</p>
                    <p className="text-sm font-bold leading-relaxed">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex gap-4">
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest">
                    Digital Transparency Seal
                 </div>
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                    Verified Portal
                 </div>
              </div>
              <button className="px-6 py-3 bg-brand-gold hover:bg-yellow-400 text-brand-blue text-[10px] font-black rounded uppercase tracking-widest transition-all">
                Download Citizen's Charter
              </button>
            </div>
          </div>

          {/* Social/Maps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-blue mb-4 border border-slate-100">
                  <Globe size={24} />
                </div>
                <h4 className="text-sm font-black text-brand-blue uppercase tracking-wide mb-2">Google Maps Location</h4>
                <p className="text-[10px] text-slate-500 mb-6 uppercase font-bold tracking-widest leading-relaxed">
                  Easily find our office within the municipal government complex.
                </p>
                <button className="mt-auto w-full py-3 border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-50 transition-all">
                  Get Directions
                </button>
             </div>
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-blue mb-4 border border-slate-100">
                  <ExternalLink size={24} />
                </div>
                <h4 className="text-sm font-black text-brand-blue uppercase tracking-wide mb-2">FOI Portal</h4>
                <p className="text-[10px] text-slate-500 mb-6 uppercase font-bold tracking-widest leading-relaxed">
                  Official Freedom of Information requests for engineering documents.
                </p>
                <button className="mt-auto w-full py-3 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-900 transition-all shadow-md">
                  Visit FOI Request
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar help */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Directories</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                 <span className="font-bold text-slate-600">Municipal Mayor's Office</span>
                 <ExternalLink size={12} className="text-slate-300" />
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                 <span className="font-bold text-slate-600">MPDC Planning Office</span>
                 <ExternalLink size={12} className="text-slate-300" />
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                 <span className="font-bold text-slate-600">Municipal Health Office</span>
                 <ExternalLink size={12} className="text-slate-300" />
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                 <span className="font-bold text-slate-600">Assessor's Office</span>
                 <ExternalLink size={12} className="text-slate-300" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
             <div className="w-10 h-10 bg-brand-gold/20 text-brand-blue rounded flex items-center justify-center mb-4">
                <Gavel size={20} />
             </div>
             <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2 leading-tight">National Building Code Ref</h4>
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
               Access the full digital copy of Presidential Decree 1096 as mandated by the law.
             </p>
             <button className="mt-4 text-[10px] font-black text-brand-blue underline uppercase tracking-widest">
               Link to Official Gazette
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
