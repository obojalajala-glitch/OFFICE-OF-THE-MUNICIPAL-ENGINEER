import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Upload, 
  AlertTriangle,
  X,
  CheckCircle2,
  Contact,
  Mail,
  Phone
} from 'lucide-react';
import { useFirebase } from '../../lib/FirebaseProvider';
import { UserProfile } from '../../types';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: Partial<UserProfile>) => void;
}

export function ProfileSetupModal({ isOpen, onClose, onComplete }: ProfileSetupModalProps) {
  const { user, profile, updateProfile } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    permanentAddress: '',
    jalajalaAddress: '',
    birthdate: '',
    gender: 'MALE',
    genderSpecify: '',
    classification: 'CITIZEN',
    govSpecify: '',
    idNumber: '',
    idPhotoUrl: ''
  });

  // Load draft on mount
  React.useEffect(() => {
    if (isOpen) {
      if (user) {
        const draft = localStorage.getItem(`jalajala_profile_draft_${user.uid}`);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            setFormData(prev => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error("Failed to parse draft", e);
          }
        } else if (profile) {
          setFormData(profile);
        }
      } else {
        // For new registrants (onComplete path)
        const draft = localStorage.getItem('jalajala_registration_draft');
        if (draft) {
          try {
            setFormData(JSON.parse(draft));
          } catch (e) {}
        }
      }
    }
  }, [isOpen, user, profile]);

  // Save draft on change
  React.useEffect(() => {
    if (formData && !loading) {
      if (user) {
        localStorage.setItem(`jalajala_profile_draft_${user.uid}`, JSON.stringify(formData));
      } else if (onComplete) {
        localStorage.setItem('jalajala_registration_draft', JSON.stringify(formData));
      }
    }
  }, [formData, user, loading, onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onComplete) {
      onComplete(formData);
      localStorage.removeItem('jalajala_registration_draft');
      return;
    }

    if (!user) return; // Should not happen if onComplete is null

    setLoading(true);
    try {
      await updateProfile(formData);
      localStorage.removeItem(`jalajala_profile_draft_${user.uid}`);
      onClose();
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = () => {
    return formData.firstName && formData.lastName && formData.email && formData.contactNumber &&
           formData.permanentAddress && formData.jalajalaAddress && formData.birthdate && 
           formData.idNumber && formData.idPhotoUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md cursor-pointer"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl relative z-10 border-t-8 border-brand-blue overflow-y-auto custom-scrollbar"
      >
        <div className="p-6 sm:p-10">
          <div className="flex items-start justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-sm z-20 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-brand-blue uppercase tracking-tight">Complete Your Verification Profile</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Provide your verified information to access municipal transactions.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                title="Close and continue as guest"
              >
                <X size={20} />
              </button>
              <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center border border-blue-100">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} className="text-brand-blue" /> Personal Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">First Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Middle Name (Optional)</label>
                  <input 
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Last Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-brand-blue" /> Contact Channels
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      required
                      type="email"
                      placeholder="citizen@jalajala.gov.ph"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 pl-10 text-sm font-bold focus:border-brand-blue outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Contact Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      required
                      type="tel"
                      placeholder="09XX-XXX-XXXX"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 pl-10 text-sm font-bold focus:border-brand-blue outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Residency Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-brand-blue" /> Residency Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Permanent Address</label>
                  <input 
                    required
                    type="text"
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Residential Address in Jalajala</label>
                  <input 
                    required
                    type="text"
                    value={formData.jalajalaAddress}
                    onChange={(e) => setFormData({...formData, jalajalaAddress: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Demographics Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-brand-blue" /> Demographics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Birthdate</label>
                  <input 
                    required
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Gender</label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['MALE', 'FEMALE', 'THIRD_SEX'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio"
                          name="gender"
                          checked={formData.gender === g}
                          onChange={() => setFormData({...formData, gender: g as any})}
                          className="w-4 h-4 text-brand-blue"
                        />
                        <span className="text-[10px] font-black uppercase text-slate-600">{g.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {formData.gender === 'THIRD_SEX' && (
                    <input 
                      required
                      placeholder="Please specify"
                      type="text"
                      value={formData.genderSpecify}
                      onChange={(e) => setFormData({...formData, genderSpecify: e.target.value})}
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Classification Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} className="text-brand-blue" /> User Classification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Classification</label>
                  <select 
                    required
                    value={formData.classification}
                    onChange={(e) => setFormData({...formData, classification: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  >
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="BUSINESS_OWNER">BUSINESS OWNER</option>
                    <option value="GOVERNMENT">GOVERNMENT EMPLOYEE / REP</option>
                    <option value="PWD">PERSON WITH DISABILITY (PWD)</option>
                    <option value="SENIOR_CITIZEN">SENIOR CITIZEN</option>
                  </select>
                </div>
                {formData.classification === 'GOVERNMENT' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Specify Agency/Office</label>
                    <input 
                      required
                      type="text"
                      value={formData.govSpecify}
                      onChange={(e) => setFormData({...formData, govSpecify: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Verification Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-brand-blue" /> Verification Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">ID Number</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. SSS, TIN, Driver's License"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-bold focus:border-brand-blue outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Valid ID Photo</label>
                  <div className="relative group">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, idPhotoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-10 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center gap-2 bg-slate-50 group-hover:bg-blue-50 group-hover:border-brand-blue transition-all">
                      <Upload size={14} className="text-slate-400 group-hover:text-brand-blue" />
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-brand-blue uppercase">
                        {formData.idPhotoUrl ? 'Update Photo' : 'Upload ID'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {formData.idPhotoUrl && formData.idPhotoUrl.startsWith('data:image') && (
                <div className="mt-2 relative w-32 aspect-[3/2] rounded border border-slate-200 overflow-hidden">
                  <img src={formData.idPhotoUrl} className="w-full h-full object-cover" alt="ID Preview" />
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading || !isComplete()}
                className="w-full py-4 bg-brand-blue text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
              >
                {loading ? 'Sincronizing Profile...' : (
                  <>
                    <CheckCircle2 size={18} /> Complete Profile Setup
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
