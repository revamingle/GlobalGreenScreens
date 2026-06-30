import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, Leaf, Thermometer, Droplets, Wind, CheckCircle2, AlertCircle, X, CloudRain, ShieldCheck, Info } from 'lucide-react';
import { DataPoint, BarrierType } from '../types';

interface DataEntryFormProps {
  onSubmit: (data: Omit<DataPoint, 'id' | 'timestamp' | 'country'>) => void;
}

const COMMON_SPECIES = ['Boxwood', 'Laurel', 'Ivy', 'Western Red Cedar', 'Douglas Fir', 'Other'];
const BARRIER_TYPES: BarrierType[] = ['Hedge', 'Tree Row', 'Living Wall'];

export function DataEntryForm({ onSubmit }: DataEntryFormProps) {
  const [pm25RoadSide, setPm25RoadSide] = useState('');
  const [pm25PedestrianSide, setPm25PedestrianSide] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [plantSpecies, setPlantSpecies] = useState('Boxwood');
  const [customSpecies, setCustomSpecies] = useState('');
  const [barrierType, setBarrierType] = useState<BarrierType>('Hedge');
  const [temperature, setTemperature] = useState('');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [humidity, setHumidity] = useState('');
  const [trafficLevel, setTrafficLevel] = useState<'Low' | 'Medium' | 'High' | ''>('');
  const [repeats, setRepeats] = useState('1');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // New Scientific Fields
  const [windSpeed, setWindSpeed] = useState('');
  const [windDirection, setWindDirection] = useState('N');
  const [rainStatus, setRainStatus] = useState<'Dry' | 'Mist/Drizzle' | 'Rain' | 'Heavy Rain'>('Dry');
  const [plantCoveragePct, setPlantCoveragePct] = useState('90');
  const [plantIdStatus, setPlantIdStatus] = useState<'Unverified' | 'Verified (Field Guide)' | 'Verified (Expert)' | 'Verified (ID App)'>('Verified (ID App)');

  // Safety Checklist Statuses
  const [safePlacement, setSafePlacement] = useState(true);
  const [secureEquipment, setSecureEquipment] = useState(true);
  const [clearLineOfSight, setClearLineOfSight] = useState(true);
  const [awayFromExhausts, setAwayFromExhausts] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live calculation of reduction percentage
  const road = parseFloat(pm25RoadSide);
  const pedestrian = parseFloat(pm25PedestrianSide);
  const reductionPct = (road > 0 && !isNaN(pedestrian)) 
    ? ((road - pedestrian) / road) * 100 
    : null;

  // Data Confidence Scoring
  const calculateConfidence = () => {
    let score = 40;
    if (imagePreview) score += 15;
    if (temperature && humidity) score += 10;
    if (trafficLevel) score += 5;
    if (parseInt(repeats) >= 3) score += 5;
    
    // Scientific additions
    if (windSpeed) score += 5;
    if (plantCoveragePct) score += 5;
    if (plantIdStatus !== 'Unverified') score += 5;
    
    // Safety checklist adherence
    let safetyCount = 0;
    if (safePlacement) safetyCount += 1;
    if (secureEquipment) safetyCount += 1;
    if (clearLineOfSight) safetyCount += 1;
    if (awayFromExhausts) safetyCount += 2; // Extra weight for exhaust avoidance

    score += safetyCount * 3;
    return Math.min(100, score);
  };

  const confidenceScore = calculateConfidence();

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return { label: 'High Confidence', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    if (score >= 65) return { label: 'Moderate', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { label: 'Preliminary', color: 'text-rose-600 bg-rose-50 border-rose-100' };
  };

  const confInfo = getConfidenceLabel(confidenceScore);

  const getResultBadge = () => {
    if (reductionPct === null) return null;
    
    if (reductionPct > 20) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          High Impact: {reductionPct.toFixed(1)}% Reduction
        </div>
      );
    } else if (reductionPct >= 5) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 animate-in fade-in zoom-in duration-300">
          <AlertCircle className="w-3.5 h-3.5" />
          Moderate Impact: {reductionPct.toFixed(1)}% Reduction
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200 animate-in fade-in zoom-in duration-300">
          <AlertCircle className="w-3.5 h-3.5" />
          Low Impact: {reductionPct.toFixed(1)}% Reduction
        </div>
      );
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get location. Please ensure location permissions are granted.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!pm25RoadSide || !pm25PedestrianSide || !latitude || !longitude || !plantSpecies || !barrierType) {
      alert('Please fill in all required fields.');
      return;
    }

    const finalSpecies = plantSpecies === 'Other' ? customSpecies : plantSpecies;
    if (!finalSpecies) {
      alert('Please specify the plant species.');
      return;
    }

    // Convert temperature to C for storage if it was in F
    const tempVal = parseFloat(temperature);
    const finalTemp = tempUnit === 'F' ? (tempVal - 32) * 5/9 : (tempVal || 20);

    onSubmit({
      pm25RoadSide: Number(pm25RoadSide),
      pm25PedestrianSide: Number(pm25PedestrianSide),
      latitude: Number(latitude),
      longitude: Number(longitude),
      plantSpecies: finalSpecies,
      barrierType,
      temperature: finalTemp,
      humidity: Number(humidity) || 60,
      trafficLevel: trafficLevel || undefined,
      repeats: Number(repeats),
      confidenceScore,
      imageUrl: imagePreview || undefined,
      windSpeed: windSpeed ? Number(windSpeed) : undefined,
      windDirection: windSpeed ? windDirection : undefined,
      rainStatus,
      plantCoveragePct: plantCoveragePct ? Number(plantCoveragePct) : undefined,
      plantIdStatus,
      safetyChecklist: {
        safePlacement,
        secureEquipment,
        clearLineOfSight,
        awayFromExhausts
      }
    });

    // Reset form
    setPm25RoadSide('');
    setPm25PedestrianSide('');
    setLatitude('');
    setLongitude('');
    setPlantSpecies('Boxwood');
    setCustomSpecies('');
    setBarrierType('Hedge');
    setTemperature('');
    setHumidity('');
    setTrafficLevel('');
    setRepeats('1');
    setImagePreview(null);
    setWindSpeed('');
    setWindDirection('N');
    setRainStatus('Dry');
    setPlantCoveragePct('90');
    setPlantIdStatus('Verified (ID App)');
    setSafePlacement(true);
    setSecureEquipment(true);
    setClearLineOfSight(true);
    setAwayFromExhausts(true);
    
    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 font-sans">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs animate-in slide-in-from-top-4 duration-300">
          <div className="bg-forest-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-forest-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-glow-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold">Entry added to Global Map</p>
            </div>
            <button onClick={() => setShowToast(false)}>
              <X className="w-4 h-4 text-forest-300" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-forest-900">Record Data</h2>
          <p className="text-sm text-slate-500 mt-1">Co-located Roadside vs. Pedestrian monitoring</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data confidence</span>
          <div className={`px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${confInfo.color} transition-colors duration-500`}>
            {confInfo.label} ({confidenceScore})
          </div>
          <p className="text-[8px] text-slate-400 text-right max-w-[120px] leading-tight">Confidence score calculated from measurement completeness and protocol consistency.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card 1: Co-located Air Quality Monitors */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center">
              <Wind className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-bold text-slate-800">1. Simultaneous Measurements</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">PM2.5 Roadside</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={pm25RoadSide}
                    onChange={(e) => setPm25RoadSide(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all text-lg font-semibold"
                    placeholder="0.0"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">µg/m³</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">PM2.5 Pedestrian-side</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={pm25PedestrianSide}
                    onChange={(e) => setPm25PedestrianSide(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all text-lg font-semibold"
                    placeholder="0.0"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">µg/m³</span>
                </div>
              </div>
            </div>
            
            <div className="pt-1 min-h-[32px]">
              {getResultBadge() || (
                <div className="text-xs text-slate-400 italic ml-1">Enter values to calculate simultaneous reduction</div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Context */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-forest-50 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-forest-600" />
            </div>
            <h3 className="font-bold text-slate-800">2. Plant Barrier Context</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Plant Species</label>
                <select
                  value={plantSpecies}
                  onChange={(e) => setPlantSpecies(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all appearance-none font-medium"
                >
                  {COMMON_SPECIES.map((species) => (
                    <option key={species} value={species}>{species}</option>
                  ))}
                </select>
              </div>
              
              {plantSpecies === 'Other' && (
                <div className="col-span-2">
                  <input
                    type="text"
                    value={customSpecies}
                    onChange={(e) => setCustomSpecies(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all"
                    placeholder="Specify species name"
                    required
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Barrier Type</label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {BARRIER_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBarrierType(type)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                        barrierType === type
                          ? 'bg-forest-700 text-white border-forest-700 shadow-md shadow-forest-700/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-forest-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <button 
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[10px] font-bold text-forest-700 uppercase tracking-widest flex items-center gap-1 hover:text-forest-900 transition-colors"
                >
                  {showAdvanced ? 'Hide Advanced Weather & Setup' : 'Show Meteorological & repeats data'}
                  <Leaf className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showAdvanced && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Temp</label>
                      <button 
                        type="button"
                        onClick={() => setTempUnit(u => u === 'C' ? 'F' : 'C')}
                        className="text-[10px] font-black text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded uppercase"
                      >
                        °{tempUnit}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all font-semibold"
                        placeholder="20"
                        required={showAdvanced}
                      />
                      <Thermometer className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Humidity</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={humidity}
                        onChange={(e) => setHumidity(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all font-semibold"
                        placeholder="60"
                        required={showAdvanced}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">%</span>
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Traffic Level</label>
                      <select
                        value={trafficLevel}
                        onChange={(e) => setTrafficLevel(e.target.value as any)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all appearance-none font-medium"
                      >
                        <option value="">Select...</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Repeats</label>
                      <select
                        value={repeats}
                        onChange={(e) => setRepeats(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all appearance-none font-medium"
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n}x Readings</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: New Scientific Metadata & Checklist */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800">3. Scientific Protocol</h3>
          </div>

          <div className="space-y-4">
            {/* Weather Scientific Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Wind Speed</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all text-sm font-semibold"
                    placeholder="e.g. 5.5"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">mph</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Wind Dir</label>
                <select
                  value={windDirection}
                  onChange={(e) => setWindDirection(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all appearance-none font-semibold text-sm"
                >
                  {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Rain Status</label>
                <select
                  value={rainStatus}
                  onChange={(e) => setRainStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all appearance-none font-semibold text-sm"
                >
                  <option value="Dry">Dry</option>
                  <option value="Mist/Drizzle">Mist/Drizzle</option>
                  <option value="Rain">Rain</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Plant Coverage</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={plantCoveragePct}
                    onChange={(e) => setPlantCoveragePct(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all text-sm font-semibold"
                    placeholder="90"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Plant ID Status</label>
                <select
                  value={plantIdStatus}
                  onChange={(e) => setPlantIdStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-glow-400 focus:border-glow-400 outline-none transition-all appearance-none font-semibold text-sm"
                >
                  <option value="Unverified">Unverified Identification</option>
                  <option value="Verified (Field Guide)">Verified (Local Field Guide)</option>
                  <option value="Verified (ID App)">Verified (ID App - e.g. Seek, iNaturalist)</option>
                  <option value="Verified (Expert)">Verified by Botanist/Expert</option>
                </select>
              </div>
            </div>

            {/* Protocol/Safety Checklist */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                Data Integrity Safety Checklist
              </label>
              
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <label className="flex items-start gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={safePlacement}
                    onChange={(e) => setSafePlacement(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-forest-700 focus:ring-forest-500"
                  />
                  <span>Monitors placed in a secure, non-hazardous pedestrian zone</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={secureEquipment}
                    onChange={(e) => setSecureEquipment(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-forest-700 focus:ring-forest-500"
                  />
                  <span>Monitors firmly secured to avoid structural movement</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={clearLineOfSight}
                    onChange={(e) => setClearLineOfSight(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-forest-700 focus:ring-forest-500"
                  />
                  <span>Clear line of sight (no solid wall obstructions in between)</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={awayFromExhausts}
                    onChange={(e) => setAwayFromExhausts(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-forest-700 focus:ring-forest-500"
                  />
                  <span>Placed at least 5m away from direct stationary exhausts</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Evidence */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-glow-50 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-glow-600" />
            </div>
            <h3 className="font-bold text-slate-800">4. Visual Evidence</h3>
          </div>
          
          <div className="space-y-4">
            <div 
              className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center cursor-pointer hover:border-glow-400 transition-all bg-slate-50/50 hover:bg-glow-50/20"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-inner">
                  <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Change Photo
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-glow-500 mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-slate-700">Tap to Capture</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Photo of the barrier setup</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin className={`w-5 h-5 ${latitude ? 'text-glow-500' : 'text-slate-300'}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPS Location</p>
                  {latitude ? (
                    <p className="text-xs font-mono font-bold text-slate-600">{latitude}, {longitude}</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Not detected yet</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isLocating 
                    ? 'bg-slate-200 text-slate-400' 
                    : 'bg-forest-700 text-white shadow-lg shadow-forest-700/20 active:scale-95'
                }`}
              >
                {isLocating ? '...' : latitude ? 'Update' : 'Detect'}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-forest-900 text-white font-black py-5 rounded-3xl shadow-2xl shadow-forest-900/40 hover:bg-forest-800 active:scale-[0.97] transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest mt-4"
        >
          <Upload className="w-6 h-6" />
          Submit Research Record
        </button>
      </form>
    </div>
  );
}
