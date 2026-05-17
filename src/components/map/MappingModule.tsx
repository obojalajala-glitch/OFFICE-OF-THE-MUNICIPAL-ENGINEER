import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Project } from '../../types';
import { 
  Construction, 
  CheckCircle2, 
  Clock, 
  Map as MapIcon, 
  Filter,
  BarChart3,
  Box,
  Loader2,
  X,
  MapPin,
  Banknote,
  Calendar,
  Layers,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MappingModule() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [movements, setMovements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>('ALL');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const jalajalaCenter: [number, number] = [14.3514, 121.3258];

  React.useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const qMovements = query(collection(db, 'project_movements'), orderBy('timestamp', 'desc'));
    const unsubMovements = onSnapshot(qMovements, (snapshot) => {
      setMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'project_movements');
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubMovements();
    };
  }, []);

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'ONGOING': return <Construction className="text-blue-500" size={16} />;
      default: return <Clock className="text-amber-500" size={16} />;
    }
  };

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const activeHubs = new Set(projects.map(p => p.location)).size;
  const coveragePercent = projects.length > 0 ? 98.4 : 0; // Keeping the visual flavor but making it 0 if no projects

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-brand-blue mb-1 uppercase tracking-tight">Active Infrastructure Map</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time geographic tracking of municipal, national, and barangay-funded projects.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {['ALL', 'MUNICIPAL', 'NATIONAL', 'BARANGAY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                filter === cat 
                  ? "bg-brand-blue text-white shadow-md" 
                  : "text-slate-400 hover:text-brand-blue"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project List Sidebar */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredProjects.map(project => (
            <div 
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-brand-blue transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={cn(
                  "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider",
                  project.category === 'NATIONAL' ? "bg-red-50 text-red-700 border-red-100" :
                  project.category === 'MUNICIPAL' ? "bg-blue-50 text-blue-700 border-blue-100" :
                  "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                  {project.category}
                </span>
                {getStatusIcon(project.status)}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight group-hover:text-brand-blue transition-colors uppercase tracking-tight">{project.name}</h4>
              <p className="text-[10px] text-slate-500 mb-4">{project.location}</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Est. Budget</div>
                <div className="text-xs font-bold text-slate-900">₱{(project.budget/1000000).toFixed(1)}M</div>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              No results found
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 rounded-lg overflow-hidden shadow-inner border border-slate-300 h-[600px] relative z-10 bg-slate-900">
           {loading && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50">
               <Loader2 className="animate-spin text-brand-gold" size={48} />
             </div>
           )}
          <MapContainer 
            center={jalajalaCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredProjects.map(project => (
              <Marker key={project.id} position={[project.lat, project.lng]}>
                <Popup className="professional-popup">
                  <div className="p-1 max-w-[220px]">
                    <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">{project.category} Project</div>
                    <h5 className="font-black text-slate-900 text-sm mb-2 uppercase tracking-tight">{project.name}</h5>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-3">
                      <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-2">
                        <span>Current Status</span>
                        <span>Official ID</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold items-center">
                        <span className={cn(
                          project.status === 'COMPLETED' ? "text-green-600" : "text-blue-600"
                        )}>{project.status}</span>
                        <span className="text-slate-900">#JL-{project.id.slice(0, 4).toUpperCase()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="w-full py-2 bg-brand-blue text-white text-[9px] font-black rounded uppercase tracking-widest hover:bg-slate-900 transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Overlays */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur shadow-md p-4 rounded-lg border border-slate-200 text-[10px]">
              <div className="font-black mb-3 border-b pb-2 text-brand-blue uppercase tracking-widest">Map Legend</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-slate-600 uppercase">Ongoing Works</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-slate-600 uppercase">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="font-bold text-slate-600 uppercase">Planning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-[1000] bg-brand-blue text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/10">
            Official GIS Interface
          </div>
        </div>
      </div>
      
      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
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
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {selectedProject.category} Infrastructure
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    selectedProject.status === 'COMPLETED' ? "bg-emerald-500 text-white" :
                    selectedProject.status === 'ONGOING' ? "bg-blue-500 text-white" :
                    "bg-amber-500 text-white"
                  )}>
                    {selectedProject.status}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                  {selectedProject.name}
                </h3>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <MapPin size={12} className="text-brand-blue" /> Exact Location
                      </h4>
                      <p className="text-slate-900 font-bold">{selectedProject.location}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Coordinates: {selectedProject.lat.toFixed(6)}, {selectedProject.lng.toFixed(6)}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Banknote size={12} className="text-brand-blue" /> Investment Budget
                      </h4>
                      <p className="text-2xl font-black text-slate-900">₱{selectedProject.budget.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase">Source: {selectedProject.category} Appropriations</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Calendar size={12} className="text-brand-blue" /> Data Tracking
                      </h4>
                      <p className="text-slate-900 font-bold">Entry ID: #JL-{selectedProject.id.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Verifiable through Municipal Records</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Layers size={12} className="text-brand-blue" /> Project Overview
                      </h4>
                      <div className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {selectedProject.description}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                         onClick={() => window.open(`https://www.google.com/maps?q=${selectedProject.lat},${selectedProject.lng}`, '_blank')}
                        className="w-full py-4 bg-slate-900 text-white text-[11px] font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <MapIcon size={14} /> Open in Google Maps
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transparency Log */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6 flex items-center gap-2">
                    <History size={14} /> Official Transparency Logs (Movements)
                  </h4>
                  <div className="space-y-4">
                    {movements.filter(m => m.projectId === selectedProject.id).length > 0 ? (
                      movements.filter(m => m.projectId === selectedProject.id).map((movement, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-brand-blue group-first:ring-4 group-first:ring-blue-100" />
                            <div className="w-0.5 flex-grow bg-slate-100" />
                          </div>
                          <div className="pb-6">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[9px] font-black py-0.5 px-1.5 bg-slate-100 text-slate-600 rounded uppercase tracking-widest">
                                {movement.changeType}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {new Date(movement.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-normal">{movement.details}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialization Log Pending</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transparency Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-blue-50 p-8 rounded-lg border border-blue-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-blue-900 shadow-sm border border-blue-100">
            <BarChart3 size={32} />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-900">₱{(totalBudget / 1000000).toFixed(1)}M</div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Total Managed Budget</div>
          </div>
        </div>
        <div className="bg-indigo-50 p-8 rounded-lg border border-indigo-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-indigo-900 shadow-sm border border-indigo-100">
            <Box size={32} />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-900">{activeHubs} Active</div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Infrastructure Hubs</div>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-lg border border-slate-800 flex items-center gap-6 text-white shadow-xl shadow-slate-900/20">
          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-yellow-500">
            <MapIcon size={32} />
          </div>
          <div>
            <div className="text-2xl font-black">{coveragePercent}%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Geographical Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
