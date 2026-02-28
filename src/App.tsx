import React, { useState } from 'react';
import { 
  Activity, Pill, User, Building2, Stethoscope, 
  AlertTriangle, FileText, ClipboardList, Package, 
  Truck, Droplet, FlaskConical, Dna, Network, 
  ChevronRight, Info, Link as LinkIcon, Search, Compass,
  LayoutGrid, Share2, Database, X
} from 'lucide-react';
import OntologyGraph from './components/OntologyGraph';
import { entityData } from './data/mockData';

// --- DATA DEFINITION ---

const nodes: Record<string, any> = {
  Trial: { id: 'Trial', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', domain: 'Design', props: ['trial_id', 'phase', 'status', 'start_date', 'enrollment_target'] },
  Endpoint: { id: 'Endpoint', icon: ChevronRight, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', domain: 'Design', props: ['endpoint_id', 'type (Primary, Secondary)', 'description'] },
  Condition: { id: 'Condition', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', domain: 'Design', props: ['condition_id', 'name', 'mesh_term'] },
  Drug: { id: 'Drug', icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', domain: 'Design', props: ['drug_id', 'name', 'mechanism_of_action'] },
  
  Site: { id: 'Site', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', domain: 'Operations', props: ['site_id', 'name', 'country', 'historical_performance_score'] },
  Investigator: { id: 'Investigator', icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', domain: 'Operations', props: ['investigator_id', 'name', 'specialty', 'active_trials_count'] },
  ProtocolDeviation: { id: 'ProtocolDeviation', icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', domain: 'Operations', props: ['deviation_id', 'category', 'severity', 'date_logged'] },
  
  Patient: { id: 'Patient', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', domain: 'Patient Journey', props: ['patient_id', 'age', 'gender', 'biomarker_status'] },
  AdverseEvent: { id: 'AdverseEvent', icon: AlertTriangle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', domain: 'Patient Journey', props: ['event_id', 'severity_grade', 'report_date'] },
  MedDRATerm: { id: 'MedDRATerm', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', domain: 'Patient Journey', props: ['term_id', 'preferred_term', 'system_organ_class'] },
  
  ClinicalSupply: { id: 'ClinicalSupply', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', domain: 'Supply Chain', props: ['kit_id', 'batch_number', 'status', 'expiration_date'] },
  Shipment: { id: 'Shipment', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', domain: 'Supply Chain', props: ['shipment_id', 'dispatch_date', 'delivery_date', 'temperature_excursion'] },
  Biosample: { id: 'Biosample', icon: Droplet, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', domain: 'Supply Chain', props: ['sample_id', 'sample_type', 'collection_date'] },
  Lab: { id: 'Lab', icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', domain: 'Supply Chain', props: ['lab_id', 'name', 'certification_status'] },
  Biomarker: { id: 'Biomarker', icon: Dna, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', domain: 'Supply Chain', props: ['biomarker_id', 'gene_mutation', 'expression_level'] },
};

const edges = [
  // Design
  { source: 'Trial', target: 'Drug', label: 'INVESTIGATES', props: [] },
  { source: 'Trial', target: 'Condition', label: 'TARGETS', props: [] },
  { source: 'Trial', target: 'Endpoint', label: 'EVALUATES', props: [] },
  { source: 'Trial', target: 'Site', label: 'CONDUCTED_AT', props: ['activation_date', 'current_enrollment'] },
  // Operations
  { source: 'Site', target: 'Investigator', label: 'MANAGED_BY', props: ['role'] },
  { source: 'Investigator', target: 'Trial', label: 'TRAINED_ON', props: ['date'] },
  { source: 'ProtocolDeviation', target: 'Site', label: 'OCCURRED_AT', props: [] },
  { source: 'ProtocolDeviation', target: 'Investigator', label: 'COMMITTED_BY', props: [] },
  // Patient Journey
  { source: 'Patient', target: 'Trial', label: 'ENROLLED_IN', props: ['enrollment_date', 'status'] },
  { source: 'Patient', target: 'Site', label: 'TREATED_AT', props: [] },
  { source: 'Patient', target: 'ProtocolDeviation', label: 'AFFECTED_BY', props: [] },
  { source: 'Patient', target: 'AdverseEvent', label: 'EXPERIENCED', props: ['action_taken'] },
  { source: 'AdverseEvent', target: 'MedDRATerm', label: 'CLASSIFIED_AS', props: [] },
  { source: 'AdverseEvent', target: 'Trial', label: 'OCCURRED_DURING', props: [] },
  // Supply Chain
  { source: 'ClinicalSupply', target: 'Drug', label: 'PART_OF_BATCH', props: [] },
  { source: 'Shipment', target: 'ClinicalSupply', label: 'CONTAINS', props: [] },
  { source: 'Shipment', target: 'Site', label: 'SHIPPED_TO', props: ['transit_days'] },
  { source: 'Patient', target: 'ClinicalSupply', label: 'CONSUMED_BY', props: ['dispense_date'] },
  { source: 'Patient', target: 'Biosample', label: 'PROVIDED', props: [] },
  { source: 'Biosample', target: 'Lab', label: 'SENT_TO', props: [] },
  { source: 'Biosample', target: 'Biomarker', label: 'TESTED_FOR', props: ['result_value'] },
];

const domains: Record<string, any> = {
  'Design': { title: 'Trial & Design Architecture', color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50/50' },
  'Operations': { title: 'Site & Operations', color: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50/50' },
  'Patient Journey': { title: 'Patient Journey & Safety', color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
  'Supply Chain': { title: 'Supply Chain & Biosamples', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50/50' }
};

// --- COMPONENTS ---

const Logos = () => (
  <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 border-b border-purple-200 pb-6 mb-8">
    <div className="flex items-center gap-2">
      <Network className="w-8 h-8 text-purple-600" />
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ontology<span className="text-slate-500 font-light"> Explorer</span></h1>
    </div>
    <div className="flex-1" />
    <div className="flex items-center gap-6">
      {/* Accenture Logo styling */}
      <div className="flex items-center">
        <span className="text-xl font-bold tracking-tighter text-slate-900">accenture</span>
        <span className="text-2xl font-bold text-[#A100FF] ml-1 leading-none">&gt;</span>
      </div>
      <div className="hidden md:block w-px h-8 bg-purple-200" />
      {/* Alexion Logo styling */}
      <div className="flex flex-col items-start justify-center">
        <span className="text-lg font-black tracking-widest text-[#002c5f] leading-none">ALEXION</span>
        <span className="text-[0.5rem] tracking-wider text-slate-500 font-semibold uppercase leading-tight">AstraZeneca Rare Disease</span>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeNode, setActiveNode] = useState('Trial');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'graph' | 'grid'>('graph');
  const [showDataModal, setShowDataModal] = useState(false);
  
  const selectedNodeData = nodes[activeNode];
  const relatedEdges = edges.filter(e => e.source === activeNode || e.target === activeNode);
  const activeNodeData = entityData[activeNode] || [];

  const filteredNodes = Object.values(nodes).filter(node => 
    node.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    node.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfaff] text-slate-700 p-4 md:p-8 font-sans selection:bg-purple-200">
      <div className="max-w-[1800px] mx-auto">
        <Logos />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          {/* Column 1: Ontology Navigator Panel */}
          <div className="xl:col-span-1 space-y-6">
            <div className="rounded-xl border border-purple-100 bg-white/90 shadow-sm p-6 flex flex-col">
               <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
                  <Compass className="w-4 h-4 text-purple-500" /> Ontology Navigator
                </h3>
                
                <div className="relative mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search entities or domains..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-100 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex-1 space-y-6">
                  {Object.keys(domains).map(domainKey => {
                    const domainNodes = filteredNodes.filter(n => n.domain === domainKey);
                    if (domainNodes.length === 0) return null;
                    
                    return (
                      <div key={domainKey} className="space-y-3">
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest ${domains[domainKey].color}`}>
                          {domainKey}
                        </h4>
                        <div className="space-y-1.5">
                          {domainNodes.map(node => {
                            const isActive = activeNode === node.id;
                            const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id).length;
                            return (
                              <button
                                key={node.id}
                                onClick={() => setActiveNode(node.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all border
                                  ${isActive 
                                    ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-sm' 
                                    : 'bg-transparent border-transparent text-slate-600 hover:bg-purple-50/50 hover:text-slate-900'}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <node.icon className={`w-4 h-4 ${isActive ? node.color : 'text-slate-400'}`} />
                                  <span className={isActive ? 'font-medium' : ''}>{node.id}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-white text-purple-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                                  {nodeEdges} edges
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>

          {/* Column 2 & 3: Main Visual Grid / Graph */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 ml-2">Ontology Visualization</h2>
              <div className="flex bg-purple-50 rounded-lg p-1 border border-purple-100">
                <button 
                  onClick={() => setViewMode('graph')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'graph' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Share2 className="w-4 h-4" /> Graph
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <LayoutGrid className="w-4 h-4" /> Grid
                </button>
              </div>
            </div>

            {viewMode === 'graph' ? (
              <div className="h-[700px]">
                <OntologyGraph 
                  nodesData={nodes} 
                  edgesData={edges} 
                  activeNode={activeNode} 
                  onNodeClick={setActiveNode} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(domains).map(([domainKey, domainData]) => (
                  <div key={domainKey} className={`rounded-xl border ${domainData.border} ${domainData.bg} p-6 transition-all duration-300 shadow-sm`}>
                    <h2 className={`text-sm font-bold uppercase tracking-wider mb-5 ${domainData.color}`}>
                      {domainData.title}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {Object.values(nodes)
                        .filter(n => n.domain === domainKey)
                        .map(node => {
                          const Icon = node.icon;
                          const isActive = activeNode === node.id;
                          return (
                            <button
                              key={node.id}
                              onClick={() => setActiveNode(node.id)}
                              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border transition-all duration-200 shadow-sm
                                ${isActive 
                                  ? `${node.bg} ${node.border} ring-2 ring-${node.color.split('-')[1]}-400 ring-offset-1` 
                                  : 'border-white bg-white hover:bg-purple-50 hover:border-purple-200'}`}
                            >
                              <Icon className={`w-4 h-4 ${isActive ? node.color : 'text-slate-400'}`} />
                              <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                                {node.id}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 4: Details & Relationships Panel */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Selected Node Details */}
            <div className={`rounded-xl border p-6 bg-white/90 shadow-sm border-purple-100 relative overflow-hidden`}>
              {/* Decorative background glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40 ${selectedNodeData.bg.replace('/10', '')}`} />
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`p-3.5 rounded-xl ${selectedNodeData.bg} ${selectedNodeData.border} border shadow-sm`}>
                  <selectedNodeData.icon className={`w-6 h-6 ${selectedNodeData.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedNodeData.id}</h2>
                  <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${selectedNodeData.color}`}>
                    {selectedNodeData.domain}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-500" /> Properties
                  </h3>
                  {activeNodeData.length > 0 && (
                    <button 
                      onClick={() => setShowDataModal(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md transition-colors border border-purple-200"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Preview Data
                    </button>
                  )}
                </div>
                <ul className="space-y-3 pt-1">
                  {selectedNodeData.props.map((prop: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 mt-1.5 shrink-0" />
                      <span className="text-slate-600 font-mono text-xs font-medium">{prop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Relationships Details */}
            <div className="rounded-xl border border-purple-100 bg-white/90 shadow-sm p-6">
               <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 border-b border-purple-100 pb-4 mb-5">
                  <LinkIcon className="w-4 h-4 text-purple-500" /> Relationships ({relatedEdges.length})
                </h3>
                <div className="space-y-4">
                  {relatedEdges.map((edge, idx) => {
                    const isSource = edge.source === activeNode;
                    const relatedNodeId = isSource ? edge.target : edge.source;
                    const relatedNode = nodes[relatedNodeId];
                    const RIcon = relatedNode.icon;
                    
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex flex-col gap-3 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
                          <span>{isSource ? 'Outgoing' : 'Incoming'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSource ? (
                            <>
                              <span className="text-slate-900 text-sm font-semibold">{activeNode}</span>
                              <div className="flex-1 h-px bg-purple-200 relative">
                                <ChevronRight className="w-3 h-3 absolute right-0 -top-1.5 text-purple-400" />
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded bg-white border border-purple-100 text-purple-700 whitespace-nowrap shadow-sm`}>
                                {edge.label}
                              </span>
                              <div className="flex-1 h-px bg-purple-200 relative">
                                <ChevronRight className="w-3 h-3 absolute right-0 -top-1.5 text-purple-400" />
                              </div>
                              <button 
                                onClick={() => setActiveNode(relatedNode.id)}
                                className={`flex items-center gap-1.5 text-sm font-semibold ${relatedNode.color} hover:underline`}
                              >
                                <RIcon className="w-3.5 h-3.5" />
                                {relatedNode.id}
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => setActiveNode(relatedNode.id)}
                                className={`flex items-center gap-1.5 text-sm font-semibold ${relatedNode.color} hover:underline`}
                              >
                                <RIcon className="w-3.5 h-3.5" />
                                {relatedNode.id}
                              </button>
                              <div className="flex-1 h-px bg-purple-200 relative">
                                <ChevronRight className="w-3 h-3 absolute right-0 -top-1.5 text-purple-400" />
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded bg-white border border-purple-100 text-purple-700 whitespace-nowrap shadow-sm`}>
                                {edge.label}
                              </span>
                              <div className="flex-1 h-px bg-purple-200 relative">
                                <ChevronRight className="w-3 h-3 absolute right-0 -top-1.5 text-purple-400" />
                              </div>
                              <span className="text-slate-900 text-sm font-semibold">{activeNode}</span>
                            </>
                          )}
                        </div>
                        {edge.props.length > 0 && (
                          <div className="mt-2 pt-3 border-t border-purple-100 flex flex-wrap gap-1.5">
                             {edge.props.map((p, i) => (
                               <span key={i} className="text-[10px] uppercase font-mono tracking-wider bg-white border border-purple-100 text-slate-500 px-2 py-0.5 rounded shadow-sm">
                                 {p}
                               </span>
                             ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview Modal */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 w-full max-w-5xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-purple-50/30">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedNodeData.bg} ${selectedNodeData.border} border`}>
                  <Database className={`w-5 h-5 ${selectedNodeData.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeNode} Data Preview</h2>
                  <p className="text-sm text-slate-500">Sample records from the underlying dataset</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDataModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto custom-scrollbar flex-1 bg-[#fcfaff]">
              {activeNodeData.length > 0 ? (
                <div className="rounded-xl border border-purple-100 overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-purple-50/50 border-b border-purple-100">
                        <tr>
                          {Object.keys(activeNodeData[0]).map((key) => (
                            <th key={key} className="px-4 py-3 font-semibold text-slate-700 uppercase tracking-wider text-xs">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {activeNodeData.map((row, i) => (
                          <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Database className="w-12 h-12 mb-4 opacity-20" />
                  <p>No sample data available for this entity.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-purple-100 bg-purple-50/30 flex justify-end">
              <button 
                onClick={() => setShowDataModal(false)}
                className="px-4 py-2 bg-white border border-purple-200 text-slate-700 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
