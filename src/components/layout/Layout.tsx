import React from 'react';
import { 
  Building2, 
  Map as MapIcon, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Menu,
  X,
  HardHat,
  Gavel,
  Zap,
  Droplets,
  Construction,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Bell,
  FileCheck,
  Loader2,
  List,
  ClipboardCheck,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useFirebase } from '../../lib/FirebaseProvider';
import { ProfileSetupModal } from '../auth/ProfileSetupModal';
import { LoginInterface } from '../auth/LoginInterface';
import { UserProfile } from '../../types';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
  key?: string;
}

const NavItem = ({ href, label, icon: Icon, active, onClick }: NavItemProps) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
    className={cn(
      "flex items-center gap-2 px-1 py-3 transition-all duration-200 border-b-2 font-bold text-sm",
      active 
        ? "border-brand-blue text-brand-blue" 
        : "border-transparent text-slate-600 hover:text-brand-blue hover:border-slate-200"
    )}
  >
    <Icon size={16} />
    <span>{label}</span>
  </a>
);

export default function Layout({ 
  children, 
  currentSection, 
  onSectionChange 
}: { 
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const { user, profile, loading, isAdmin, notifications, unreadCount, logout, markAsRead, login, isLoggingIn } = useFirebase();

  const sections = [
    { id: 'permits', label: 'PERMIT APPLICATION', icon: FileText },
    { id: 'checklist', label: 'CHECKLIST OF REQUIREMENTS', icon: ClipboardCheck },
    { id: 'downloads', label: 'DOWNLOADABLE FORMS', icon: Download },
    { id: 'mapping', label: 'ACTIVE PROJECTS MAP', icon: MapIcon },
    { id: 'reporting', label: 'CITIZEN REPORTS', icon: AlertTriangle },
    { id: 'contact', label: 'CONNECT WITH US', icon: Mail },
  ];

  if (isAdmin) {
    sections.push({ id: 'admin', label: 'ADMIN PORTAL', icon: ShieldCheck });
    sections.push({ id: 'logs', label: 'ACTIVITY LOG', icon: List });
  }

  function FileText({ size }: { size: number }) {
    return <Building2 size={size} />;
  }

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-700",
      isAdmin && "theme-admin"
    )}>
      {/* Header Section */}
      <header className="bg-brand-blue text-white p-4 flex flex-col sm:flex-row items-center justify-between border-b-4 border-brand-gold relative z-50">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div 
            className="w-16 h-16 bg-white/10 rounded-full border-2 border-brand-gold flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform shrink-0"
            onClick={() => onSectionChange('home')}
          >
            <HardHat className="text-brand-gold" size={32} />
          </div>
          <div className="cursor-pointer" onClick={() => onSectionChange('home')}>
            <p className="text-[10px] tracking-widest opacity-80 uppercase font-bold">Office of the</p>
            <h1 className="text-2xl sm:text-3xl font-black leading-none flex flex-col">
              <span className="text-brand-gold">MUNICIPAL ENGINEER</span>
              <span className="text-xs sm:text-base font-medium tracking-tight mt-1">Jalajala, Rizal • Philippines</span>
            </h1>
          </div>
        </div>
        
        <div className="hidden sm:flex flex-col items-end text-right">
          <p className="text-[10px] uppercase tracking-widest opacity-70">Republic of the Philippines</p>
          <p className="text-sm font-semibold">Municipality of Jalajala</p>
          
          <div className="mt-2 flex items-center gap-4">
             {user ? (
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <button 
                     onClick={() => setIsNotifOpen(!isNotifOpen)}
                     className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative"
                   >
                     <Bell size={18} />
                     {unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-brand-blue animate-pulse">
                         {unreadCount}
                       </span>
                     )}
                   </button>
                   
                   <AnimatePresence>
                     {isNotifOpen && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
                         className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-[100]"
                       >
                         <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                           <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em]">In-App Alerts</h4>
                           <span className="text-[10px] font-bold text-slate-400">{unreadCount} New</span>
                         </div>
                         <div className="max-h-[300px] overflow-y-auto">
                           {notifications.length === 0 ? (
                             <div className="p-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
                               No notifications yet.<br/>Your status is clear.
                             </div>
                           ) : (
                             notifications.map(notif => (
                               <div 
                                 key={notif.id} 
                                 className={cn(
                                   "p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer",
                                   !notif.read && "bg-blue-50/50"
                                 )}
                                 onClick={() => markAsRead(notif.id)}
                               >
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">{notif.title}</span>
                                    <span className="text-[8px] font-bold text-slate-400">{new Date(notif.timestamp).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{notif.message}</p>
                               </div>
                             ))
                           )}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>

                 <div className="text-right">
                   <div className="flex items-center justify-end gap-1">
                     <div className="text-[9px] font-black text-blue-300 uppercase tracking-widest leading-none">Logged in</div>
                     {isAdmin && <ShieldCheck size={10} className="text-brand-gold" />}
                   </div>
                   <div className="text-sm font-bold text-white leading-none whitespace-nowrap">{user.displayName?.split(' ')[0] || profile?.username || 'User'}</div>
                 </div>
                 <button 
                   onClick={logout}
                   className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
                   title="Logout"
                 >
                   <LogOut size={14} />
                 </button>
               </div>
             ) : (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={login}
                    disabled={isLoggingIn}
                    className="flex items-center gap-2 text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-all uppercase tracking-widest"
                  >
                    {isLoggingIn ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} className="text-brand-gold" />}
                    Admin Access
                  </button>
                </div>
             )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onSectionChange('home'); }}
            className={cn(
              "font-bold py-3 flex items-center gap-2 border-b-2 text-sm",
              currentSection === 'home' ? "text-brand-blue border-brand-blue" : "text-slate-600 border-transparent hover:text-brand-blue"
            )}
          >
            HOME DASHBOARD
          </a>
          {sections.map(section => (
            <NavItem
              key={section.id}
              href={`#${section.id}`}
              label={section.label}
              icon={section.icon}
              active={currentSection === section.id}
              onClick={() => onSectionChange(section.id)}
            />
          ))}
        </div>
      </nav>

      {/* Mobile Menu Toggle & Bar */}
      <div className="lg:hidden bg-white border-b flex justify-between items-center p-4">
        <span className="font-black text-brand-blue text-sm uppercase tracking-widest">
           {currentSection === 'home' ? 'DASHBOARD' : sections.find(s => s.id === currentSection)?.label}
        </span>
        <button 
          className="p-2 text-brand-blue"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-[148px] sm:top-[116px] left-0 w-full bg-white border-b shadow-xl z-50 p-4 flex flex-col gap-2"
          >
            <button
              onClick={() => { onSectionChange('home'); setIsMenuOpen(false); }}
              className={cn(
                "p-4 rounded-lg font-bold text-sm text-left flex items-center gap-3",
                currentSection === 'home' ? "bg-brand-blue text-white" : "text-slate-600"
              )}
            >
              HOME DASHBOARD
            </button>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "p-4 rounded-lg font-bold text-sm text-left flex items-center gap-3",
                  currentSection === section.id ? "bg-brand-blue text-white" : "text-slate-600"
                )}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t py-6 px-6 sm:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <div>&copy; 2026 Municipality of Jalajala - Office of the Municipal Engineer. All Rights Reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-brand-blue transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-blue transition-colors">Citizen's Charter</a>
          <a href="#" className="hover:text-brand-blue transition-colors">FOI Portal</a>
          <a href="#" className="hover:text-brand-blue transition-colors">Digital Transparency Seal</a>
        </div>
      </footer>
    </div>
  );
}
