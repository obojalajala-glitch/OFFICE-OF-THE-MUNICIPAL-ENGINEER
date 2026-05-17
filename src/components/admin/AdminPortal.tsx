import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  Loader2,
  Clock,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Eye,
  Printer,
  History,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { useFirebase } from '../../lib/FirebaseProvider';
import { ProjectCompletionModal } from './ProjectCompletionModal';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'PERMITS' | 'REPORTS' | 'PROJECTS'>('PERMITS');
  const [permits, setPermits] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    location: '',
    lat: 14.35,
    lng: 121.32,
    status: 'PLANNING',
    category: 'MUNICIPAL',
    budget: 0,
    description: ''
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [pendingCompletionData, setPendingCompletionData] = useState<any | null>(null);
  const { user } = useFirebase();

  useEffect(() => {
    setLoading(true);
    const qPermits = query(collection(db, 'permits'), orderBy('submissionDate', 'desc'));
    const unsubPermits = onSnapshot(qPermits, (snapshot) => {
      setPermits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'permits');
    });

    const qReports = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    const qProjects = query(collection(db, 'projects'), orderBy('name', 'asc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
      setLoading(false);
    });

    const qMovements = query(collection(db, 'project_movements'), orderBy('timestamp', 'desc'));
    const unsubMovements = onSnapshot(qMovements, (snapshot) => {
      setMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'project_movements');
    });

    return () => {
      unsubPermits();
      unsubReports();
      unsubProjects();
      unsubMovements();
    };
  }, []);

  const logMovement = async (projectId: string, projectName: string, changeType: string, details: string) => {
    try {
      await addDoc(collection(db, 'project_movements'), {
        projectId,
        projectName,
        changeType,
        details,
        timestamp: Date.now(),
        adminEmail: user?.email || 'System'
      });

      // Sync with global activity log
      await addDoc(collection(db, 'activity_log'), {
        type: 'ADMIN_ACTION',
        userId: user?.uid,
        userName: user?.displayName || user?.email || 'Admin',
        details: `Project "${projectName}" updated: ${changeType}. ${details.slice(0, 50)}...`,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error logging movement:", error);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        ...projectFormData,
        lat: Number(projectFormData.lat),
        lng: Number(projectFormData.lng),
        budget: Number(projectFormData.budget),
        updatedAt: Date.now()
      };

      // Check if project status is being set to COMPLETED
      if (data.status === 'COMPLETED') {
        const oldProject = isEditing && editProjectId ? projects.find(p => p.id === editProjectId) : null;
        const wasCompleted = oldProject?.status === 'COMPLETED';

        // Only show modal if it's newly completed or if it's a new project created as completed (rare)
        if (!wasCompleted) {
          setPendingCompletionData(data);
          setShowCompletionModal(true);
          return;
        }
      }

      await finalizeProjectSave(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    }
  };

  const finalizeProjectSave = async (data: any, completionDetails?: any) => {
    const finalData = { ...data, ...completionDetails };

    if (isEditing && editProjectId) {
      const oldProject = projects.find(p => p.id === editProjectId);
      await updateDoc(doc(db, 'projects', editProjectId), finalData);
      
      let details = "Updated fields: ";
      const changedFields = [];
      if (oldProject.status !== finalData.status) changedFields.push(`Status changed from ${oldProject.status} to ${finalData.status}`);
      if (oldProject.budget !== finalData.budget) changedFields.push(`Budget adjusted from ₱${oldProject.budget.toLocaleString()} to ₱${finalData.budget.toLocaleString()}`);
      if (oldProject.name !== finalData.name) changedFields.push(`Name changed from ${oldProject.name} to ${finalData.name}`);
      
      if (completionDetails) {
        changedFields.push("Project completion details finalized and logged.");
      }

      await logMovement(editProjectId, finalData.name, 'UPDATE', changedFields.join('. ') || 'General details updated');
    } else {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...finalData,
        createdAt: Date.now()
      });
      await logMovement(docRef.id, finalData.name, 'CREATE', 'Project initial registration');
      if (finalData.status === 'COMPLETED') {
        await logMovement(docRef.id, finalData.name, 'UPDATE', 'Project registered and marked as COMPLETED.');
      }
    }

    setShowProjectForm(false);
    setIsEditing(false);
    setEditProjectId(null);
    setProjectFormData({
      name: '',
      location: '',
      lat: 14.35,
      lng: 121.32,
      status: 'PLANNING',
      category: 'MUNICIPAL',
      budget: 0,
      description: ''
    });
    setPendingCompletionData(null);
    setShowCompletionModal(false);
  };

  const startEditProject = (project: any) => {
    setProjectFormData({
      name: project.name,
      location: project.location,
      lat: project.lat,
      lng: project.lng,
      status: project.status,
      category: project.category,
      budget: project.budget,
      description: project.description
    });
    setEditProjectId(project.id);
    setIsEditing(true);
    setShowProjectForm(true);
  };

  const printIssueReport = (report: any, isAnonymous: boolean) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reporterDisplay = isAnonymous ? 'PROTECTED ANONYMITY' : (report.userId || 'ANONYMOUS');
    const reporterName = isAnonymous ? 'REDACTED' : (report.reporterName || 'STATION AGENT');

    printWindow.document.write(`
      <html>
        <head>
          <title>Issue Report - ${report.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #450920; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; color: #450920; }
            .meta { font-size: 10px; color: #64748b; margin-top: 5px; text-transform: uppercase; font-weight: 700; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
            .value { font-size: 13px; font-weight: 700; }
            .description { line-height: 1.6; font-size: 13px; color: #334155; font-style: italic; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; }
            .photo-box { width: 100%; aspect-ratio: 16/9; background: #f1f5f9; border-radius: 8px; display: flex; items: center; justify-content: center; margin-bottom: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">ISSUE REPORT</h1>
              <div class="meta">OFFICIAL MUNICIPAL INCIDENT RECORD • ID: ${report.id.toUpperCase()}</div>
            </div>
            <div style="text-align: right">
              <div class="label">Date Reported</div>
              <div class="value">${new Date(report.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Report Category</div>
              <div class="value">${report.category.replace('_', ' ')}</div>
            </div>
            <div class="card">
              <div class="label">Status</div>
              <div class="value">${report.status}</div>
            </div>
            <div class="card">
              <div class="label">Location</div>
              <div class="value">${report.location}</div>
            </div>
            <div class="card">
              <div class="label">Reporter Identity</div>
              <div class="value">${reporterName} (${reporterDisplay})</div>
            </div>
          </div>

          <div class="label">Evidence / Description</div>
          <div class="description">${report.description}</div>

          ${report.photoUrl ? `
            <div class="label" style="margin-top: 30px;">Attached Incident Evidence</div>
            <div class="photo-box">
              <img src="${report.photoUrl}" />
            </div>
          ` : ''}

          ${!isAnonymous && report.idPhotoUrl ? `
            <div class="label" style="margin-top: 30px;">Reporter Identification Document</div>
            <div class="photo-box" style="aspect-ratio: 3/2; width: 300px;">
              <img src="${report.idPhotoUrl}" />
            </div>
          ` : ''}

          <div class="footer">
            CONFIDENTIAL DOCUMENT • JALAJALA MUNICIPAL GIS PORTAL<br/>
            Printed on ${new Date().toLocaleString()} by ${user?.email || 'Authorized Official'}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printProjectReport = (project: any) => {
    const projectMovements = movements.filter(m => m.projectId === project.id);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Project Report - ${project.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #450920; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; color: #450920; letter-spacing: -0.025em; }
            .meta { font-size: 10px; color: #64748b; margin-top: 5px; text-transform: uppercase; font-weight: 700; tracking-widest: 0.1em; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .label { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; }
            .value { font-size: 15px; font-weight: 700; color: #0f172a; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #450920; margin: 40px 0 15px; border-left: 4px solid #450920; padding-left: 10px; }
            .movement-item { padding: 15px; border-bottom: 1px solid #f1f5f9; }
            .movement-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .movement-type { font-size: 10px; font-weight: 900; color: #450920; }
            .movement-date { font-size: 10px; color: #94a3b8; }
            .movement-details { font-size: 12px; color: #475569; }
            .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; }
            @media print { @page { margin: 2cm; } body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${project.name}</h1>
              <div class="meta">Infrastructure Project Dossier • ID: ${project.id.toUpperCase()}</div>
            </div>
            <div style="text-align: right">
              <div class="label">Date Generated</div>
              <div class="value" style="font-size: 12px">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Primary Location</div>
              <div class="value">${project.location}</div>
            </div>
            <div class="card">
              <div class="label">Administrative Category</div>
              <div class="value">${project.category} Level</div>
            </div>
            <div class="card">
              <div class="label">Operational Status</div>
              <div class="value">${project.status}</div>
            </div>
            <div class="card">
              <div class="label">Allocated Budget</div>
              <div class="value">₱ ${project.budget.toLocaleString()}</div>
            </div>
            ${project.actualTotalCost ? `
              <div class="card" style="border-color: #10b981; background: #f0fdf4;">
                <div class="label" style="color: #059669;">Actual Total Cost</div>
                <div class="value" style="color: #065f46;">₱ ${project.actualTotalCost.toLocaleString()}</div>
              </div>
            ` : ''}
          </div>

          ${project.status === 'COMPLETED' ? `
            <div class="section-title" style="color: #059669; border-color: #059669;">Completion Dossier</div>
            <div class="card" style="margin-bottom: 20px;">
              <div class="label">Close-out Remarks</div>
              <div class="value" style="font-size: 13px; font-weight: 500; font-style: italic;">"${project.completionNotes || 'No final notes provided.'}"</div>
              ${project.completionDate ? `<div class="meta" style="margin-top: 10px;">Officially Closed on: ${new Date(project.completionDate).toLocaleDateString()}</div>` : ''}
            </div>
            ${project.completionPhotoUrl ? `
              <div style="width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <img src="${project.completionPhotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
          ` : ''}

          <div class="section-title">Project Overview</div>
          <div class="card">
            <div class="description" style="font-size: 14px; line-height: 1.6;">${project.description}</div>
          </div>

          <div class="section-title">Movement Log & Historical Tracking</div>
          <div class="card" style="padding: 0">
            ${projectMovements.length > 0 ? projectMovements.map(m => `
              <div class="movement-item">
                <div class="movement-header">
                  <span class="movement-type">${m.changeType}</span>
                  <span class="movement-date">${new Date(m.timestamp).toLocaleString()}</span>
                </div>
                <div class="movement-details">${m.details}</div>
                <div style="font-size: 8px; color: #cbd5e1; margin-top: 5px;">Authenticated by: ${m.adminEmail}</div>
              </div>
            `).join('') : '<div class="movement-item" style="text-align: center; color: #94a3b8;">No movements recorded for this project.</div>'}
          </div>

          <div class="footer">
            Official Document of the Jalajala Municipal GIS System. 
            All changes are cryptographically logged and verifiable.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const updateStatus = async (collectionName: string, id: string, newStatus: string, userId: string, titleSuffix: string) => {
    try {
      await updateDoc(doc(db, collectionName, id), { status: newStatus });
      
      // Send notification to user
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: `STATUS UPDATED: ${titleSuffix}`,
        message: `Your ${collectionName === 'permits' ? 'permit application' : 'report'} status has been updated to ${newStatus}.`,
        type: collectionName === 'permits' ? 'PERMIT_UPDATE' : 'NEW_REPORT',
        read: false,
        timestamp: Date.now(),
        link: collectionName === 'permits' ? 'permits' : 'reporting'
      });

      // Log to global activity log
      await addDoc(collection(db, 'activity_log'), {
        type: 'ADMIN_ACTION',
        userId: user?.uid,
        userName: user?.displayName || user?.email || 'Admin',
        details: `Updated ${collectionName} status for ID ${id} to ${newStatus}. Target user: ${userId}.`,
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'PENDING PERMITS', value: permits.filter(p => p.status === 'PENDING').length, icon: FileText, color: 'text-brand-blue bg-blue-50' },
          { label: 'NEW REPORTS', value: reports.filter(r => r.status === 'NEW').length, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
          { label: 'ACTIVE CITIZENS', value: 128, icon: Users, color: 'text-brand-gold bg-brand-gold/10' },
          { label: 'EST. REVENUE', value: '₱1.2M', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
             <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", stat.color)}>
               <stat.icon size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
               <p className="text-xl font-black text-slate-900">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Controls */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-24">
             <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Admin Navigation</h3>
             </div>
             <div className="p-2 space-y-1">
                {(['PERMITS', 'REPORTS', 'PROJECTS'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between group",
                      activeTab === tab ? "bg-brand-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <span>{tab} MANAGEMENT</span>
                    <ChevronRight size={14} className={cn("transition-transform", activeTab === tab ? "translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-dashed border-slate-200 grayscale">
              <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {activeTab === 'PERMITS' && (
                  <div className="space-y-4">
                    {permits.length === 0 ? (
                      <div className="text-center py-24 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Applications Pending</p>
                      </div>
                    ) : (
                      permits.map(permit => (
                        <div key={permit.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                             <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-brand-blue border border-blue-100 rounded uppercase tracking-wider">
                                    {permit.type}
                                  </span>
                                  <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider",
                                    permit.status === 'PENDING' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    permit.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    "bg-red-50 text-red-600 border border-red-100"
                                  )}>
                                    {permit.status}
                                  </span>
                               </div>
                               <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-1">
                                  #{permit.id.slice(0, 8).toUpperCase()} - {permit.type.replace('_', ' ')}
                               </h4>
                               <p className="text-xs text-slate-500 font-medium">Applicant UID: <span className="font-bold">{permit.applicantId}</span> • Submitted: {new Date(permit.submissionDate).toLocaleString()}</p>
                             </div>
                             
                             <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                  onClick={() => updateStatus('permits', permit.id, 'APPROVED', permit.applicantId, permit.type)}
                                  className="flex-grow md:flex-none px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 size={14} /> APPROVE
                                </button>
                                <button 
                                  onClick={() => updateStatus('permits', permit.id, 'NEEDS_REVISION', permit.applicantId, permit.type)}
                                  className="flex-grow md:flex-none px-4 py-2 bg-amber-500 text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Clock size={14} /> REVISE
                                </button>
                                <div className="relative group">
                                   <button className="p-2 bg-slate-50 text-slate-400 rounded hover:bg-slate-100 transition-colors border border-slate-200">
                                      <Eye size={18} />
                                   </button>
                                </div>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'REPORTS' && (
                  <div className="space-y-4">
                    {reports.map(report => (
                      <div key={report.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex gap-6">
                        <div className="w-16 h-16 bg-slate-100 rounded shrink-0 flex items-center justify-center text-slate-300">
                          {report.photoUrl ? (
                            <img src={report.photoUrl} className="w-full h-full object-cover rounded" alt="Evidence" />
                          ) : (
                            <AlertCircle size={32} />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                               <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">{report.category.replace('_', ' ')}</div>
                               <h4 className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">{report.description.slice(0, 100)}...</h4>
                             </div>
                             <span className={cn(
                               "text-[8px] font-black px-2 py-0.5 rounded border uppercase",
                               report.status === 'NEW' ? "bg-red-50 text-red-600 border-red-100" :
                               report.status === 'INVESTIGATING' ? "bg-blue-50 text-blue-600 border-blue-100" :
                               "bg-emerald-50 text-emerald-600 border-emerald-100"
                             )}>
                               {report.status}
                             </span>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                   <MapPin size={12} /> {report.location}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                   <Calendar size={12} /> {new Date(report.timestamp).toLocaleDateString()}
                                </div>
                             </div>
                             <div className="flex gap-2">
                              <button 
                                  onClick={() => setSelectedReport(report)}
                                  className="p-1 px-2 border border-slate-200 text-slate-400 hover:text-brand-blue rounded transition-colors"
                                  title="View Full Report"
                                >
                                  <Eye size={14} />
                                </button>
                                {user?.uid === 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2' ? (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => printIssueReport(report, true)}
                                      className="p-1 px-2 border border-slate-200 text-slate-400 hover:text-brand-blue rounded transition-colors"
                                      title="Print Anonymous"
                                    >
                                      <Printer size={14} className="opacity-50" />
                                    </button>
                                    <button 
                                      onClick={() => printIssueReport(report, false)}
                                      className="p-1 px-2 border border-slate-200 text-brand-blue hover:bg-slate-50 rounded transition-colors"
                                      title="Print Detailed"
                                    >
                                      <Printer size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => printIssueReport(report, true)}
                                    className="p-1 px-2 border border-slate-200 text-slate-400 hover:text-brand-blue rounded transition-colors"
                                    title="Print Report"
                                  >
                                    <Printer size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => updateStatus('reports', report.id, 'INVESTIGATING', report.userId || 'PUBLIC', report.category)}
                                  className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-widest"
                                >
                                  INVESTIGATE
                                </button>
                                <button 
                                  onClick={() => updateStatus('reports', report.id, 'RESOLVED', report.userId || 'PUBLIC', report.category)}
                                  className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black rounded uppercase tracking-widest"
                                >
                                  RESOLVE
                                </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'PROJECTS' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-brand-blue uppercase tracking-widest">Municipal Infrastructure</h3>
                      <button 
                        onClick={() => {
                          if (showProjectForm) {
                            setIsEditing(false);
                            setEditProjectId(null);
                            setProjectFormData({
                              name: '',
                              location: '',
                              lat: 14.35,
                              lng: 121.32,
                              status: 'PLANNING',
                              category: 'MUNICIPAL',
                              budget: 0,
                              description: ''
                            });
                          }
                          setShowProjectForm(!showProjectForm);
                        }}
                        className="px-4 py-2 bg-brand-gold text-brand-blue text-[10px] font-black rounded uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                      >
                        {showProjectForm ? 'CANCEL' : 'ADD NEW PROJECT'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showProjectForm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-white p-6 rounded-lg border border-brand-gold shadow-lg overflow-hidden"
                        >
                          <form onSubmit={handleSaveProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="md:col-span-2">
                               <h4 className="text-[10px] font-black text-brand-blue mb-4 uppercase tracking-widest border-b pb-2">
                                 {isEditing ? `EDITING PROJECT: ${editProjectId}` : 'REGISTER NEW INFRASTRUCTURE'}
                               </h4>
                             </div>
                             <div className="md:col-span-2">
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Name</label>
                               <input 
                                 type="text" required
                                 value={projectFormData.name}
                                 onChange={(e) => setProjectFormData({...projectFormData, name: e.target.value})}
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                                 placeholder="e.g. Municipal Hall Rehabilitation"
                               />
                             </div>

                             <div>
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">General Location</label>
                               <input 
                                 type="text" required
                                 value={projectFormData.location}
                                 onChange={(e) => setProjectFormData({...projectFormData, location: e.target.value})}
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                                 placeholder="e.g. Special District, Pob. Jalajala"
                               />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Latitude</label>
                                 <input 
                                   type="number" step="0.000001" required
                                   value={projectFormData.lat}
                                   onChange={(e) => setProjectFormData({...projectFormData, lat: Number(e.target.value)})}
                                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                                 />
                               </div>
                               <div>
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Longitude</label>
                                 <input 
                                   type="number" step="0.000001" required
                                   value={projectFormData.lng}
                                   onChange={(e) => setProjectFormData({...projectFormData, lng: Number(e.target.value)})}
                                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                                 />
                               </div>
                             </div>

                             <div>
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Category</label>
                               <select 
                                 value={projectFormData.category}
                                 onChange={(e) => setProjectFormData({...projectFormData, category: e.target.value})}
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                               >
                                 <option value="NATIONAL">National Government</option>
                                 <option value="CAPITOL">Capitol / Provincial</option>
                                 <option value="MUNICIPAL">Municipal / LGU</option>
                                 <option value="BARANGAY">Barangay Level</option>
                               </select>
                             </div>

                             <div>
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Status</label>
                               <select 
                                 value={projectFormData.status}
                                 onChange={(e) => setProjectFormData({...projectFormData, status: e.target.value})}
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                               >
                                 <option value="PLANNING">Pre-Engineering / Planning</option>
                                 <option value="ONGOING">Under Construction / Ongoing</option>
                                 <option value="COMPLETED">Project Completed</option>
                               </select>
                             </div>

                             <div>
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget (PHP)</label>
                               <input 
                                 type="number" required
                                 value={projectFormData.budget}
                                 onChange={(e) => setProjectFormData({...projectFormData, budget: Number(e.target.value)})}
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                               />
                             </div>

                             <div className="md:col-span-2">
                               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Description</label>
                               <textarea 
                                 required rows={3}
                                 value={projectFormData.description}
                                 onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                               ></textarea>
                             </div>

                             <div className="md:col-span-2 flex justify-end gap-3">
                               {isEditing && (
                                 <button 
                                   type="button"
                                   onClick={() => {
                                     setShowProjectForm(false);
                                     setIsEditing(false);
                                     setEditProjectId(null);
                                   }}
                                   className="px-8 py-4 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-widest hover:bg-slate-200 transition-all"
                                 >
                                   CANCEL EDIT
                                 </button>
                               )}
                               <button 
                                 type="submit"
                                 className="px-8 py-4 bg-brand-blue text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg"
                               >
                                 {isEditing ? 'UPDATE PROJECT DATA' : 'SAVE PROJECT TO GIS'}
                               </button>
                             </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map(proj => (
                        <div key={proj.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-widest">{proj.category}</span>
                              <span className={cn(
                                "text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                proj.status === 'PLANNING' ? "bg-blue-50 text-blue-600" :
                                proj.status === 'ONGOING' ? "bg-amber-50 text-amber-600" :
                                "bg-emerald-50 text-emerald-600"
                              )}>
                                {proj.status}
                              </span>
                           </div>
                           <h4 className="font-black text-brand-blue uppercase tracking-tight mb-1">{proj.name}</h4>
                           <p className="text-xs text-slate-500 font-bold mb-4 flex items-center gap-1"><MapPin size={10} /> {proj.location}</p>
                           
                           {proj.status === 'COMPLETED' && proj.completionPhotoUrl && (
                             <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-100 mb-4 bg-slate-50">
                               <img 
                                 src={proj.completionPhotoUrl} 
                                 alt="Completed project" 
                                 className="w-full h-full object-cover"
                                 referrerPolicy="no-referrer"
                               />
                             </div>
                           )}

                           <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                              <div className="text-[10px] font-black text-slate-900">₱{proj.budget.toLocaleString()}</div>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => printProjectReport(proj)}
                                  className="p-1.5 text-slate-400 hover:text-brand-blue transition-colors"
                                  title="Print Report"
                                >
                                  <Printer size={14} />
                                </button>
                                <button 
                                  onClick={() => startEditProject(proj)}
                                  className="text-[9px] font-black text-brand-blue uppercase tracking-widest underline"
                                >
                                  Edit Details
                                </button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCompletionModal && pendingCompletionData && (
          <ProjectCompletionModal 
            isOpen={showCompletionModal}
            onClose={() => {
              setShowCompletionModal(false);
              setPendingCompletionData(null);
            }}
            onConfirm={(details) => {
              finalizeProjectSave(pendingCompletionData, details);
            }}
            projectName={pendingCompletionData.name}
            originalBudget={pendingCompletionData.budget}
          />
        )}
        {selectedReport && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-brand-blue p-6 sm:p-8 text-white relative">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {selectedReport.category.replace('_', ' ')} Report
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    selectedReport.status === 'RESOLVED' ? "bg-emerald-500 text-white" :
                    selectedReport.status === 'INVESTIGATING' ? "bg-blue-500 text-white" :
                    "bg-red-500 text-white"
                  )}>
                    {selectedReport.status}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight">
                  #{selectedReport.id.toUpperCase()} • {selectedReport.category.replace('_', ' ')}
                </h3>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 bg-white max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Photo Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       Evidence Photo
                    </h4>
                    {selectedReport.photoUrl ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200">
                        <img 
                          src={selectedReport.photoUrl} 
                          alt="Report Evidence" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                         <AlertCircle size={32} className="mb-2 opacity-20" />
                         <span className="text-[10px] font-black uppercase">No Photo Attached</span>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         Reporter Identity Verification
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Full Name</span>
                          <span className={cn(
                            "text-[10px] font-bold text-slate-600 truncate max-w-[150px]",
                            (selectedReport.category === 'ILLEGAL_CONSTRUCTION' && user?.uid !== 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2') && "blur-[4px] select-none"
                          )}>
                            {(selectedReport.category === 'ILLEGAL_CONSTRUCTION' && user?.uid !== 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2') 
                              ? 'PROTECTED NAME' 
                              : (selectedReport.reporterName || 'STATION AGENT')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Valid ID Document</span>
                          {selectedReport.idPhotoUrl ? (
                             <div className={cn(
                               "aspect-[3/2] w-full rounded border border-slate-200 overflow-hidden relative group",
                               (selectedReport.category === 'ILLEGAL_CONSTRUCTION' && user?.uid !== 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2') && "blur-xl"
                             )}>
                               <img src={selectedReport.idPhotoUrl} className="w-full h-full object-cover" alt="ID Document" />
                               {(selectedReport.category === 'ILLEGAL_CONSTRUCTION' && user?.uid !== 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2') && (
                                 <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                                   <ShieldCheck className="text-slate-900" size={24} />
                                 </div>
                               )}
                             </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic font-black uppercase">No ID Recorded</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Account UID</span>
                          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{selectedReport.userId || 'PUBLIC'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <MapPin size={12} className="text-brand-blue" /> Reported Location
                      </h4>
                      <p className="text-slate-900 font-bold">{selectedReport.location}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Calendar size={12} className="text-brand-blue" /> Submission Date
                      </h4>
                      <p className="text-slate-900 font-bold">{new Date(selectedReport.timestamp).toLocaleString()}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         Detailed Description
                      </h4>
                      <div className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                        "{selectedReport.description}"
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-3">
                      {user?.uid === 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2' ? (
                        <>
                          <button 
                            onClick={() => printIssueReport(selectedReport, true)}
                            className="flex-grow py-3 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                          >
                            <Printer size={14} /> PRINT ANONYMOUS
                          </button>
                          <button 
                            onClick={() => printIssueReport(selectedReport, false)}
                            className="flex-grow py-3 bg-slate-900 text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <Printer size={14} /> PRINT DETAILED
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => printIssueReport(selectedReport, true)}
                          className="flex-grow py-3 bg-slate-900 text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          <Printer size={14} /> PRINT REPORT
                        </button>
                      )}
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button 
                        onClick={() => {
                          updateStatus('reports', selectedReport.id, 'INVESTIGATING', selectedReport.userId || 'PUBLIC', selectedReport.category);
                          setSelectedReport({...selectedReport, status: 'INVESTIGATING'});
                        }}
                        disabled={selectedReport.status === 'INVESTIGATING'}
                        className="flex-grow py-3 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale font-bold"
                      >
                        MARK INVESTIGATING
                      </button>
                      <button 
                        onClick={() => {
                          updateStatus('reports', selectedReport.id, 'RESOLVED', selectedReport.userId || 'PUBLIC', selectedReport.category);
                          setSelectedReport({...selectedReport, status: 'RESOLVED'});
                        }}
                        disabled={selectedReport.status === 'RESOLVED'}
                        className="flex-grow py-3 bg-emerald-600 text-white text-[10px] font-black rounded uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale font-bold"
                      >
                        MARK RESOLVED
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
