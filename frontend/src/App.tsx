import { useState, useEffect } from 'react';
import { 
  Shield, AlertOctagon, Activity, Database, CheckCircle2, 
  ChevronLeft, Award, Network, RefreshCw, BrainCircuit, Check, Terminal, Compass
} from 'lucide-react';
import { api } from './services/api';
import type { Incident, DashboardStats, MemoryCard, AIRecommendation, Pattern, LearningJourneyItem } from './types';
import { SeverityBadge, StatusBadge } from './components/Badges';
import { MemoryGraph } from './components/MemoryGraph';
import { DemoWizard } from './components/DemoWizard';

export default function App() {
  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patterns' | 'learning' | 'graph'>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  // API Data
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [timelineItems, setTimelineItems] = useState<LearningJourneyItem[]>([]);
  
  // Investigation Workspace State
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [reflection, setReflection] = useState<string>('');
  
  // Action/Animation States
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationStep, setInvestigationStep] = useState(0);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalLogs, setApprovalLogs] = useState<string[]>([]);
  const [hasApproved, setHasApproved] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [hasResolved, setHasResolved] = useState(false);
  const [isRetaining, setIsRetaining] = useState(false);
  const [hasRetained, setHasRetained] = useState(false);
  const [newMemoryCreated, setNewMemoryCreated] = useState<any>(null);
  
  // Demo Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [systemFilter, setSystemFilter] = useState('');

  // Fetch baseline stats & list
  const loadData = async () => {
    try {
      const health = await api.getHealth();
      setHealthInfo(health);
      
      const dashboardStats = await api.getDashboardStats();
      setStats(dashboardStats);
      
      const list = await api.getIncidents();
      setIncidents(list);
      
      const pat = await api.getPatterns();
      setPatterns(pat);
      
      const journey = await api.getLearningTimeline();
      setTimelineItems(journey);
    } catch (e) {
      console.error("Error loading SOC data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered incidents
  const filteredIncidents = incidents.filter(i => {
    if (severityFilter && i.severity.toUpperCase() !== severityFilter.toUpperCase()) return false;
    if (statusFilter && i.status.toUpperCase() !== statusFilter.toUpperCase()) return false;
    if (systemFilter && !i.system.toLowerCase().includes(systemFilter.toLowerCase())) return false;
    return true;
  });

  // Handle opening incident for investigation
  const openIncident = async (id: string) => {
    setSelectedIncidentId(id);
    // Reset workflow animation states
    setRecommendation(null);
    setMemories([]);
    setReflection('');
    setInvestigationStep(0);
    setHasApproved(false);
    setApprovalLogs([]);
    setHasResolved(false);
    setHasRetained(false);
    setNewMemoryCreated(null);
    
    try {
      const details = await api.getIncidentById(id);
      setCurrentIncident(details);
      
      // If it was already resolved, load its resolution parameters directly
      if (details.status === 'Resolved') {
        setHasApproved(true);
        setHasResolved(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run AI investigation with timeline steps
  const runInvestigation = async () => {
    if (!selectedIncidentId) return;
    setIsInvestigating(true);
    setInvestigationStep(1);

    // Simulated step delays for realistic SOC dashboard visual flow
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    await delay(700);
    setInvestigationStep(2);
    await delay(700);
    setInvestigationStep(3);
    await delay(800);
    setInvestigationStep(4);
    
    try {
      const result = await api.investigateIncident(selectedIncidentId);
      
      await delay(600);
      setInvestigationStep(5);
      
      // Update local variables
      setCurrentIncident(result.incident);
      setRecommendation(result.recommendation);
      setMemories(result.memories);
      setReflection(result.reflection);
      
      // Reload incidents list to refresh status in background
      const list = await api.getIncidents();
      setIncidents(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Approve action
  const handleApprove = async () => {
    if (!selectedIncidentId) return;
    setIsApproving(true);
    setApprovalLogs(["Deploying simulated remediation environment...", "Resolving approved security action tokens..."]);
    
    try {
      const result = await api.approveRecommendation(selectedIncidentId);
      
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      for (const log of result.simulated_logs) {
        await delay(500);
        setApprovalLogs(prev => [...prev, log]);
      }
      setHasApproved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsApproving(false);
    }
  };

  // Resolve action
  const handleResolve = async () => {
    if (!selectedIncidentId || !currentIncident) return;
    setIsResolving(true);
    
    // Auto-generate resolution request parameters based on target incident
    let reqData = {
      actions_taken: currentIncident.incident_id === 'INC-1042' 
        ? ["Block IP 198.51.100.42", "Disable password authentication", "Enable key-based authentication", "Add rate limiting"]
        : currentIncident.incident_id === 'INC-1097'
          ? ["Key-based database bastion", "Rate limit auth fail database", "VPC security group lock"]
          : ["Network isolation host", "Sudoers file restore", "Key SSH enforcement", "Kernel vulnerability patching"],
      resolution: currentIncident.incident_id === 'INC-1042'
        ? "Exposed password login closed. Switched to authorization keypairs, rate limiting added."
        : currentIncident.incident_id === 'INC-1097'
          ? "Database port closed to public subnets. Tunnel routing enabled, VPN credentials configured."
          : "Host isolated from backend, malicious backdoor admin accounts removed, sudo configuration restored, kernel security patches applied.",
      resolution_time: currentIncident.incident_id === 'INC-1042' ? 11 : currentIncident.incident_id === 'INC-1097' ? 15 : 22,
      outcome: "Successfully contained. Hardened auth applied.",
      lessons_learned: currentIncident.incident_id === 'INC-1042'
        ? "Password authentication is insecure on production public subnets."
        : currentIncident.incident_id === 'INC-1097'
          ? "IP blocking alone is insufficient against proxy-rotated credential spraying."
          : "Coordinated privilege escalation must bypass default IP rules to trigger host level isolation."
    };

    try {
      const resolved = await api.resolveIncident(selectedIncidentId, reqData);
      setCurrentIncident(resolved);
      setHasResolved(true);
      
      // Update statistics
      const dashboardStats = await api.getDashboardStats();
      setStats(dashboardStats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResolving(false);
    }
  };

  // Retain action
  const handleRetain = async () => {
    if (!selectedIncidentId) return;
    setIsRetaining(true);
    try {
      const res = await api.retainIncidentMemory(selectedIncidentId);
      setNewMemoryCreated(res.memory_details);
      setHasRetained(true);
      
      // Reload stats and datasets
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRetaining(false);
    }
  };

  // Demo Wizard Action executor
  const handleWizardAction = async (action: string) => {
    try {
      if (action === "RESET_DB") {
        await api.resetDatabase();
        await loadData();
        setSelectedIncidentId(null);
        setWizardStep(1);
      } else if (action === "OPEN_INC_1042") {
        await openIncident("INC-1042");
        setWizardStep(2);
      } else if (action === "INVESTIGATE") {
        await runInvestigation();
        setWizardStep(currentStep => currentStep + 1);
      } else if (action === "APPROVE") {
        await handleApprove();
        setWizardStep(4);
      } else if (action === "RETAIN") {
        await handleResolve();
        await handleRetain();
        setWizardStep(5);
      } else if (action === "OPEN_INC_1097") {
        setSelectedIncidentId(null);
        await openIncident("INC-1097");
        setWizardStep(6);
      } else if (action === "RESOLVE_1097") {
        await handleApprove();
        await handleResolve();
        await handleRetain();
        setWizardStep(8);
      } else if (action === "OPEN_INC_1138") {
        setSelectedIncidentId(null);
        await openIncident("INC-1138");
        setWizardStep(9);
      } else if (action === "INVESTIGATE_1138") {
        await runInvestigation();
        setWizardStep(10);
      }
    } catch (e) {
      console.error("Wizard execution error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-cyberDark text-slate-100 flex flex-col font-sans selection:bg-cyberBlue/30 selection:text-white">
      
      {/* Simulation Banner */}
      <div className="bg-amber-950/20 border-b border-amber-500/25 px-4 py-1.5 text-center text-xs font-semibold font-mono text-amber-400 select-none tracking-wider">
        ⚠️ [SIMULATION MODULE ACTIVE] — HOST IS ISOLATED FROM LIVE INFRASTRUCTURE
      </div>

      {/* Main Header */}
      <header className="bg-slate-950/60 border-b border-cyberBorder px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden cyber-scanner">
        <div className="z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyberBlue/10 border border-cyberBlue/35 shadow-[0_0_12px_rgba(0,240,255,0.15)] animate-pulse">
              <Shield className="w-6 h-6 text-cyberBlue" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest text-white font-orbitron flex items-center gap-2">
                INCIDENT MEMORY OS
                <span className="text-[9px] font-mono font-bold bg-cyberBlue/10 text-cyberBlue border border-cyberBlue/30 px-1.5 py-0.2 rounded-sm tracking-normal">
                  v3.5a
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono mt-0.5">
                "Your SOC shouldn't have to learn the same lesson twice."
              </p>
            </div>
          </div>
        </div>

        {/* System Settings & Status */}
        <div className="flex items-center gap-3.5 z-10 font-mono">
          {healthInfo && (
            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              healthInfo.hindsight.mode === 'live' 
                ? 'bg-emerald-950/30 text-cyberGreen border-emerald-500/40 shadow-[0_0_8px_rgba(57,255,20,0.15)]' 
                : 'bg-yellow-950/30 text-cyberYellow border-yellow-500/40 shadow-[0_0_8px_rgba(254,254,0,0.15)]'
            }`}>
              <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
              {healthInfo.hindsight.mode === 'live' 
                ? 'HINDSIGHT PERSISTENT' 
                : 'DEMO FALLBACK (LOCAL)'}
            </div>
          )}
          <button 
            onClick={() => handleWizardAction("RESET_DB")}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-850 hover:border-cyberRed/50 hover:bg-slate-900/60 text-slate-350 hover:text-white rounded-lg text-xs font-semibold transition-all duration-300 active:scale-95 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 hover:rotate-180 transition-transform duration-500" />
            Reset DB
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-slate-950/30 border-b border-cyberBorder px-6 flex justify-between items-center z-10">
        <div className="flex -mb-px">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedIncidentId(null); }}
            className={`px-5 py-4.5 text-[10px] font-bold uppercase tracking-widest font-orbitron border-b-2 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'dashboard' && !selectedIncidentId 
                ? 'border-cyberBlue text-cyberBlue glow-text-blue' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            SOC Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('patterns'); setSelectedIncidentId(null); }}
            className={`px-5 py-4.5 text-[10px] font-bold uppercase tracking-widest font-orbitron border-b-2 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'patterns' 
                ? 'border-cyberBlue text-cyberBlue glow-text-blue' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Emerging Patterns
          </button>
          <button 
            onClick={() => { setActiveTab('learning'); setSelectedIncidentId(null); }}
            className={`px-5 py-4.5 text-[10px] font-bold uppercase tracking-widest font-orbitron border-b-2 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'learning' 
                ? 'border-cyberBlue text-cyberBlue glow-text-blue' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Learning Journey
          </button>
          <button 
            onClick={() => { setActiveTab('graph'); setSelectedIncidentId(null); }}
            className={`px-5 py-4.5 text-[10px] font-bold uppercase tracking-widest font-orbitron border-b-2 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'graph' 
                ? 'border-cyberBlue text-cyberBlue glow-text-blue' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Memory Graph
          </button>
        </div>
        
        {/* Quick stats on tab header */}
        {stats && (
          <div className="hidden lg:flex items-center gap-5 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyberRed animate-pulse"></span>
              Active: <span className="text-cyberRed font-bold">{stats.active_incidents}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyberBlue"></span>
              Resolved: <span className="text-cyberBlue font-bold">{stats.resolved_incidents}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyberGreen"></span>
              Memory: <span className="text-cyberGreen font-bold">{stats.memory_facts}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* Selected Incident Investigation Workspace */}
        {selectedIncidentId ? (
          <div className="space-y-6 animate-fade-in-up">
            {/* Breadcrumb / Back button */}
            <button 
              onClick={() => setSelectedIncidentId(null)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase font-mono text-slate-400 hover:text-cyberBlue transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              [ Back to Registry ]
            </button>

            {currentIncident && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Incident Summary & Live AI timeline */}
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="glass-panel rounded-xl p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyberBlue/10 to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyberBlue/70 tracking-widest">{currentIncident.incident_id}</span>
                        <h2 className="text-base font-bold text-white mt-1 font-orbitron">{currentIncident.title}</h2>
                      </div>
                      <SeverityBadge value={currentIncident.severity} />
                    </div>

                    <div className="border-t border-cyberBorder/30 pt-3 grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Target Host</span>
                        <span className="font-semibold text-slate-350">{currentIncident.system}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Attack Class</span>
                        <span className="font-semibold text-slate-350">{currentIncident.type}</span>
                      </div>
                    </div>

                    <div className="border-t border-cyberBorder/30 pt-3 space-y-1">
                      <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider">Incident Brief</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentIncident.description}</p>
                    </div>

                    <div className="border-t border-cyberBorder/30 pt-3 space-y-2">
                      <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider">Attack Signatures</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentIncident.indicators.map((ind, idx) => (
                          <span key={idx} className="bg-slate-950/80 border border-cyberBorder/50 px-2 py-0.5 rounded font-mono text-[9px] text-cyberBlue">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Agent Timeline Progress */}
                  <div className="glass-panel rounded-xl p-5 space-y-4">
                    <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-cyberBorder/30 pb-2 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-cyberBlue animate-pulse" />
                      AI Audit Pipeline
                    </h3>

                    {currentIncident.status === 'Active' && !isInvestigating && investigationStep === 0 ? (
                      <div className="py-8 text-center space-y-4">
                        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border border-cyberBlue/20 animate-ping" />
                          <BrainCircuit className="w-8 h-8 text-cyberBlue/60" />
                        </div>
                        <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto leading-relaxed">
                          Trigger AI reasoning loops to search Hindsight persistent memories and cross-evaluate incident contexts.
                        </p>
                        <button 
                          onClick={runInvestigation}
                          className="bg-gradient-to-r from-cyberBlue/80 to-blue-600/80 hover:from-cyberBlue hover:to-blue-600 text-white text-xs font-bold uppercase tracking-wider font-orbitron py-2.5 px-5 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-95"
                        >
                          Run AI Audit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative border-l-2 border-cyberBorder/40 pl-4 space-y-5 ml-1 font-mono">
                          
                          {/* Step 1 */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-bold transition-all duration-300 ${
                              investigationStep >= 1 ? 'bg-emerald-950/65 text-cyberGreen border-cyberGreen glow-border-green' : 'bg-slate-950 border-slate-750 text-slate-500'
                            }`}>
                              {investigationStep >= 1 ? <Check className="w-2.5 h-2.5" /> : '1'}
                            </span>
                            <span className={`text-[11px] font-bold block ${investigationStep >= 1 ? 'text-white' : 'text-slate-550'}`}>Incident diagnostic completed</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Scanned victim network configuration parameters.</span>
                          </div>

                          {/* Step 2 */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-bold transition-all duration-300 ${
                              investigationStep >= 2 ? 'bg-emerald-950/65 text-cyberGreen border-cyberGreen glow-border-green' : 'bg-slate-950 border-slate-750 text-slate-500'
                            }`}>
                              {investigationStep >= 2 ? <Check className="w-2.5 h-2.5" /> : '2'}
                            </span>
                            <span className={`text-[11px] font-bold block ${investigationStep >= 2 ? 'text-white' : 'text-slate-550'}`}>Threat behavior vector matching</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Mapped signatures to core security profiles.</span>
                          </div>

                          {/* Step 3 */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-bold transition-all duration-300 ${
                              investigationStep >= 3 ? 'bg-emerald-950/65 text-cyberGreen border-cyberGreen glow-border-green' : 'bg-slate-950 border-slate-750 text-slate-500'
                            }`}>
                              {investigationStep >= 3 ? <Check className="w-2.5 h-2.5" /> : '3'}
                            </span>
                            <span className={`text-[11px] font-bold block ${investigationStep >= 3 ? 'text-white' : 'text-slate-550'}`}>Hindsight vector recall query</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Dispatched semantic search to memory index.</span>
                          </div>

                          {/* Step 4 */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-bold transition-all duration-300 ${
                              investigationStep >= 4 ? 'bg-emerald-950/65 text-cyberGreen border-cyberGreen glow-border-green' : 'bg-slate-950 border-slate-750 text-slate-500'
                            }`}>
                              {investigationStep >= 4 ? <Check className="w-2.5 h-2.5" /> : '4'}
                            </span>
                            <span className={`text-[11px] font-bold block ${investigationStep >= 4 ? 'text-white' : 'text-slate-550'}`}>Incident postmortem cross-reference</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Contrasted historical successes and containment failures.</span>
                          </div>

                          {/* Step 5 */}
                          <div className="relative">
                            <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-bold transition-all duration-300 ${
                              investigationStep >= 5 ? 'bg-emerald-950/65 text-cyberGreen border-cyberGreen glow-border-green' : 'bg-slate-950 border-slate-750 text-slate-500'
                            }`}>
                              {investigationStep >= 5 ? <Check className="w-2.5 h-2.5" /> : '5'}
                            </span>
                            <span className={`text-[11px] font-bold block ${investigationStep >= 5 ? 'text-white' : 'text-slate-550'}`}>Policy recommendation finalized</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Completed structured response diagnostic logs.</span>
                          </div>

                        </div>

                        {isInvestigating && (
                          <div className="pt-3 border-t border-cyberBorder/20 flex items-center gap-2 text-xs font-bold text-cyberBlue font-mono">
                            <RefreshCw className="w-4 h-4 animate-spin text-cyberBlue" />
                            [ AI Agent executing core reasoning... ]
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Memory Evidence & Recommendations */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Memory Evidence Panel */}
                  <div className="glass-panel rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-cyberBorder/35 pb-2">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-orbitron">
                        <Database className="w-4 h-4 text-cyberPurple animate-pulse" />
                        Hindsight Evidence Cache
                      </h3>
                      <span className="text-[9px] font-mono bg-cyberPurple/10 border border-cyberPurple/30 text-cyberPurple px-2.5 py-0.5 rounded font-bold shadow-[0_0_8px_rgba(189,0,255,0.15)]">
                        {memories.length} matches retrieved
                      </span>
                    </div>

                    {memories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memories.map((mem, idx) => (
                          <div key={idx} className="bg-slate-950/40 border border-cyberBorder/40 p-4 rounded-xl space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyberPurple/5 to-transparent pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] font-mono bg-blue-950/60 text-cyberBlue border border-blue-800/40 px-2 py-0.5 rounded font-bold">{mem.incident_id}</span>
                                <h4 className="text-xs font-bold text-white mt-1.5 font-orbitron">{mem.title}</h4>
                              </div>
                              <span className="text-[10px] font-bold font-mono text-cyberPurple bg-cyberPurple/10 px-2.5 py-0.5 rounded border border-cyberPurple/20 shadow-[0_0_8px_rgba(189,0,255,0.1)]">
                                {mem.relevance}% Match
                              </span>
                            </div>

                            <div className="text-[11px] space-y-3 text-slate-400 leading-relaxed font-mono">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Historical Root Cause</span>
                                <span className="text-slate-200 font-semibold">{mem.root_cause}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2.5">
                                <div>
                                  <span className="text-[9px] font-mono text-cyberGreen uppercase block tracking-wider">Success Protocol</span>
                                  <span className="text-cyberGreen font-bold text-[10px]">{mem.successful_remediation}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono text-cyberRed uppercase block tracking-wider">Failed Action</span>
                                  <span className="text-cyberRed font-semibold text-[10px]">{mem.failed_remediation}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-500 italic font-mono border border-dashed border-cyberBorder/30 rounded-xl bg-slate-950/20">
                        {isInvestigating ? "[ Retrieving persistent matches... ]" : "[ Run AI Audit to mount memory blocks ]"}
                      </div>
                    )}

                    {reflection && (
                      <div className="bg-cyberPurple/5 border border-cyberPurple/30 p-4 rounded-xl mt-4 text-xs leading-relaxed text-purple-200 font-mono">
                        <span className="font-bold text-[9px] text-cyberPurple uppercase tracking-widest block mb-1">Hindsight Reflection Synthesis:</span>
                        {reflection}
                      </div>
                    )}
                  </div>

                  {/* Recommendations panel */}
                  {recommendation && (
                    <div className="glass-panel rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-cyberBorder/35 pb-2">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-orbitron">
                          <BrainCircuit className="w-4 h-4 text-cyberBlue" />
                          Mitigation Directives
                        </h3>
                        <div className="text-[10px] font-mono bg-cyberBlue/10 border border-cyberBlue/30 text-cyberBlue px-2.5 py-0.5 rounded font-bold shadow-[0_0_8px_rgba(0,240,255,0.15)]">
                          Confidence: {recommendation.confidence}%
                        </div>
                      </div>

                      {/* Findings */}
                      <div className="space-y-2">
                        <span className="text-slate-500 text-[9px] font-mono uppercase tracking-wider block">Key Audit Findings</span>
                        <ul className="list-none text-xs text-slate-350 space-y-2 pl-1 font-mono">
                          {recommendation.findings.map((find, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-cyberBlue font-bold select-none">[!]</span>
                              <span>{find}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 border-t border-cyberBorder/30 pt-3.5">
                        <span className="text-slate-500 text-[9px] font-mono uppercase tracking-wider block">Suggested Remediation Actions</span>
                        <ol className="list-none text-xs text-slate-300 space-y-2 pl-1 font-mono">
                          {recommendation.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="text-cyberGreen font-bold select-none">[{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}]</span>
                              <span className="text-white font-semibold">{rec}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-cyberBlue/5 border border-cyberBlue/35 p-4 rounded-xl text-xs leading-relaxed text-slate-300 font-mono">
                        <span className="font-bold text-[9px] text-cyberBlue uppercase tracking-widest block mb-1">Reasoning Diagnostics</span>
                        <p>{recommendation.reasoning}</p>
                      </div>

                      {/* Human Approval Workspace Actions */}
                      <div className="border-t border-cyberBorder/30 pt-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          Requires operator authentication code prior to deploy
                        </div>
                        
                        {!hasApproved ? (
                          <div className="flex gap-2 w-full md:w-auto font-mono">
                            <button 
                              onClick={handleApprove}
                              disabled={isApproving}
                              className="flex-1 md:flex-none bg-gradient-to-r from-cyberBlue/80 to-blue-600/80 hover:from-cyberBlue hover:to-blue-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-lg border border-cyberBlue/30 hover:border-cyberBlue/60 shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300 active:scale-95"
                            >
                              {isApproving ? "Executing scripts..." : "Approve Protocol"}
                            </button>
                            <button className="border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors">
                              Edit
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold font-mono text-cyberGreen bg-emerald-950/30 border border-cyberGreen/40 px-3.5 py-2 rounded-lg shadow-[0_0_10px_rgba(57,255,20,0.1)] flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-cyberGreen" />
                            Containment Action Deployed
                          </span>
                        )}
                      </div>

                      {/* Execution Terminal Logger */}
                      {approvalLogs.length > 0 && (
                        <div className="bg-black/90 border border-cyberBorder rounded-lg p-4 font-mono text-[11px] text-cyan-400 space-y-1.5 mt-4 max-h-48 overflow-y-auto relative cyber-scanner">
                          <div className="flex items-center gap-2 text-slate-500 border-b border-cyberBorder/30 pb-2 mb-2 select-none uppercase tracking-widest text-[9px] font-bold">
                            <Terminal className="w-3.5 h-3.5 text-cyberBlue" />
                            Diagnostics Console Log Output
                          </div>
                          {approvalLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-cyan-800 select-none">&gt;&gt;</span>
                              <span className={log.includes("Error") ? "text-cyberRed" : log.includes("Success") ? "text-cyberGreen" : "text-cyan-400"}>{log}</span>
                            </div>
                          ))}
                          {isApproving && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-cyan-800 select-none">&gt;&gt;</span>
                              <span className="w-2 h-4 bg-cyberBlue animate-pulse inline-block"></span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resolution Submission Section */}
                      {hasApproved && !hasResolved && (
                        <div className="bg-slate-950/60 border border-cyberBorder/40 p-4 rounded-xl mt-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center font-mono">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-white block">Actions completed successfully</span>
                            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Commit containment parameters to dashboard logs</span>
                          </div>
                          <button 
                            onClick={handleResolve}
                            disabled={isResolving}
                            className="w-full md:w-auto bg-gradient-to-r from-cyberGreen/80 to-emerald-600/80 hover:from-cyberGreen hover:to-emerald-600 border border-cyberGreen/30 text-white text-xs font-bold py-2.5 px-5 rounded-lg tracking-wider uppercase shadow-[0_0_12px_rgba(57,255,20,0.15)] transition-all duration-300 active:scale-95"
                          >
                            {isResolving ? "Committing..." : "Resolve Incident"}
                          </button>
                        </div>
                      )}

                      {/* Retention Section (Save to Hindsight) */}
                      {hasResolved && (
                        <div className="bg-cyberPurple/5 border border-cyberPurple/40 p-5 rounded-xl space-y-4">
                          <div className="flex justify-between items-start font-mono">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-white block uppercase tracking-wider">Incident Contained</span>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                                Save the resolution parameters and successful keys mitigation into Hindsight memory. This feeds the agent's persistent vector engine.
                              </p>
                            </div>
                            <span className="bg-cyberBlue/10 border border-cyberBlue/35 text-cyberBlue text-[9px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              MTTR: {currentIncident.resolution_time || 11} Min
                            </span>
                          </div>

                          {!hasRetained ? (
                            <button 
                              onClick={handleRetain}
                              disabled={isRetaining}
                              className="w-full bg-gradient-to-r from-cyberPurple/80 to-purple-700/80 hover:from-cyberPurple hover:to-purple-700 border border-cyberPurple/30 text-white text-xs font-bold font-orbitron tracking-wider py-2.5 px-5 rounded-lg uppercase shadow-[0_0_15px_rgba(189,0,255,0.15)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                            >
                              <BrainCircuit className="w-4 h-4 animate-pulse" />
                              {isRetaining ? "Writing vector facts..." : "Commit Experience to Memory"}
                            </button>
                          ) : (
                            <div className="bg-slate-950/80 border border-dashed border-cyberPurple/60 p-4 rounded-xl space-y-3 animate-fade-in font-mono">
                              <div className="flex items-center gap-2 text-cyberPurple text-xs font-bold uppercase tracking-wider">
                                <Award className="w-4.5 h-4.5 text-cyberPurple animate-pulse" />
                                Memory Block successfully committed
                              </div>
                              {newMemoryCreated && (
                                <div className="text-[10px] text-slate-450 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 mt-2">
                                  <div><span className="text-slate-650 uppercase text-[9px] block">Fact Model</span>Incident containment</div>
                                  <div><span className="text-slate-650 uppercase text-[9px] block">Host System</span>{newMemoryCreated.system}</div>
                                  <div className="md:col-span-2 border-t border-slate-900 pt-2"><span className="text-slate-650 uppercase text-[9px] block">Lessons Retained</span>{newMemoryCreated.lessons_learned}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        ) : (
          /* Main Dashboard / Tab Workspace view */
          <div className="space-y-6 animate-fade-in-up">

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <>
                {/* Metric Summary Rows */}
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* Metric 1 */}
                    <div className="relative overflow-hidden glass-panel border border-cyberBorder p-5 rounded-xl flex flex-col justify-between h-28 glass-panel-hover transition-all duration-300">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 uppercase tracking-widest block">Active Incidents</span>
                        <p className="text-3xl font-black text-cyberRed mt-1 glow-text-red font-orbitron">{stats.active_incidents}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,25 Q15,5 30,20 T60,8 T90,28 T100,10 L100,30 L0,30 Z" fill="rgba(255,0,60,0.15)" stroke="#ff003c" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="relative overflow-hidden glass-panel border border-cyberBorder p-5 rounded-xl flex flex-col justify-between h-28 glass-panel-hover transition-all duration-300">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 uppercase tracking-widest block">Resolved Threats</span>
                        <p className="text-3xl font-black text-cyberBlue mt-1 glow-text-blue font-orbitron">{stats.resolved_incidents}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,15 Q20,28 40,10 T80,25 T100,8 L100,30 L0,30 Z" fill="rgba(0,240,255,0.15)" stroke="#00f0ff" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="relative overflow-hidden glass-panel border border-cyberBorder p-5 rounded-xl flex flex-col justify-between h-28 glass-panel-hover transition-all duration-300">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 uppercase tracking-widest block">Persistent Facts</span>
                        <p className="text-3xl font-black text-cyberGreen mt-1 glow-text-green font-orbitron">{stats.memory_facts}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,28 Q15,10 35,25 T65,8 T100,20 L100,30 L0,30 Z" fill="rgba(57,255,20,0.15)" stroke="#39ff14" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Metric 4 */}
                    <div className="relative overflow-hidden glass-panel border border-cyberBorder p-5 rounded-xl flex flex-col justify-between h-28 glass-panel-hover transition-all duration-300">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 uppercase tracking-widest block">Audit Patterns</span>
                        <p className="text-3xl font-black text-cyberPurple mt-1 glow-text-purple font-orbitron">{stats.patterns_detected}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,10 Q25,5 50,28 T85,15 T100,25 L100,30 L0,30 Z" fill="rgba(189,0,255,0.15)" stroke="#bd00ff" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Metric 5 */}
                    <div className="relative overflow-hidden glass-panel border border-cyberBorder p-5 rounded-xl flex flex-col justify-between h-28 glass-panel-hover transition-all duration-300 col-span-2 lg:col-span-1">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 uppercase tracking-widest block">Avg Contain Time</span>
                        <p className="text-3xl font-black text-slate-100 mt-1 font-orbitron">{stats.average_resolution_time}<span className="text-xs font-mono text-slate-450 font-medium lowercase"> min</span></p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,20 Q30,10 60,25 T100,12 L100,30 L0,30 Z" fill="rgba(255,255,255,0.05)" stroke="#ffffff" strokeWidth="0.8" />
                        </svg>
                      </div>
                    </div>

                  </div>
                )}

                {/* Active Incidents grid section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-cyberBorder/30 pb-2">
                    <AlertOctagon className="w-4 h-4 text-cyberRed animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Active Threat Registry</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {incidents.filter(i => i.status !== 'Resolved').map((inc) => (
                      <div key={inc.incident_id} className="glass-panel rounded-xl p-5 flex flex-col justify-between glass-panel-hover transition-all duration-350 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyberRed/60" />
                        
                        <div className="space-y-3 pl-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-slate-500 font-semibold tracking-wider uppercase">{inc.incident_id}</span>
                            <SeverityBadge value={inc.severity} />
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-bold text-white leading-snug font-orbitron">{inc.title}</h4>
                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-sans">{inc.description}</p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-550 border-t border-slate-900 pt-2.5 font-mono">
                            <div>Host: <span className="text-slate-350 font-bold">{inc.system}</span></div>
                            <StatusBadge value={inc.status} />
                          </div>
                        </div>

                        <button 
                          onClick={() => openIncident(inc.incident_id)}
                          className="w-full mt-4 bg-slate-900/80 hover:bg-cyberBlue/10 border border-cyberBorder/70 hover:border-cyberBlue/60 text-slate-100 hover:text-white font-mono text-xs font-bold py-2 rounded-lg transition-all duration-300 uppercase tracking-widest active:scale-95 shadow-md"
                        >
                          Investigate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Incident History Table */}
                <div className="glass-panel rounded-xl p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-cyberBorder/30 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 font-orbitron">
                      <Activity className="w-4 h-4 text-cyberBlue" />
                      Incident Logs Archive
                    </h3>

                    {/* Filters bar */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                      <div>
                        <select 
                          value={severityFilter} 
                          onChange={(e) => setSeverityFilter(e.target.value)}
                          className="bg-slate-950/80 border border-cyberBorder/60 rounded px-2.5 py-1 text-slate-300 outline-none focus:border-cyberBlue transition-colors cursor-pointer"
                        >
                          <option value="">All Severities</option>
                          <option value="CRITICAL">Critical</option>
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>
                      <div>
                        <select 
                          value={statusFilter} 
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-slate-950/80 border border-cyberBorder/60 rounded px-2.5 py-1 text-slate-300 outline-none focus:border-cyberBlue transition-colors cursor-pointer"
                        >
                          <option value="">All Statuses</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INVESTIGATED">Investigated</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </div>
                      <div>
                        <input 
                          type="text" 
                          placeholder="Filter System..." 
                          value={systemFilter}
                          onChange={(e) => setSystemFilter(e.target.value)}
                          className="bg-slate-950/80 border border-cyberBorder/60 rounded px-2.5 py-1 text-slate-350 outline-none focus:border-cyberBlue transition-colors placeholder:text-slate-600 w-36"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-cyberBorder text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                          <th className="py-2.5 px-3">Ident</th>
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">System</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Severity</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">MTTR</th>
                          <th className="py-2.5 px-3 text-right">Operation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50 text-slate-300 text-[11px]">
                        {filteredIncidents.map((inc) => (
                          <tr key={inc.incident_id} className="hover:bg-slate-900/25 transition-colors group">
                            <td className="py-3 px-3 font-bold text-cyberBlue">{inc.incident_id}</td>
                            <td className="py-3 px-3 font-semibold text-slate-100">{inc.title}</td>
                            <td className="py-3 px-3 text-slate-400">{inc.system}</td>
                            <td className="py-3 px-3 text-slate-405">{inc.type}</td>
                            <td className="py-3 px-3"><SeverityBadge value={inc.severity} /></td>
                            <td className="py-3 px-3"><StatusBadge value={inc.status} /></td>
                            <td className="py-3 px-3 text-slate-400">{inc.resolution_time ? `${inc.resolution_time}m` : '-'}</td>
                            <td className="py-3 px-3 text-right">
                              <button 
                                onClick={() => openIncident(inc.incident_id)}
                                className="text-cyberBlue hover:text-white font-bold text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-slate-900 border border-cyberBorder/40 hover:border-cyberBlue/50 transition-all duration-300"
                              >
                                Diag
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* TAB: EMERGING PATTERNS */}
            {activeTab === 'patterns' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="border-b border-cyberBorder/35 pb-2">
                  <h2 className="text-base font-bold text-white font-mono flex items-center gap-2 font-orbitron">
                    <Network className="w-5 h-5 text-cyberBlue" />
                    Emerging Threat Signatures
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Cross-incident signature patterns derived from Hindsight persistent vector audits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {patterns.map((pat) => (
                    <div key={pat.pattern_id} className="glass-panel rounded-xl p-5 space-y-4 relative overflow-hidden glass-panel-hover transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyberBlue/5 to-transparent pointer-events-none" />
                      
                      <div className="flex justify-between items-start font-mono">
                        <div>
                          <span className="text-[9px] font-mono bg-cyan-950/40 border border-cyan-800/40 text-cyberBlue px-2 py-0.5 rounded font-bold">{pat.pattern_id}</span>
                          <h3 className="text-sm font-bold text-white mt-1.5 font-orbitron">{pat.title}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-cyberBlue bg-cyberBlue/10 border border-cyberBlue/20 px-2.5 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.1)]">
                          {pat.confidence}% MATCH
                        </span>
                      </div>

                      <div className="text-xs space-y-3.5 leading-relaxed text-slate-400 font-mono">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Correlated Incidents</span>
                          <div className="flex gap-1.5 mt-1.5">
                            {pat.incidents.map((id, idx) => (
                              <span 
                                key={idx} 
                                onClick={() => openIncident(id)}
                                className="cursor-pointer bg-slate-950 border border-cyberBorder/60 hover:border-cyberBlue hover:text-white px-2 py-0.5 rounded font-mono text-[9px] transition-colors"
                              >
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-900 pt-3">
                          <span className="text-[9px] font-mono text-cyberBlue uppercase block tracking-wider">Behavior Observation</span>
                          <p className="text-slate-300 mt-0.5 font-sans text-xs leading-relaxed">{pat.observation}</p>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-cyberGreen uppercase block tracking-wider">Proactive Mitigation</span>
                          <p className="text-cyberGreen/90 font-medium mt-0.5 font-sans text-xs leading-relaxed">{pat.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LEARNING JOURNEY */}
            {activeTab === 'learning' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="border-b border-cyberBorder/35 pb-2">
                  <h2 className="text-base font-bold text-white font-mono flex items-center gap-2 font-orbitron">
                    <BrainCircuit className="w-5 h-5 text-cyberPurple" />
                    Agent Learning Pipeline
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Timeline logs showing the accumulation and synthesis of institutional facts over execution loops.</p>
                </div>

                <div className="max-w-2xl mx-auto relative border-l-2 border-cyberBorder/30 ml-4 pl-6 space-y-8 py-4 font-mono">
                  {timelineItems.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-cyberPurple flex items-center justify-center font-mono text-[10px] font-bold text-cyberPurple shadow-[0_0_8px_rgba(189,0,255,0.2)] animate-pulse">
                        {item.step_number}
                      </span>
                      
                      <div className="glass-panel rounded-xl p-5 space-y-3 hover:border-cyberPurple/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyberPurple/5 to-transparent pointer-events-none" />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-cyberPurple/80 font-bold uppercase tracking-wider">{item.interaction_id}</span>
                            <h3 className="text-sm font-bold text-white mt-0.5 font-orbitron">{item.title}</h3>
                          </div>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans mt-1">{item.description}</p>
                        
                        <div className="border-t border-slate-900 pt-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400">
                          <div>
                            <span className="text-[9px] font-mono text-cyberPurple uppercase block tracking-wider">Fact Extracted</span>
                            <span className="text-slate-200 font-semibold text-[10px] leading-relaxed">{item.learned_fact}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-cyberGreen uppercase block tracking-wider">Outcome Impact</span>
                            <span className="text-cyberGreen/90 font-semibold text-[10px] leading-relaxed">{item.outcome_impact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MEMORY GRAPH */}
            {activeTab === 'graph' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="border-b border-cyberBorder/35 pb-2">
                  <h2 className="text-base font-bold text-white font-mono flex items-center gap-2 font-orbitron">
                    <Compass className="w-5 h-5 text-cyberBlue animate-pulse" />
                    Organizational Memory Topology
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Cross-referencing historical incidents, targets, threat vectors, and containment outcomes.</p>
                </div>

                <MemoryGraph />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Persistent floating Interactive Demo Wizard */}
      <DemoWizard
        currentStep={wizardStep}
        setStep={setWizardStep}
        onAction={handleWizardAction}
        isOpen={isWizardOpen}
        setIsOpen={setIsWizardOpen}
      />
      
    </div>
  );
}
