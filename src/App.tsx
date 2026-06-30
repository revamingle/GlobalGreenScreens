import React, { useState, useEffect } from 'react';
import { DataEntryForm } from './components/DataEntryForm';
import { InteractiveMap } from './components/InteractiveMap';
import { ImpactDashboard } from './components/ImpactDashboard';
import { EducationPage } from './components/EducationPage';
import { DataPoint, TabType } from './types';
import { DEMO_DATA } from './demoData';
import { Map, PlusCircle, BarChart3, Leaf, BookOpen, RotateCcw, Sparkles, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() => {
    const saved = localStorage.getItem('ggs_data_points');
    return saved ? JSON.parse(saved) : [];
  });

  const displayPoints = [...dataPoints, ...DEMO_DATA];

  useEffect(() => {
    localStorage.setItem('ggs_data_points', JSON.stringify(dataPoints));
  }, [dataPoints]);

  const handleReset = () => {
    if (window.confirm('Clear all submissions and reset to initial state?')) {
      setDataPoints([]);
      localStorage.removeItem('ggs_data_points');
    }
  };

  const handleAddDataPoint = (newData: Omit<DataPoint, 'id' | 'timestamp' | 'country'>) => {
    const countries = ['United Kingdom', 'United States', 'Japan', 'France', 'Australia', 'Germany', 'Canada'];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    const newPoint: DataPoint = {
      ...newData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      country: randomCountry,
    };
    setDataPoints([...dataPoints, newPoint]);
    setActiveTab('map'); // Switch to map to see the new point
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-forest-900 text-white py-3 px-3 shadow-md sticky top-0 z-[9999] flex-shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-glow-400 to-teal-500 flex items-center justify-center shadow-lg shadow-glow-500/30 flex-shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-display font-bold tracking-tight whitespace-nowrap">Global Green Screen</h1>
              <p className="text-[8px] text-forest-200 font-medium tracking-wide uppercase whitespace-nowrap">Student Research Initiative</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-forest-800/50 text-forest-200 border border-forest-700 whitespace-nowrap">
              <Database className="w-3 h-3" />
              Seattle I-5 Study (112)
            </div>
            
            <button 
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-forest-800/50 text-forest-300 border border-forest-700 hover:bg-red-900/30 hover:text-red-300 hover:border-red-800/50 transition-all flex-shrink-0"
              title="Reset All Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 relative ${activeTab === 'map' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {activeTab === 'learn' && <EducationPage onNavigate={setActiveTab} />}
        {activeTab === 'form' && <DataEntryForm onSubmit={handleAddDataPoint} />}
        {activeTab === 'map' && <InteractiveMap dataPoints={displayPoints} />}
        {activeTab === 'dashboard' && <ImpactDashboard dataPoints={displayPoints} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-[9999]">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeTab === 'learn' 
                ? 'text-forest-700 bg-forest-50' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className={`w-6 h-6 mb-1 ${activeTab === 'learn' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Learn</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeTab === 'dashboard' 
                ? 'text-forest-700 bg-forest-50' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className={`w-6 h-6 mb-1 ${activeTab === 'dashboard' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Impact</span>
          </button>
          
          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeTab === 'form' 
                ? 'text-forest-700 bg-forest-50' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-6 mb-1 shadow-lg ${
              activeTab === 'form'
                ? 'bg-forest-700 text-white shadow-forest-700/30'
                : 'bg-white text-forest-700 border border-slate-200'
            }`}>
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Record</span>
          </button>
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeTab === 'map' 
                ? 'text-forest-700 bg-forest-50' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Map className={`w-6 h-6 mb-1 ${activeTab === 'map' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Map</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
