import React from 'react';
import { 
  Building2, 
  Files, 
  Trash2, 
  Pickaxe, 
  Zap, 
  ClipboardCheck, 
  ChevronRight, 
  Info,
  Construction,
  Calendar,
  Radio as StatusIcon,
  Loader2,
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';
import { PermitType, ApplicationStatus, PermitApplication } from '../../types';
import { cn } from '../../lib/utils';
import { useFirebase } from '../../lib/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';

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

const PERMIT_TYPES = [
  { 
    id: 'BUILDING_SIGN', 
    label: 'Building & Sign Permit', 
    desc: 'New construction or commercial signs', 
    icon: Building2,
    color: 'bg-blue-500'
  },
  { 
    id: 'FENCING', 
    label: 'Fencing Permit', 
    desc: 'Boundary markers and enclosures', 
    icon: Files,
    color: 'bg-emerald-500'
  },
  { 
    id: 'DEMOLITION', 
    label: 'Demolition Permit', 
    desc: 'Safe removal of existing structures', 
    icon: Trash2,
    color: 'bg-rose-500'
  },
  { 
    id: 'EXCAVATION', 
    label: 'Excavation Permit', 
    desc: 'Ground breaking and site prep', 
    icon: Pickaxe,
    color: 'bg-amber-500'
  },
  { 
    id: 'ELECTRICAL', 
    label: 'Electrical Connection', 
    desc: 'Power tapping and internal wiring', 
    icon: Zap,
    color: 'bg-violet-500'
  },
];

export default function PermitModule() {
  const { user, login } = useFirebase();
  const [selectedType, setSelectedType] = React.useState<PermitType | null>(null);
  const [step, setStep] = React.useState(0);
  const [applications, setApplications] = React.useState<PermitApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'permits'), where('applicantId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PermitApplication[];
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'permits');
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !selectedType) return;
    
    setIsSubmitting(true);
    try {
      const permitDoc = await addDoc(collection(db, 'permits'), {
        applicantId: user.uid,
        type: selectedType,
        status: 'PENDING',
        submissionDate: Date.now(),
        data: {
          stepCompleted: step + 1,
          timestamp: serverTimestamp()
        }
      });

      // Notify Admin
      await sendAdminNotification(
        "NEW PERMIT APPLICATION",
        `Applicant ${user.displayName} has submitted a ${selectedType.replace('_', ' ')} application.`
      );

      setSelectedType(null);
      setStep(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'permits');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusTracker = () => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-brand-blue font-bold uppercase text-sm tracking-wide">Recent Applications</h3>
        <span className="bg-blue-100 text-brand-blue text-[10px] px-2 py-1 rounded-full font-bold uppercase">
          {applications.length} ACTIVE
        </span>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-brand-blue" />
          </div>
        ) : applications.length > 0 ? (
          applications.map(app => (
            <div key={app.id} className={cn(
               "p-4 bg-slate-50 rounded flex justify-between items-center border-l-4",
               app.status === 'PENDING' ? "border-brand-gold" :
               app.status === 'APPROVED' ? "border-green-500" :
               "border-slate-300"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center text-brand-blue">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{PERMIT_TYPES.find(t => t.id === app.type)?.label}</div>
                  <div className="text-[10px] text-slate-500">Ref: {app.id.slice(0, 8).toUpperCase()} • {new Date(app.submissionDate).toLocaleDateString()}</div>
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                app.status === 'PENDING' ? "text-yellow-600" :
                app.status === 'APPROVED' ? "text-green-600" :
                "text-slate-500"
              )}>
                {app.status.replace('_', ' ')}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 text-xs italic uppercase tracking-widest">
            {user ? "No applications found" : "Login to view status"}
          </div>
        )}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-slate-50 text-brand-blue rounded-3xl flex items-center justify-center mb-8 border border-slate-200 shadow-sm">
          <LogIn size={40} />
        </div>
        <h2 className="text-2xl font-black text-brand-blue mb-4 uppercase tracking-tight">E-Permitting Authentication</h2>
        <p className="text-slate-500 max-w-md font-medium leading-relaxed mb-10">
          Accessing the municipal permit portal requires a verified citizen account. Please log in to manage your applications and official documents.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
             onClick={login}
             className="px-10 py-4 bg-brand-blue text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-xl flex items-center gap-3"
           >
             Log In to Access Permits
           </button>
        </div>
      </div>
    );
  }

  if (selectedType) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-8">
        <button 
          onClick={() => setSelectedType(null)}
          className="text-xs font-black text-brand-blue flex items-center gap-2 mb-8 hover:translate-x-[-4px] transition-transform uppercase tracking-widest"
        >
          ← BACK TO DASHBOARD
        </button>

        <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-brand-blue p-8 text-white flex justify-between items-center border-b-4 border-brand-gold">
            <div>
              <h2 className="text-xl font-black mb-1 uppercase tracking-tight">Permit Application Wizard</h2>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Step {step + 1} of 4: {PERMIT_TYPES.find(t => t.id === selectedType)?.label}</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
              <Info className="text-brand-gold" />
            </div>
          </div>

          <div className="p-8">
             {/* Progress Bar */}
             <div className="flex gap-2 mb-10">
               {[1, 2, 3, 4].map(s => (
                 <div 
                   key={s} 
                   className={cn(
                     "h-1.5 flex-grow rounded-full transition-all duration-500",
                     s <= step + 1 ? "bg-brand-gold" : "bg-slate-100"
                   )}
                 />
               ))}
             </div>

             <div className="min-h-[300px] flex items-center justify-center text-center">
                <div className="max-w-md">
                  <div className="w-16 h-16 bg-slate-50 text-brand-blue rounded-full border border-slate-200 flex items-center justify-center mx-auto mb-6">
                    <Construction size={28} />
                  </div>
                  <h3 className="text-lg font-black text-brand-blue mb-2 uppercase tracking-wide">Technical Documentation Step</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Under Presidential Decree 1096, this section requires verified blueprints and local clearances. 
                    Your submission will be queued for manual review by the Office of the Municipal Engineer.
                  </p>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                <button 
                  disabled={step === 0}
                  onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 font-black text-[10px] text-slate-400 hover:text-brand-blue disabled:opacity-0 uppercase tracking-widest"
                >
                  PREVIOUS
                </button>
                <button 
                  onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-brand-blue text-white font-black text-xs uppercase tracking-widest rounded hover:bg-slate-900 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {step < 3 ? 'CONTINUE NEXT' : 'SUBMIT OFFICIAL APPLICATION'}
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
      <div className="mb-12">
        <h2 className="text-2xl font-black text-brand-blue mb-1 uppercase tracking-tight">E-Permitting Dashboard</h2>
        <p className="text-slate-500 text-sm font-medium">Digital processing gateway for Jalajala Municipal Engineering requirements.</p>
      </div>

      {renderStatusTracker()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PERMIT_TYPES.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all cursor-pointer flex flex-col"
            onClick={() => setSelectedType(type.id as PermitType)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm", type.color)}>
                <type.icon size={24} />
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" size={20} />
            </div>
            
            <h4 className="text-sm font-black text-brand-blue mb-2 uppercase tracking-wide">{type.label}</h4>
            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed flex-grow">
              {type.desc}
            </p>
            
            <button className="w-full bg-slate-50 text-brand-blue font-black text-[10px] py-2 rounded uppercase tracking-widest border border-slate-200 group-hover:bg-brand-blue group-hover:text-white transition-all">
              Initialize Wizard
            </button>
          </motion.div>
        ))}
        
        {/* Appointment Scheduler Card */}
        <div className="bg-brand-blue rounded-lg p-6 text-white flex flex-col justify-between border-b-4 border-brand-gold shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform pointer-events-none">
             <Calendar size={120} />
          </div>
          <div className="relative z-10">
            <h4 className="text-sm font-black mb-2 uppercase tracking-wide text-brand-gold">Official Scheduler</h4>
            <p className="text-[11px] text-blue-100 mb-8 max-w-xs leading-normal">
              Direct consultation with municipal engineers and scheduled site inspections.
            </p>
          </div>
          <button className="w-full py-3 bg-brand-gold hover:bg-yellow-400 text-brand-blue text-[10px] font-black rounded transition-all shadow-md active:scale-95 uppercase tracking-widest relative z-10">
            Open Scheduler
          </button>
        </div>
      </div>
    </div>
  );
}
