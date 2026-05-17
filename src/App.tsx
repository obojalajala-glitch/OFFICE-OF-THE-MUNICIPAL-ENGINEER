/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/layout/Layout';
import Hero from './components/layout/Hero';
import PermitModule from './components/permits/PermitModule';
import MappingModule from './components/map/MappingModule';
import ReportingModule from './components/reports/ReportingModule';
import ContactPage from './components/contact/ContactPage';
import ChecklistTab from './components/permits/ChecklistTab';
import DownloadsTab from './components/permits/DownloadsTab';
import AdminPortal from './components/admin/AdminPortal';
import ActivityLog from './components/admin/ActivityLog';
import { motion, AnimatePresence } from 'motion/react';
import { FirebaseProvider, useFirebase } from './lib/FirebaseProvider';
import { Building2, ShieldCheck, Loader2 } from 'lucide-react';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';

function RestrictedSection({ section, children }: { section: string, children: React.ReactNode }) {
  const { user, profile, loading, isAdmin, registerCitizen, login, isLoggingIn, authError, clearAuthError } = useFirebase();
  const [showRegisterFlow, setShowRegisterFlow] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  // Viewing projects, contact, and requirements info are always allowed
  if (section === 'mapping' || section === 'contact' || section === 'checklist' || section === 'downloads') {
    return <>{children}</>;
  }

  // Admin bypass
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl border-t-4 border-brand-gold">
          <ShieldCheck size={64} className="mx-auto text-brand-blue mb-6" />
          <h2 className="text-2xl font-black text-brand-blue uppercase tracking-widest mb-4">Identity Verification Required</h2>
          
          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold flex items-center justify-between gap-4"
              >
                <span>{authError}</span>
                <button onClick={clearAuthError} className="p-1 hover:bg-red-100 rounded tracking-[0.2em]">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-slate-500 font-bold mb-8 leading-relaxed italic">
            "Every citizen transaction must be backed by a verified legal identity to ensure municipal accountability."
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
            <div className="bg-brand-blue text-white p-10 rounded-xl flex flex-col items-center justify-center h-full">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-brand-gold">Identification & Registration</h3>
              <p className="text-[11px] font-medium opacity-80 mb-8 leading-relaxed text-center">
                Access municipal services by identifying yourself. This process is open to all individuals who can present valid proof of identity for official record-keeping.
              </p>
              <button 
                onClick={() => setShowRegisterFlow(true)}
                className="w-full py-4 bg-brand-gold text-brand-blue font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-yellow-400 transition-all border border-white/10"
              >
                Identification Process
              </button>
            </div>

            <div className="bg-slate-50 p-10 rounded-xl border border-slate-200">
               <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Institutional Access</h3>
               <p className="text-[10px] font-bold text-slate-500 mb-6 leading-relaxed">
                 Officials and administrative staff may sign in using their authorized Google accounts.
               </p>
               <button 
                onClick={login}
                disabled={isLoggingIn}
                className="w-full py-4 bg-white text-brand-blue border border-slate-300 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
              >
                {isLoggingIn ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Admin Google Access
              </button>
            </div>
          </div>
        </div>

        {showRegisterFlow && (
          <RegistrationWorkflow 
            onComplete={() => setShowRegisterFlow(false)} 
            onCancel={() => setShowRegisterFlow(false)} 
          />
        )}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl border-t-4 border-brand-gold">
          <Building2 size={64} className="mx-auto text-brand-blue mb-6" />
          <h2 className="text-2xl font-black text-brand-blue uppercase tracking-widest mb-4">Complete Your Verification Profile</h2>
          <p className="text-slate-500 font-bold mb-8 leading-relaxed">
            Almost there! To ensure legal compliance and secure processing of your request, 
            please provide your official identity details.
          </p>
          <div className="text-left bg-slate-50 p-8 rounded-xl border border-slate-200">
             <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
               <ShieldCheck size={14} /> Mandatory Verification Form
             </h4>
             <ProfileSetupModal isOpen={true} onClose={() => {}} onComplete={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function RegistrationWorkflow({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
  const { registerCitizen } = useFirebase();

  const handleProfile = async (profileData: any) => {
    try {
      await registerCitizen(profileData);
      onComplete();
    } catch (e) {
      console.error("Workflow failed:", e);
    }
  };

  return (
    <>
      <ProfileSetupModal isOpen={true} onClose={onCancel} onComplete={handleProfile} />
    </>
  );
}

function ProtectedSection({ section }: { section: string }) {
  const { isAdmin } = useFirebase();

  const renderContent = () => {
    switch(section) {
      case 'permits': return <PermitModule />;
      case 'checklist': return <ChecklistTab />;
      case 'downloads': return <DownloadsTab />;
      case 'mapping': return <MappingModule />;
      case 'reporting': return <ReportingModule />;
      case 'contact': return <ContactPage />;
      case 'admin': return isAdmin ? <AdminPortal /> : <div className="p-24 text-center font-black text-brand-blue uppercase tracking-widest">Access Denied</div>;
      case 'logs': return isAdmin ? <ActivityLog /> : <div className="p-24 text-center font-black text-brand-blue uppercase tracking-widest">Access Denied</div>;
      default: return null;
    }
  };

  return (
    <RestrictedSection section={section}>
      {renderContent()}
    </RestrictedSection>
  );
}

export default function App() {
  const [section, setSection] = React.useState('home');

  const renderSection = () => {
    if (section !== 'home') {
      return <ProtectedSection section={section} />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Hero onAction={setSection} />
          
          {/* Mobile-Friendly Grid Quicklinks for Landing */}
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { id: 'permits', title: 'PERMIT PORTAL', desc: 'Step-by-step applications for all building and land use requirements.', icon: '📝' },
                  { id: 'checklist', title: 'REQUIREMENTS', desc: 'Pre-application documentary checklist for all municipal permits.', icon: '📋' },
                  { id: 'downloads', title: 'DOWNLOADS', desc: 'Official OBO forms and technical documents for offline use.', icon: '📥' },
                  { id: 'mapping', title: 'INFRASTRUCTURE GIS', desc: 'Real-time geographic monitoring of municipal development projects.', icon: '📍' },
                  { id: 'reporting', title: 'CITIZEN REPORTS', desc: 'Lodge official reports regarding hazards or illegal construction.', icon: '⚠️' },
                  { id: 'contact', title: 'CONNECT WITH US', desc: 'Visit our department at the Municipal Hall for personal consultation.', icon: '🏢' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:border-brand-blue hover:shadow-xl transition-all text-left group flex flex-col h-full"
                  >
                    <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">{item.icon}</div>
                    <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">{item.title}</h3>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-6 flex-grow">{item.desc}</p>
                    <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      ACCESS MODULE <span className="text-brand-gold">→</span>
                    </div>
                  </button>
                ))}
             </div>
             
             {/* Quick Info Bar */}
             <div className="mt-16 bg-brand-blue p-12 rounded-lg border-b-4 border-brand-gold shadow-2xl relative overflow-hidden text-center sm:text-left sm:flex items-center gap-12">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                   <Building2 size={150} className="text-white" />
                </div>
                
                <div className="shrink-0 mb-8 sm:mb-0">
                  <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center text-brand-gold border border-white/10 mx-auto sm:mx-0">
                     <ShieldCheck size={40} />
                  </div>
                </div>

                <div className="relative z-10 flex-grow">
                  <h3 className="text-lg font-black text-white mb-3 uppercase tracking-[0.2em]">Institutional Commitment</h3>
                  <p className="text-blue-100 text-sm leading-relaxed font-medium max-w-3xl">
                    The Office of the Municipal Engineer is dedicated to the systematic enforcement of the 
                    <b> National Building Code of the Philippines</b>. Every permit issued and project managed 
                    undergoes rigorous technical review to ensure the safety of every citizen in Jalajala.
                  </p>
                </div>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <FirebaseProvider>
      <Layout currentSection={section} onSectionChange={setSection}>
        <AnimatePresence mode="wait">
          <motion.div
             key={section}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.98 }}
             transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </FirebaseProvider>
  );
}
