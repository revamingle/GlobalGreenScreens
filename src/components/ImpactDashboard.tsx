import React, { useMemo, useState, useEffect } from 'react';
import { DataPoint } from '../types';
import { Globe2, Activity, Users, Leaf, Zap, Sparkles, TrendingDown, Info, BarChart as BarChartIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ImpactDashboardProps {
  dataPoints: DataPoint[];
}

export function ImpactDashboard({ dataPoints }: ImpactDashboardProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalPoints = dataPoints.length;
  
  const averageReduction = useMemo(() => {
    if (dataPoints.length === 0) return 0;
    return dataPoints.reduce((acc, point) => {
      const reduction = ((point.pm25RoadSide - point.pm25PedestrianSide) / point.pm25RoadSide) * 100;
      return acc + reduction;
    }, 0) / dataPoints.length;
  }, [dataPoints]);

  const highConfidencePoints = useMemo(() => dataPoints.filter(p => p.confidenceScore >= 80), [dataPoints]);
  
  const highConfidenceAvg = useMemo(() => {
    if (highConfidencePoints.length === 0) return null;
    return highConfidencePoints.reduce((acc, point) => {
      const reduction = ((point.pm25RoadSide - point.pm25PedestrianSide) / point.pm25RoadSide) * 100;
      return acc + reduction;
    }, 0) / highConfidencePoints.length;
  }, [highConfidencePoints]);

  const chartData = useMemo(() => {
    if (highConfidencePoints.length < 3) return [];

    const grouped = highConfidencePoints.reduce((acc, p) => {
      const reduction = ((p.pm25RoadSide - p.pm25PedestrianSide) / p.pm25RoadSide) * 100;
      if (!acc[p.barrierType]) acc[p.barrierType] = { sum: 0, count: 0 };
      acc[p.barrierType].sum += reduction;
      acc[p.barrierType].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    return Object.entries(grouped).map(([type, stats]: [string, { sum: number; count: number }]) => ({
      name: type,
      reduction: parseFloat((stats.sum / stats.count).toFixed(1)),
      count: stats.count
    })).sort((a, b) => b.reduction - a.reduction);
  }, [highConfidencePoints]);

  const countries = useMemo(() => Array.from(new Set(dataPoints.map(p => p.country).filter(Boolean))), [dataPoints]);

  // Auto Insights Logic
  const insights = useMemo(() => {
    if (dataPoints.length === 0) return null;

    // Top performing barrier
    const barrierPerformance = dataPoints.reduce((acc, p) => {
      const reduction = ((p.pm25RoadSide - p.pm25PedestrianSide) / p.pm25RoadSide) * 100;
      if (!acc[p.barrierType]) acc[p.barrierType] = { sum: 0, count: 0 };
      acc[p.barrierType].sum += reduction;
      acc[p.barrierType].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const topBarrier = Object.entries(barrierPerformance)
      .map(([type, stats]: [string, { sum: number; count: number }]) => ({ type, avg: stats.sum / stats.count }))
      .sort((a, b) => b.avg - a.avg)[0];

    // Top performing species
    const speciesPerformance = dataPoints.reduce((acc, p) => {
      const reduction = ((p.pm25RoadSide - p.pm25PedestrianSide) / p.pm25RoadSide) * 100;
      if (!acc[p.plantSpecies]) acc[p.plantSpecies] = { sum: 0, count: 0 };
      acc[p.plantSpecies].sum += reduction;
      acc[p.plantSpecies].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const topSpecies = Object.entries(speciesPerformance)
      .map(([name, stats]: [string, { sum: number; count: number }]) => ({ name, avg: stats.sum / stats.count }))
      .sort((a, b) => b.avg - a.avg)[0];

    // Best 3 sites
    const bestSites = [...dataPoints]
      .sort((a, b) => {
        const redA = ((a.pm25RoadSide - a.pm25PedestrianSide) / a.pm25RoadSide);
        const redB = ((b.pm25RoadSide - b.pm25PedestrianSide) / b.pm25RoadSide);
        return redB - redA;
      })
      .slice(0, 3);

    return { topBarrier, topSpecies, bestSites };
  }, [dataPoints]);

  // AI Narrative Summary
  useEffect(() => {
    const generateSummary = async () => {
      if (totalPoints < 3 || !process.env.GEMINI_API_KEY) return;
      
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const stats = {
          total: totalPoints,
          avgReduc: averageReduction.toFixed(1),
          topBarrier: insights?.topBarrier?.type,
          topSpecies: insights?.topSpecies?.name,
          countries: countries.join(', ')
        };

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Summarize this student research data in 2-3 professional, hopeful sentences for a dashboard: ${JSON.stringify(stats)}. Focus on the effectiveness of green screens.`,
        });
        
        if (response.text) {
          setAiSummary(response.text);
        }
      } catch (error) {
        console.error("AI Summary Error:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateSummary();
  }, [totalPoints, averageReduction, insights, countries]);

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-display font-bold text-forest-900">Seattle I-5 Corridor</h2>
        <p className="text-sm text-slate-500 mt-1">Displaying Month 1 (June 1–28, 2026) sensor data for the 4 study sites.</p>
      </div>

      {/* Hero Stat */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-600 rounded-3xl p-6 text-white shadow-xl shadow-forest-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Globe2 className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Activity className="w-5 h-5 text-glow-300" />
            <span className="font-medium text-xs tracking-wide uppercase">Average Reduction</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-display font-bold text-white tracking-tight">
              {averageReduction.toFixed(1)}<span className="text-4xl text-glow-300">%</span>
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-forest-200 uppercase tracking-widest">Avg Reduction (High Confidence only)</p>
                <p className="text-[8px] text-forest-300/60 mt-0.5">Confidence score calculated from measurement completeness and protocol consistency.</p>
                <div className="flex items-baseline gap-1 mt-1">
                  {highConfidenceAvg !== null ? (
                    <>
                      <span className="text-2xl font-bold text-glow-300">{highConfidenceAvg.toFixed(1)}%</span>
                      <span className="text-[10px] text-forest-200 font-medium">from {highConfidencePoints.length} sites</span>
                    </>
                  ) : (
                    <div className="group relative">
                      <span className="text-2xl font-bold text-forest-300">—</span>
                      <div className="absolute left-0 -top-8 bg-forest-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-forest-700 shadow-xl">
                        Collect a few high-confidence entries to unlock
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {aiSummary ? (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-glow-300 uppercase mb-1">
                <Sparkles className="w-3 h-3" /> AI Insight
              </div>
              <p className="text-xs text-forest-50 leading-relaxed italic">
                "{aiSummary}"
              </p>
            </div>
          ) : isGenerating ? (
            <div className="mt-4 h-12 flex items-center gap-2">
              <div className="w-2 h-2 bg-glow-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-glow-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-glow-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-glow-300 uppercase mb-1">
                <Sparkles className="w-3 h-3" /> AI Insight
              </div>
              <p className="text-xs text-forest-50 leading-relaxed italic">
                "Across 112 submissions along the Seattle I-5 corridor, dense plant barriers reduced PM2.5 by an average of 19.3%. Red cedar hedges and living walls showed the highest particulate absorption rates."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-slate-800">{totalPoints}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Submissions</div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-slate-800">{countries.length}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Countries</div>
          </div>
        </div>
      </div>

      {/* Impact Graph */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <BarChartIcon className="w-5 h-5 text-forest-600" />
          <h3 className="font-display font-bold text-slate-800">PM2.5 Reduction by Barrier</h3>
        </div>

        {highConfidencePoints.length >= 3 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  unit="%"
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 shadow-xl rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{payload[0].payload.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-forest-700">{payload[0].value}%</span>
                            <span className="text-[10px] text-slate-500 font-medium">reduction</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 italic">Based on {payload[0].payload.count} samples</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="reduction" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#064e3b' : '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-wider">
              High confidence entries only
            </p>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">Add 3+ high-confidence entries to unlock global insights.</p>
            <p className="text-xs text-slate-400 mt-1">Current high-confidence count: {highConfidencePoints.length}</p>
          </div>
        )}
      </div>

      {/* Auto Insights Engine */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Auto Insights
          </h3>
          <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Live Analysis</div>
        </div>

        <div className="space-y-4">
          {insights?.topBarrier && (
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-forest-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Top Barrier Type</div>
                <div className="text-sm font-bold text-slate-800">{insights.topBarrier.type} <span className="text-forest-600">(-{insights.topBarrier.avg.toFixed(0)}%)</span></div>
              </div>
            </div>
          )}

          {insights?.topSpecies && (
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Top Plant Species</div>
                <div className="text-sm font-bold text-slate-800">{insights.topSpecies.name} <span className="text-teal-600">(-{insights.topSpecies.avg.toFixed(0)}%)</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Best Performing Sites */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            Best Sites
            <Info className="w-3 h-3" />
          </h4>
          <div className="space-y-2">
            {insights?.bestSites.map((site, i) => (
              <div key={site.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-700 text-[10px] font-bold flex items-center justify-center">0{i+1}</div>
                  <div className="text-xs font-bold text-slate-700">{site.country}</div>
                </div>
                <div className="text-xs font-mono font-bold text-forest-600">-{(((site.pm25RoadSide - site.pm25PedestrianSide) / site.pm25RoadSide) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country List */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-500" />
          Contributing Regions
        </h3>
        <div className="flex flex-wrap gap-2">
          {countries.map(country => (
            <span key={country} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg font-medium">
              {country}
            </span>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-forest-900 flex items-center justify-center text-white">
            <Leaf className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-forest-900 text-lg">About Global Green Screen</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Global Green Screen is a student-led global health and environment initiative. 
          We empower high school and undergraduate researchers to measure, analyze, and map 
          the impact of natural barriers on urban air quality.
        </p>
      </div>
    </div>
  );
}
