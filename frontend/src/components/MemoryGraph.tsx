import React, { useState } from 'react';
import { Shield, Server, AlertTriangle, Key, Ban, Activity, Cpu } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'attack' | 'system' | 'remediation_ok' | 'remediation_fail' | 'incident';
  details: string;
  x: number;
  y: number;
}

interface Link {
  source: string;
  target: string;
}

export const MemoryGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes: Node[] = [
    { id: 'att_cred', label: 'Credential Attack', type: 'attack', details: 'Automated brute force attempts using rotating proxies', x: 300, y: 55 },
    { id: 'sys_api', label: 'prod-api-03', type: 'system', details: 'Exposed SSH public login, primary API server', x: 120, y: 190 },
    { id: 'sys_db', label: 'prod-db-02', type: 'system', details: 'Core database server with exposed port 3306', x: 480, y: 190 },
    { id: 'rem_ip_block', label: 'IP Blocking Only', type: 'remediation_fail', details: 'Failed remediation: attacker rotates source IPs instantly, bypassing simple firewall blocks', x: 480, y: 310 },
    { id: 'rem_key_limit', label: 'Keys + Rate Limit', type: 'remediation_ok', details: 'Successful remediation: disables password-based auth, enforces public-key login, adds Fail2ban rate limits', x: 120, y: 310 },
    { id: 'inc_1042', label: 'INC-1042', type: 'incident', details: 'SSH brute force breach: learned password authentication vulnerability on prod-api-03', x: 80, y: 440 },
    { id: 'inc_1097', label: 'INC-1097', type: 'incident', details: 'Credential spray incident: learned that firewall IP blocking is ineffective against rotating proxies', x: 300, y: 440 },
    { id: 'inc_1138', label: 'INC-1138', type: 'incident', details: 'Coordinated intrusion: detected credential sprays coupled with root privilege escalation on production-api', x: 520, y: 440 }
  ];

  const links: Link[] = [
    { source: 'att_cred', target: 'sys_api' },
    { source: 'att_cred', target: 'sys_db' },
    { source: 'sys_api', target: 'inc_1042' },
    { source: 'sys_db', target: 'inc_1097' },
    { source: 'inc_1042', target: 'rem_key_limit' },
    { source: 'inc_1097', target: 'rem_ip_block' },
    { source: 'inc_1097', target: 'rem_key_limit' },
    { source: 'inc_1138', target: 'att_cred' },
    { source: 'inc_1138', target: 'rem_key_limit' }
  ];

  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) {
      switch (type) {
        case 'attack': return 'stroke-cyberRed fill-red-950/80 stroke-2';
        case 'system': return 'stroke-cyberBlue fill-blue-950/80 stroke-2';
        case 'remediation_ok': return 'stroke-cyberGreen fill-emerald-950/80 stroke-2';
        case 'remediation_fail': return 'stroke-cyberRed fill-amber-950/80 stroke-2';
        case 'incident': return 'stroke-cyberPurple fill-purple-950/80 stroke-2';
        default: return 'stroke-white fill-slate-950 stroke-2';
      }
    }
    switch (type) {
      case 'attack': return 'stroke-red-500/70 fill-red-950/20';
      case 'system': return 'stroke-cyberBlue/70 fill-cyan-950/20';
      case 'remediation_ok': return 'stroke-cyberGreen/70 fill-emerald-950/20';
      case 'remediation_fail': return 'stroke-cyberRed/70 fill-red-950/10';
      case 'incident': return 'stroke-cyberPurple/70 fill-purple-950/20';
      default: return 'stroke-slate-500/70 fill-slate-950/20';
    }
  };

  const getNodeGlowFilter = (type: string) => {
    switch (type) {
      case 'attack': return 'url(#glow-red)';
      case 'system': return 'url(#glow-blue)';
      case 'remediation_ok': return 'url(#glow-green)';
      case 'remediation_fail': return 'url(#glow-red)';
      case 'incident': return 'url(#glow-purple)';
      default: return 'none';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'attack': return <AlertTriangle className="w-5 h-5 text-cyberRed" />;
      case 'system': return <Server className="w-5 h-5 text-cyberBlue" />;
      case 'remediation_ok': return <Key className="w-5 h-5 text-cyberGreen" />;
      case 'remediation_fail': return <Ban className="w-5 h-5 text-red-500" />;
      case 'incident': return <Shield className="w-5 h-5 text-cyberPurple" />;
      default: return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  // Find linked node IDs for highlight
  const getLinkedNodes = (nodeId: string) => {
    const linked = new Set<string>([nodeId]);
    links.forEach(l => {
      if (l.source === nodeId) linked.add(l.target);
      if (l.target === nodeId) linked.add(l.source);
    });
    return linked;
  };

  const highlightedNodes = selectedNode ? getLinkedNodes(selectedNode) : null;
  const activeNode = nodes.find(n => n.id === selectedNode);

  // Get nodes connected specifically to the active node for listing in Details
  const getConnectionsForActiveNode = () => {
    if (!selectedNode) return [];
    const connections: { node: Node; type: 'source' | 'target' }[] = [];
    links.forEach(l => {
      if (l.source === selectedNode) {
        const found = nodes.find(n => n.id === l.target);
        if (found) connections.push({ node: found, type: 'target' });
      }
      if (l.target === selectedNode) {
        const found = nodes.find(n => n.id === l.source);
        if (found) connections.push({ node: found, type: 'source' });
      }
    });
    return connections;
  };

  const connectedItems = getConnectionsForActiveNode();

  return (
    <div className="glass-panel border border-cyberBorder/50 rounded-xl p-6 flex flex-col lg:flex-row gap-6 min-h-[580px] animate-fade-in-up">
      
      {/* SVG Canvas Workspace */}
      <div className="flex-1 relative border border-cyberBorder/30 bg-slate-950/60 rounded-xl overflow-hidden flex items-center justify-center p-2">
        <div className="absolute top-4 left-4 text-[10px] text-cyberBlue/70 font-mono flex items-center gap-1.5 uppercase tracking-widest select-none">
          <Activity className="w-3.5 h-3.5 text-cyberBlue animate-pulse" />
          Interactive Knowledge Topology
        </div>
        
        <svg className="w-full h-full min-h-[460px] max-w-[620px]" viewBox="0 0 600 500">
          <defs>
            {/* Markers */}
            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a264d" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f0ff" />
            </marker>

            {/* Glowing Neon Filters */}
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Static and Animated Connecting Lines */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find(n => n.id === link.source)!;
            const targetNode = nodes.find(n => n.id === link.target)!;
            const isHighlighted = highlightedNodes 
              ? highlightedNodes.has(link.source) && highlightedNodes.has(link.target)
              : false;
            
            const pathD = `M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`;

            return (
              <g key={`link-${idx}`}>
                {/* Link Line */}
                <path
                  d={pathD}
                  className={`transition-all duration-300 fill-none ${
                    isHighlighted 
                      ? 'stroke-cyberBlue stroke-2 opacity-150' 
                      : selectedNode 
                        ? 'stroke-slate-900 opacity-20' 
                        : 'stroke-cyberBorder stroke-[1.5px] opacity-70'
                  }`}
                  markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow)"}
                  style={isHighlighted ? { filter: 'url(#glow-blue)' } : {}}
                />

                {/* Animated Packet Circle crawling along the line */}
                {(!selectedNode || isHighlighted) && (
                  <circle r="2.5" className="fill-cyberBlue pointer-events-none" style={{ filter: 'url(#glow-blue)' }}>
                    <animateMotion 
                      dur={`${4 + (idx % 3) * 1.5}s`} 
                      repeatCount="indefinite" 
                      path={pathD} 
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* SVG Nodes group */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isDimmed = selectedNode && !highlightedNodes?.has(node.id);
            const glowFilter = getNodeGlowFilter(node.type);
            
            return (
              <g 
                key={node.id} 
                className={`cursor-pointer group transition-all duration-300 select-none ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
              >
                {/* Selected Node pulse rings */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="34"
                    className="fill-none stroke-cyberBlue/30 stroke-[1.5px] animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  className={`transition-all duration-300 border ${getNodeColor(node.type, isSelected)}`}
                  style={isSelected ? { filter: glowFilter } : {}}
                />

                {/* Inside Icon Overlay */}
                <foreignObject
                  x={node.x - 10}
                  y={node.y - 10}
                  width="20"
                  height="20"
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center">
                    {getNodeIcon(node.type)}
                  </div>
                </foreignObject>

                {/* Node Label text */}
                <text
                  x={node.x}
                  y={node.y + 38}
                  textAnchor="middle"
                  className={`text-[9px] font-bold font-mono tracking-wider transition-colors ${
                    isSelected ? 'fill-cyberBlue' : 'fill-slate-400 group-hover:fill-white'
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Details Side-Panel HUD */}
      <div className="w-full lg:w-72 border border-cyberBorder bg-slate-950/40 p-5 rounded-xl flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-cyberBorder pb-2 flex items-center gap-1.5 font-orbitron">
            <Cpu className="w-4 h-4 text-cyberBlue" />
            Registry details
          </h3>
          
          {activeNode ? (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <span className="text-[9px] uppercase font-bold text-cyberBlue/70 font-mono block">Node Type</span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider bg-slate-900 border border-cyberBorder text-slate-300">
                  {activeNode.type}
                </span>
              </div>
              
              <div>
                <span className="text-[9px] uppercase font-bold text-cyberBlue/70 font-mono block">Ident Token</span>
                <p className="text-sm font-bold text-white mt-0.5">{activeNode.label}</p>
              </div>
              
              <div>
                <span className="text-[9px] uppercase font-bold text-cyberBlue/70 font-mono block">Tactical Description</span>
                <p className="text-xs text-slate-350 mt-1 leading-relaxed">{activeNode.details}</p>
              </div>

              {/* Memory Links connection list */}
              {connectedItems.length > 0 && (
                <div className="border-t border-cyberBorder/30 pt-3 space-y-2">
                  <span className="text-[9px] uppercase font-bold text-cyberBlue/70 font-mono block">Graph Pathways</span>
                  <div className="space-y-1.5">
                    {connectedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950/80 border border-cyberBorder/35 rounded p-2 text-[10px] font-mono hover:border-cyberBlue/50 transition-colors">
                        <span className="text-slate-300 font-semibold">{item.node.label}</span>
                        <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded font-bold ${
                          item.type === 'source' ? 'bg-blue-950 text-cyberBlue' : 'bg-purple-950 text-cyberPurple'
                        }`}>
                          {item.type === 'source' ? 'Inward' : 'Outward'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-12 text-center font-mono">
              [Click topology node to inspect incident relations & pathways]
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-cyberBorder/50 pt-4 space-y-3">
          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Topology Legend</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-[10px] font-mono">
            <div className="flex items-center gap-2 text-cyberRed">
              <span className="w-2 h-2 rounded-full bg-red-950/40 border border-cyberRed animate-pulse"></span>
              Attack Node
            </div>
            <div className="flex items-center gap-2 text-cyberBlue">
              <span className="w-2 h-2 rounded-full bg-cyan-950/40 border border-cyberBlue"></span>
              Host System
            </div>
            <div className="flex items-center gap-2 text-cyberGreen">
              <span className="w-2 h-2 rounded-full bg-emerald-950/40 border border-cyberGreen"></span>
              Success Action
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-950/40 border border-red-500"></span>
              Failed Action
            </div>
            <div className="flex items-center gap-2 text-cyberPurple col-span-2">
              <span className="w-2 h-2 rounded-full bg-purple-950/40 border border-cyberPurple animate-pulse"></span>
              Security Incident (Hindsight)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
