import React from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, HelpCircle, Terminal, Compass } from 'lucide-react';

interface DemoWizardProps {
  currentStep: number;
  setStep: (step: number) => void;
  onAction: (actionType: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const DemoWizard: React.FC<DemoWizardProps> = ({
  currentStep,
  setStep,
  onAction,
  isOpen,
  setIsOpen
}) => {
  const steps = [
    {
      title: "1. Reset Environment",
      desc: "Reset all databases and memory banks to initial seed states.",
      guidance: "Initialize target parameters. Clears existing databases for a clean demo replay.",
      action: "RESET_DB"
    },
    {
      title: "2. Load Incident INC-1042",
      desc: "Open SSH Brute Force credential attack on prod-api-03.",
      guidance: "Select active incident card INC-1042 from the registry table list.",
      action: "OPEN_INC_1042"
    },
    {
      title: "3. Run AI Investigation (INC-1042)",
      desc: "Trigger AI agent audit. First run means no prior SSH memories exist in the Hindsight bank.",
      guidance: "Engage 'Run AI Investigation' on the incident workspace panel.",
      action: "INVESTIGATE"
    },
    {
      title: "4. Approve & Mitigate (INC-1042)",
      desc: "Approve response: block source IP, disable password SSH logins, enforce keys.",
      guidance: "Authorize suggested containment policy. Executes simulated scripting layers.",
      action: "APPROVE"
    },
    {
      title: "5. Save to Hindsight",
      desc: "Resolve incident and call Hindsight retain. This saves the successful key-based authentication lessons.",
      guidance: "Commit postmortem logs by clicking 'Save Experience to Memory'.",
      action: "RETAIN"
    },
    {
      title: "6. Load Incident INC-1097",
      desc: "Open Credential Spraying incident on database host prod-db-02.",
      guidance: "Navigate back to registry dashboard and open active incident INC-1097.",
      action: "OPEN_INC_1097"
    },
    {
      title: "7. AI Memory Recall (INC-1097)",
      desc: "Start investigation. Hindsight recalls INC-1042, warning that simple IP blocks fail against rotating proxy IPs.",
      guidance: "Deploy 'Run AI Investigation'. Compare and review Hindsight memory scorecards.",
      action: "INVESTIGATE"
    },
    {
      title: "8. Resolve with Memory Guide",
      desc: "Approve response and save. Enforces keys + bastion tunnels instead of simple IP block.",
      guidance: "Approve and resolve. Save the lessons to persistent memory.",
      action: "RESOLVE_1097"
    },
    {
      title: "9. Load Incident INC-1138",
      desc: "Open Critical incident on production-api involving credential attack AND privilege escalation.",
      guidance: "Return to the incident directory and load critical intrusion INC-1138.",
      action: "OPEN_INC_1138"
    },
    {
      title: "10. WOW Moment: Pattern Detection",
      desc: "Agent recalls multiple incidents, flags emerging coordinated intrusion patterns, and recommends host isolation.",
      guidance: "Activate AI Investigation. Observe combined reasoning and cross-incident memory retrieval.",
      action: "INVESTIGATE_1138"
    }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-darkCard/95 hover:bg-slate-900 border-2 border-cyberBlue text-cyberBlue rounded-full py-3.5 px-6 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2.5 font-orbitron font-bold text-xs uppercase tracking-wider z-50 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <HelpCircle className="w-5 h-5 animate-pulse text-cyberBlue" />
        Interactive Demo Wizard
      </button>
    );
  }

  const stepInfo = steps[currentStep - 1];
  const percentComplete = Math.round((currentStep / 10) * 100);

  // Circular progress math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentStep / 10) * circumference;

  return (
    <div className="fixed bottom-6 right-6 w-96 glass-panel border border-cyberBlue/40 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-300 transform animate-fade-in-up cyber-scanner">
      
      {/* HUD Scanner Top Border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyberBlue to-transparent animate-pulse" />

      {/* Header */}
      <div className="bg-slate-950/60 px-4 py-3.5 border-b border-cyberBorder flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-5 h-5">
            <Compass className="w-5 h-5 text-cyberBlue animate-spin-slow" style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider font-orbitron">Holographic Demo Wizard</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-cyberRed font-bold text-sm px-2 py-1 rounded hover:bg-slate-900 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-4">
        
        {/* Progress HUD */}
        <div className="flex items-center justify-between border-b border-cyberBorder/30 pb-3">
          <div className="flex items-center gap-3">
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r={radius} stroke="#1e294b" strokeWidth="2.5" fill="transparent" />
                <circle 
                  cx="20" 
                  cy="20" 
                  r={radius} 
                  stroke="#00f0ff" 
                  strokeWidth="2.5" 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-[9px] font-mono font-bold text-cyberBlue">{currentStep}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wide">Tactical Scenario</span>
              <span className="text-xs font-bold font-orbitron text-white">Step {currentStep} of 10</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyberBlue bg-cyberBlue/10 border border-cyberBlue/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.15)]">
            {percentComplete}% HUD Ready
          </span>
        </div>

        {/* Step details */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide glow-text-blue">{stepInfo.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">{stepInfo.desc}</p>
          </div>
          
          <div className="bg-slate-950/70 border border-cyberBorder/50 p-3.5 rounded-lg text-xs text-cyberBlue font-mono flex items-start gap-2">
            <Terminal className="w-4 h-4 text-cyberBlue shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <span className="font-bold text-[9px] text-cyberBlue/70 uppercase tracking-widest block mb-1">Tactical Guidance:</span>
              <p className="leading-relaxed">{stepInfo.guidance}</p>
            </div>
          </div>
        </div>

        {/* Wizard Controls */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => onAction(stepInfo.action)}
            className="flex-1 bg-gradient-to-r from-cyberBlue/80 to-blue-600/80 hover:from-cyberBlue hover:to-blue-600 text-white rounded-lg py-2.5 px-3 text-xs font-bold font-orbitron tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-cyberBlue/30 hover:border-cyberBlue/60 transition-all duration-300 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
            Auto-Execute
          </button>
          
          <button
            onClick={() => onAction("RESET_DB")}
            title="Reset system registry"
            className="border border-slate-800 hover:border-cyberRed/50 hover:bg-slate-950 text-slate-400 hover:text-cyberRed rounded-lg p-2.5 transition-all duration-300 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="bg-slate-950/60 border-t border-cyberBorder px-4 py-3 flex items-center justify-between font-mono">
        <button
          disabled={currentStep === 1}
          onClick={() => setStep(currentStep - 1)}
          className="text-xs font-bold text-slate-400 hover:text-cyberBlue disabled:opacity-30 flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          PREV
        </button>
        <button
          disabled={currentStep === 10}
          onClick={() => setStep(currentStep + 1)}
          className="text-xs font-bold text-slate-400 hover:text-cyberBlue disabled:opacity-30 flex items-center gap-1.5 transition-colors"
        >
          NEXT
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
