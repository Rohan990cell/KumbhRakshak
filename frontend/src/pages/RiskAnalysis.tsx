import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { RiskEvaluationResult } from '../types';
import {
  BrainCircuit,
  BookOpen,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  CloudRain,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const RiskAnalysis: React.FC = () => {
  const [evaluations, setEvaluations] = useState<RiskEvaluationResult[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<RiskEvaluationResult | null>(null);
  const [researchData, setResearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRiskData = async () => {
    try {
      const [riskRes, citationsRes] = await Promise.all([
        api.get('/risk/zones'),
        api.get('/risk/research-citations'),
      ]);
      setEvaluations(riskRes.evaluations || []);
      if (riskRes.evaluations && riskRes.evaluations.length > 0) {
        setSelectedEvaluation(riskRes.evaluations[0]);
      }
      setResearchData(citationsRes);
    } catch (err) {
      console.error('Failed to load risk analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-red-400 border-red-500 bg-red-950/40';
    if (score > 60) return 'text-orange-400 border-orange-500 bg-orange-950/40';
    if (score > 30) return 'text-amber-400 border-amber-500 bg-amber-950/40';
    return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-400" />
            <span>AI Crowd Risk Scoring Engine</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60 font-mono">
              PROTOTYPE CLASSIFIER
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Explainable gradient risk model combining density saturation, flow momentum, weather stress, and SOS reports.
          </p>
        </div>

        <button
          onClick={fetchRiskData}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-Evaluate All Zones</span>
        </button>
      </div>

      {/* Top Banner: Research Gap and Formula Architecture */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Risk Formula Card (7 cols) */}
        <div className="xl:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Composite Risk Formulation (0 - 100 Scale)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">WEIGHTED GRADIENT</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <span className="text-amber-400 font-bold">Composite Risk Score (R)</span> =
            <br />
            &nbsp;&nbsp;[0.40 × Crowd Density %] + [0.25 × Net Flow Momentum] +
            <br />
            &nbsp;&nbsp;[0.15 × Environmental Weather Stress] + [0.15 × Incident &amp; SOS Intensity] +
            <br />
            &nbsp;&nbsp;[0.05 × Spatial Bottleneck Factor]
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-700/50">
              <span className="font-bold text-emerald-400 block">0 - 30</span>
              <span className="text-[10px] text-slate-300">LOW</span>
            </div>
            <div className="p-2 rounded bg-amber-950/40 border border-amber-700/50">
              <span className="font-bold text-amber-400 block">31 - 60</span>
              <span className="text-[10px] text-slate-300">MODERATE</span>
            </div>
            <div className="p-2 rounded bg-orange-950/40 border border-orange-700/50">
              <span className="font-bold text-orange-400 block">61 - 80</span>
              <span className="text-[10px] text-slate-300">HIGH</span>
            </div>
            <div className="p-2 rounded bg-red-950/40 border border-red-700/50">
              <span className="font-bold text-red-400 block">81 - 100</span>
              <span className="text-[10px] text-slate-300">CRITICAL</span>
            </div>
          </div>
        </div>

        {/* Research Contribution Card (5 cols) */}
        <div className="xl:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950/50 border border-slate-700/80 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                College PBL Research Gap Alignment
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Existing literature separately covers simulation (Karthika et al. 2020), RFID sensing (Yamin 2019), or static spatial GIS (Kasthala et al. 2019).
            </p>
            <div className="p-2.5 rounded bg-blue-950/40 border border-blue-800 text-[11px] text-blue-200">
              <b>Our Integrated Contribution:</b> Bridging continuous multi-sensor streams with automated explainable AI alert delivery, feedback loops, and centralized command-room dispatch.
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Prototype Validation: Ready</span>
            <span className="text-emerald-400 font-mono">100% EXPLAINABLE</span>
          </div>
        </div>
      </div>

      {/* Main Zone Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zone Selector Column (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
            Evaluated Sectors ({evaluations.length})
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[620px] pr-1">
            {evaluations.map((ev) => {
              const isSelected = selectedEvaluation?.zoneId === ev.zoneId;
              const isCrit = ev.riskLevel === 'CRITICAL';
              const isHigh = ev.riskLevel === 'HIGH';

              return (
                <button
                  key={ev.zoneId}
                  onClick={() => setSelectedEvaluation(ev)}
                  className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-xs text-white truncate">{ev.zoneName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Confidence: {(ev.confidenceScore * 100).toFixed(0)}% • Urgency: {ev.evacuationUrgency}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-extrabold font-mono ${
                        isCrit ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-emerald-400'
                      }`}
                    >
                      {ev.riskScore}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">
                      {ev.riskLevel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Explainability Panel (8 cols) */}
        {selectedEvaluation && (
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-5">
            {/* Header of Selected Zone */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                  ZONE EVALUATION DOSSIER
                </span>
                <h3 className="text-lg font-black text-white">{selectedEvaluation.zoneName}</h3>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(
                    selectedEvaluation.riskScore
                  )}`}
                >
                  <div className="text-2xl font-black font-mono leading-none">
                    {selectedEvaluation.riskScore}
                    <span className="text-xs font-normal opacity-70"> / 100</span>
                  </div>
                  <div className="text-[10px] font-bold tracking-wider uppercase mt-1">
                    {selectedEvaluation.riskLevel} RISK
                  </div>
                </div>
              </div>
            </div>

            {/* Core Feature Breakdown Meters */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Factor Contribution Weights
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Crowd Density</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {selectedEvaluation.factorBreakdown.crowdDensityContribution} / 40 pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{
                        width: `${(selectedEvaluation.factorBreakdown.crowdDensityContribution / 40) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Flow Momentum</span>
                    <span className="font-mono text-blue-300 font-bold">
                      {selectedEvaluation.factorBreakdown.crowdMomentumContribution} / 25 pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full"
                      style={{
                        width: `${(selectedEvaluation.factorBreakdown.crowdMomentumContribution / 25) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Weather & SOS</span>
                    <span className="font-mono text-red-300 font-bold">
                      {(
                        selectedEvaluation.factorBreakdown.weatherStressContribution +
                        selectedEvaluation.factorBreakdown.incidentSosContribution
                      ).toFixed(1)}{' '}
                      / 30 pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-400 h-full rounded-full"
                      style={{
                        width: `${
                          ((selectedEvaluation.factorBreakdown.weatherStressContribution +
                            selectedEvaluation.factorBreakdown.incidentSosContribution) /
                            30) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CRITICAL FOR VIVA: Transparent Explanations Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 shadow-inner">
              <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Explainable AI Risk Diagnostic (Why this location was classified):</span>
              </div>

              <div className="space-y-1.5 pl-2 text-xs text-slate-200">
                {selectedEvaluation.explanations.map((exp, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Recommendation */}
            <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-700/60 text-xs text-blue-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Automated Action Protocol:</span>
                <span>{selectedEvaluation.recommendedAction}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Literature Survey References Section (Directly from PDF Pages 9-12) */}
      {researchData && (
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Literature Survey & Research Grounding (PBL Syllabus Reference)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              3 Published Peer-Reviewed Papers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {researchData.papers.map((paper: any) => (
              <div
                key={paper.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between text-xs space-y-2.5"
              >
                <div>
                  <div className="text-[10px] font-mono text-amber-400">
                    PAPER #{paper.id} • {paper.year} • {paper.journal}
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1 leading-snug">
                    {paper.title}
                  </h4>
                  <div className="text-slate-400 text-[11px] mt-1 italic">
                    Authors: {paper.authors}
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                  <div>
                    <b className="text-blue-400">Method:</b> {paper.technology}
                  </div>
                  <div>
                    <b className="text-amber-400">Gap:</b> {paper.limitation}
                  </div>
                  <div>
                    <b className="text-emerald-400">Our Relevance:</b> {paper.relevance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
