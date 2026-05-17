import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Send,
  Loader2,
  Search,
  PlusCircle,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IssueCategory, IssueReport } from '../../types';
import { cn } from '../../lib/utils';
import { useFirebase } from '../../lib/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, doc, getDoc } from 'firebase/firestore';

async function sendAdminNotification(title: string, message: string) {
  try {
    const adminQuery = query(collection(db, 'admins'));
    const adminSnap = await getDocs(adminQuery);
    const adminIds = adminSnap.docs.map(doc => doc.id);
    
    const notifPromises = adminIds.map(adminId => 
      addDoc(collection(db, 'notifications'), {
        userId: adminId,
        title,
        message,
        type: 'NEW_REPORT',
        read: false,
        timestamp: Date.now(),
        link: 'admin'
      })
    );
    await Promise.all(notifPromises);
  } catch (e) {
    console.error("Error sending admin notification:", e);
  }
}

export default function ReportingModule() {
  const { user, profile, login } = useFirebase();
  const [view, setView] = React.useState<'SELECT' | 'FORM' | 'STATUS'>('SELECT');
  const [agreed, setAgreed] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ticketId, setTicketId] = React.useState('');
  const [searchRef, setSearchRef] = React.useState('');
  const [searchedReport, setSearchedReport] = React.useState<IssueReport | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  const [formData, setFormData] = React.useState({
    category: '' as IssueCategory,
    description: '',
    location: '',
    photoUrl: ''
  });

  const [showAnonymityModal, setShowAnonymityModal] = React.useState(false);

  const CATEGORIES = [
    { value: 'INSPECTION_REQUEST', label: 'Technical Inspection Request' },
    { value: 'ILLEGAL_CONSTRUCTION', label: 'Illegal Construction Activity' },
    { value: 'ELECTRICAL_HAZARD', label: 'Public Electrical Hazard' },
    { value: 'ROADWAY_HAZARD', label: 'Roadway Damage / Obstruction' },
    { value: 'WATERLINE_HAZARD', label: 'Waterline Maintenance / Hazard' },
  ];

  const handleCategoryChange = (val: string) => {
    setFormData({ ...formData, category: val as IssueCategory });
    if (val === 'ILLEGAL_CONSTRUCTION') {
      setShowAnonymityModal(true);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !user || !profile) return;

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'reports'), {
        ...formData,
        userId: user.uid,
        reporterName: `${profile.firstName} ${profile.lastName}`,
        idPhotoUrl: profile.idPhotoUrl,
        timestamp: Date.now(),
        status: 'NEW',
        createdAt: serverTimestamp()
      });

      // Notify Admin
      await sendAdminNotification(
        "NEW PUBLIC REPORT",
        `A new ${formData.category.replace('_', ' ')} has been reported at ${formData.location}.`
      );

      setTicketId(docRef.id.toUpperCase());
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef) return;
    setIsSearching(true);
    try {
      const docRef = doc(db, 'reports', searchRef.trim().toUpperCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSearchedReport({ id: docSnap.id, ...docSnap.data() } as IssueReport);
      } else {
        alert("Report reference number not found.");
      }
    } catch (error) {
       console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-lg shadow-xl border border-slate-200"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-brand-blue mb-4 uppercase tracking-tight">Report Logged Successfully</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
            Your report has been received by the Municipal Engineering tracking system. 
            An inspector will be assigned for validation. Reference ID: <span className="font-bold text-brand-blue">#{ticketId}</span>.
          </p>
          <button 
            onClick={() => {
               setSubmitted(false);
               setFormData({ category: '' as IssueCategory, description: '', location: '', photoUrl: '' });
               setAgreed(false);
               setView('SELECT');
            }}
            className="w-full py-4 bg-brand-blue hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded transition-all active:scale-95"
          >
            DISMISS NOTIFICATION
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === 'SELECT') {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-brand-blue mb-2 uppercase tracking-tight">Citizen Reporting Portal</h2>
          <p className="text-slate-500 font-medium">Choose an action to proceed with municipal concern management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          <motion.button
            whileHover={{ y: -5 }}
            onClick={() => setView('FORM')}
            className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-brand-blue transition-all text-left flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-colors border border-blue-100">
              <PlusCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-brand-blue mb-2 uppercase tracking-tight">File a New Report</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed flex-grow">
              Submit a documented concern or infrastructure hazard within Jalajala. Requires verified login.
            </p>
            <div className="mt-6 flex items-center gap-2 text-brand-blue font-black text-[10px] uppercase tracking-widest">
              Proceed to Form <ChevronRight size={14} />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -5 }}
            onClick={() => setView('STATUS')}
            className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-brand-gold transition-all text-left flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-amber-50 text-brand-gold rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors border border-amber-100">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Check Report Status</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed flex-grow">
              Track the resolution progress of your existing report using its reference ID. Requires verified login.
            </p>
            <div className="mt-6 flex items-center gap-2 text-brand-gold font-black text-[10px] uppercase tracking-widest">
              Check Reference <ChevronRight size={14} />
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-slate-50 text-brand-blue rounded-3xl flex items-center justify-center mb-8 border border-slate-200 shadow-sm">
          <LogIn size={40} />
        </div>
        <h2 className="text-2xl font-black text-brand-blue mb-4 uppercase tracking-tight">Secure Authentication Required</h2>
        <p className="text-slate-500 max-w-md font-medium leading-relaxed mb-10">
          Official report submissions and status tracking require a verified citizen account. Please log in to your municipal portal account to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
             onClick={() => setView('SELECT')}
             className="px-8 py-4 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
           >
             Cancel
           </button>
           <button 
             onClick={login}
             className="px-10 py-4 bg-brand-blue text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-xl flex items-center gap-3"
           >
             Log In to Continue
           </button>
        </div>
      </div>
    );
  }

  if (view === 'STATUS') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button 
          onClick={() => { setView('SELECT'); setSearchedReport(null); }}
          className="text-xs font-black text-brand-blue flex items-center gap-2 mb-8 hover:translate-x-[-4px] transition-transform uppercase tracking-widest"
        >
          ← BACK TO SELECTION
        </button>

        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-brand-blue p-8 text-white relative">
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">Track Your Submission</h3>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Enter the official system reference number</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                <input 
                  required
                  type="text"
                  placeholder="e.g. 7X3K9Z"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded p-3 text-sm font-black text-slate-900 focus:border-brand-blue outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-6 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                  Track
                </button>
              </form>

              {searchedReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-100 text-brand-blue text-[9px] font-black rounded uppercase tracking-widest">
                        {searchedReport.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">#{searchedReport.id}</h4>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      searchedReport.status === 'RESOLVED' ? "bg-emerald-500 text-white" :
                      searchedReport.status === 'INVESTIGATING' ? "bg-blue-500 text-white" :
                      "bg-red-500 text-white"
                    )}>
                      {searchedReport.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Submission Date</span>
                      <p className="text-[11px] font-bold text-slate-700">{new Date(searchedReport.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Location</span>
                      <p className="text-[11px] font-bold text-slate-700">{searchedReport.location}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Current Resolution Status</span>
                    <div className="text-[11px] font-medium text-slate-600 bg-white p-3 rounded border border-slate-100 border-l-4 border-brand-blue italic">
                      {searchedReport.status === 'NEW' ? 'Your report is queued for verification by a municipal engineer.' :
                       searchedReport.status === 'INVESTIGATING' ? 'An official inspection team is currently addressing the report.' :
                       'The issue has been resolved according to municipal protocols.'}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-8">
      <button 
        onClick={() => setView('SELECT')}
        className="text-xs font-black text-brand-blue flex items-center gap-2 mb-8 hover:translate-x-[-4px] transition-transform uppercase tracking-widest"
      >
        ← BACK TO SELECTION
      </button>

      <div className="mb-12">
        <h2 className="text-2xl font-black text-brand-blue mb-1 uppercase tracking-tight">Citizen Issue Reporting</h2>
        <p className="text-slate-500 text-sm font-medium">Lodge official infrastructure and engineering reports directly to the municipal office.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-red-50 border-b border-red-100 p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 shrink-0 shadow-sm border border-red-200">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-1">Official Jurisdiction Notice</p>
            <p className="text-[11px] text-red-600 leading-normal font-medium">
              Reports must strictly adhere to Presidential Decree 1096 (National Building Code). 
              We only process municipal-level infrastructure hazards, roadway obstructions, and illegal construction within Jalajala jurisdiction.
            </p>
          </div>
        </div>

        <div className={cn("p-8 transition-opacity duration-300", !agreed && "opacity-30 pointer-events-none")}>
          <form className="space-y-8" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-2">Reporter Information</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-900 uppercase">Verified Account: {profile?.firstName} {profile?.lastName}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1">Status: Identity Document Recorded (ID Ends: {profile?.idNumber.slice(-4)})</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Category</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm font-bold text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                >
                  <option value="">-- SELECT CATEGORY --</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    type="text"
                    placeholder="Barangay, Street, or Landmark"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Description</label>
              <textarea 
                required
                rows={4}
                placeholder="Please provide a clear description of the hazard or violation observed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-4 text-sm font-bold text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Evidence</label>
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 p-6 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors group relative">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, photoUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all border border-slate-100">
                    <Upload size={20} />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{formData.photoUrl ? 'REPLACE ATTACHED EVIDENCE' : 'Attach Visual Evidence'}</span>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest leading-none">Support JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">OR</span>
                  <input 
                    type="text"
                    placeholder="Paste Image URL"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold text-slate-900 focus:border-brand-blue outline-none"
                  />
                </div>

                {formData.photoUrl && formData.photoUrl.startsWith('data:image') && (
                  <div className="relative w-40 aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Evidence Preview" />
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                       <AlertTriangle size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <input 
                  id="legalAgreed"
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                />
                <label htmlFor="legalAgreed" className="text-[11px] text-slate-500 font-bold uppercase tracking-wide cursor-pointer select-none">
                  I certify this report is accurate and legitimate
                </label>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !agreed}
                className="w-full sm:w-auto px-12 py-4 bg-brand-gold text-brand-blue font-black text-[10px] uppercase tracking-[0.2em] rounded hover:bg-yellow-400 shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT OFFICIAL REPORT'}
              </button>
            </div>
          </form>
        </div>

        {!agreed && (
          <div className="p-8 text-center bg-slate-50 border-t border-slate-200">
             <p className="text-[10px] font-black text-brand-blue mb-4 uppercase tracking-[0.2em]">Compliance Step Required</p>
             <button 
               onClick={() => setAgreed(true)}
               className="text-[11px] font-black text-brand-blue underline uppercase tracking-widest hover:text-slate-900 transition-colors"
             >
               Read and Acknowledge Jurisdiction Notice
             </button>
          </div>
        )}
      </div>
      <AnonymityModal isOpen={showAnonymityModal} onClose={() => setShowAnonymityModal(false)} />
    </div>
  );
}

function AnonymityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 border-t-8 border-brand-gold"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                <ShieldCheck size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-brand-blue leading-tight mb-4 uppercase tracking-tight">
                Anunsyo ng Seguridad at Proteksyon
              </h3>
              
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-sm">
                  "Kami ay naninigurado na ang iyong pagkakakilanlan ay mananatiling <span className="text-brand-blue font-black underline">LIGTAS at KOMPIDENSYAL</span>."
                </p>
                
                <p className="text-sm">
                  Ang Munisipyo ng Jalajala ay mariing sumusunod sa <span className="font-bold text-slate-900 underline">Republic Act No. 10173 o ang Data Privacy Act of 2012</span>. 
                  Ang inyong ulat tungkol sa <span className="font-bold italic">Illegal Construction</span> ay dadaan sa isang secure na proseso kung saan tanging ang mga awtorisadong opisyal lamang ang makakakita ng detalye.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                     <CheckCircle2 size={14} /> Anonymous Reporting Enabled
                  </li>
                  <li className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                     <CheckCircle2 size={14} /> Encrypted Submission
                  </li>
                  <li className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                     <CheckCircle2 size={14} /> protected by philippine laws
                  </li>
                </ul>
              </div>

              <button 
                onClick={onClose}
                className="mt-8 w-full py-4 bg-brand-blue text-white text-xs font-black rounded uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg active:scale-95"
              >
                Naiintindihan ko at Gusto ko Nang Magpatuloy
              </button>
              
              <p className="mt-4 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                Ang iyong kaligtasan ay aming prayoridad sa bawat ulat.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
