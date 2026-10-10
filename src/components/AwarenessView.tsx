import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Binary, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AWARENESS_MODULES, QUIZ_QUESTIONS } from '../data/defaultFiles';
import { computeHash, calculateAvalanche } from '../utils/crypto';

export const AwarenessView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'standards' | 'avalanche' | 'threats' | 'quiz'>('standards');

  // Avalanche Playground state
  const [inputText1, setInputText1] = useState('Production_Config_v1.0;TLS_ENABLED=true');
  const [inputText2, setInputText2] = useState('Production_Config_v1.0;TLS_ENABLED=false');
  const [hash1, setHash1] = useState('');
  const [hash2, setHash2] = useState('');
  const [avalancheStats, setAvalancheStats] = useState<ReturnType<typeof calculateAvalanche> | null>(null);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const runHashes = async () => {
      const h1 = await computeHash(inputText1, 'SHA-256');
      const h2 = await computeHash(inputText2, 'SHA-256');
      if (!isCurrent) return;
      setHash1(h1);
      setHash2(h2);
      setAvalancheStats(calculateAvalanche(h1, h2));
    };
    runHashes();
    return () => { isCurrent = false; };
  }, [inputText1, inputText2]);

  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (showQuizResults) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Internship Knowledge Base
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Cybersecurity Awareness &amp; Threat Intelligence</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Security Awareness &amp; Compliance Engineering
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Understanding the "Why" behind File Integrity Monitoring (FIM). Explore regulatory compliance mandates (PCI-DSS, HIPAA, CIS), test the cryptographic avalanche effect interactively, study real-world threat case studies, and complete the virtual internship readiness quiz.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/40 rounded-t-xl px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('standards')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'standards'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>FIM Standards &amp; Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('avalanche')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'avalanche'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>Interactive Avalanche Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('threats')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'threats'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Threat Case Studies &amp; Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'quiz'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Internship Knowledge Assessment</span>
        </button>
      </div>

      {/* Tab 1: Standards & Modules */}
      {activeTab === 'standards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AWARENESS_MODULES.map((mod) => (
            <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  {mod.standard}
                </span>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {mod.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {mod.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {mod.overview}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Mandatory Security Principles:
                </div>
                {mod.keyPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400 shrink-0">·</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Interactive Avalanche Lab */}
      {activeTab === 'avalanche' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-sm font-bold text-white tracking-tight">
              The Cryptographic Avalanche Effect Demonstrator
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              In secure hash functions (SHA-256), a strict avalanche condition dictates that changing a single input bit must randomly flip approximately 50% of the output bits. Try editing one character below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input 1 */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Sample File Content A:
              </label>
              <textarea
                rows={3}
                value={inputText1}
                onChange={(e) => setInputText1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <div className="text-xs text-slate-400">
                <span>Calculated SHA-256 Digest:</span>
                <div className="font-mono text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800 break-all select-all mt-1">
                  {hash1}
                </div>
              </div>
            </div>

            {/* Input 2 */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Sample File Content B (Tampered Variation):
              </label>
              <textarea
                rows={3}
                value={inputText2}
                onChange={(e) => setInputText2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <div className="text-xs text-slate-400">
                <span>Calculated SHA-256 Digest:</span>
                <div className="font-mono text-[11px] text-rose-300 bg-slate-950 p-2 rounded border border-slate-800 break-all select-all mt-1">
                  {hash2}
                </div>
              </div>
            </div>
          </div>

          {/* Avalanche Statistics */}
          {avalancheStats && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Bit-Level Hamming Distance &amp; Divergence Ratio:
                </span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {avalancheStats.percentage}% Output Bits Flipped
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${avalancheStats.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Output Bits: {avalancheStats.totalBits} (256 bits)</span>
                <span>Flipped Bits: {avalancheStats.bitDifferences} bits</span>
                <span>Theoretical Target: ~50.0% (Cryptographic Random Avalanche)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Threat Case Studies */}
      {activeTab === 'threats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AWARENESS_MODULES.map((mod) => (
            <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  {mod.threatScenario.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {mod.threatScenario.description}
              </p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-cyan-400 font-semibold">How FIM Detects It:</span>
                  <p className="text-slate-400 mt-0.5">{mod.threatScenario.detectionMethod}</p>
                </div>
                <div>
                  <span className="text-emerald-400 font-semibold">Business Security Impact:</span>
                  <p className="text-slate-400 mt-0.5">{mod.threatScenario.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Knowledge Assessment Quiz */}
      {activeTab === 'quiz' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Virtual Cybersecurity Internship Assessment Quiz
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                8 Scenario-Based Technical Questions on Cryptography, RBAC, Input Validation, and FIM Compliance
              </p>
            </div>

            <div className="flex items-center gap-2">
              {showQuizResults ? (
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setShowQuizResults(false);
                  }}
                  className="px-3.5 py-1.5 text-xs text-cyan-300 bg-cyan-950 border border-cyan-800 rounded-md hover:bg-cyan-900 transition-colors"
                >
                  Retake Quiz
                </button>
              ) : (
                <button
                  onClick={() => setShowQuizResults(true)}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors disabled:opacity-50"
                >
                  Grade Assessment ({Object.keys(selectedAnswers).length}/{QUIZ_QUESTIONS.length})
                </button>
              )}
            </div>
          </div>

          {/* Score banner if submitted */}
          {showQuizResults && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-sm font-bold text-white">
                    Internship Score: {calculateScore()} / {QUIZ_QUESTIONS.length} ({Math.round((calculateScore() / QUIZ_QUESTIONS.length) * 100)}%)
                  </div>
                  <div className="text-xs text-slate-400">
                    {calculateScore() >= 6
                      ? 'Distinction Achieved: Ready for virtual internship project dossier submission!'
                      : 'Review the explanations below and retake to strengthen your understanding.'}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${
                calculateScore() >= 6 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {calculateScore() >= 6 ? 'VERIFIED QUALIFIED' : 'REVISION RECOMMENDED'}
              </span>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-5">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              const isGraded = showQuizResults;
              const isCorrect = selected === q.correctAnswer;

              return (
                <div key={q.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {idx + 1}. {q.question}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {q.concept}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === optIdx;
                      let optionClasses = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (isGraded) {
                        if (optIdx === q.correctAnswer) {
                          optionClasses = 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-medium';
                        } else if (isOptionSelected && !isCorrect) {
                          optionClasses = 'bg-rose-950/60 border-rose-700 text-rose-200';
                        }
                      } else if (isOptionSelected) {
                        optionClasses = 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-md border text-xs transition-colors flex items-center justify-between ${optionClasses}`}
                        >
                          <span>{opt}</span>
                          {isGraded && optIdx === q.correctAnswer && (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation when graded */}
                  {isGraded && (
                    <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                      <strong className="text-cyan-300">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
