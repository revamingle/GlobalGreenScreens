import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { DataPoint } from '../types';
import { Wind, Leaf, Filter, X, Sparkles } from 'lucide-react';

// No local leaflet.css import needed as it's in index.html
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  dataPoints: DataPoint[];
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Force multiple resize invalidations to ensure map tiles load correctly
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);
    const timer3 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [center, zoom, map]);
  return null;
}

export function InteractiveMap({ dataPoints }: InteractiveMapProps) {
  const [center, setCenter] = useState<[number, number]>([47.6062, -122.3321]); // Seattle Default Focus
  const [zoom, setZoom] = useState(11);
  const [showFilters, setShowFilters] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  
  // Custom icons based on reduction percentage - moved inside to ensure L is available
  const icons = useMemo(() => {
    if (!L || !L.divIcon) return null;
    
    const createIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container">
            <div class="marker-pulse" style="background-color: ${color}"></div>
            <div class="marker-core" style="background-color: ${color}"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    };

    return {
      green: createIcon('#10B981'),
      yellow: createIcon('#F59E0B'),
      red: createIcon('#EF4444'),
    };
  }, []);

  // Filter States
  const [barrierFilter, setBarrierFilter] = useState<string>('All');
  const [plantFilter, setPlantFilter] = useState<string>('All');

  const filteredPoints = useMemo(() => {
    return dataPoints.filter(p => {
      // Basic validation: skip points with invalid coordinates
      if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number' || isNaN(p.latitude) || isNaN(p.longitude)) {
        return false;
      }
      
      const matchBarrier = barrierFilter === 'All' || p.barrierType === barrierFilter;
      const matchPlant = plantFilter === 'All' || p.plantSpecies === plantFilter;
      return matchBarrier && matchPlant;
    });
  }, [dataPoints, barrierFilter, plantFilter]);

  const uniqueBarriers = useMemo(() => Array.from(new Set(dataPoints.map(p => p.barrierType))), [dataPoints]);
  const uniquePlants = useMemo(() => Array.from(new Set(dataPoints.map(p => p.plantSpecies))), [dataPoints]);

  useEffect(() => {
    if (filteredPoints.length > 0) {
      const latest = filteredPoints[filteredPoints.length - 1];
      // Only fly to the latest point if it is a newly submitted user record
      if (!latest.isSample) {
        setCenter([latest.latitude, latest.longitude]);
        setZoom(13);
      }
    }
  }, [filteredPoints]);

  const getMarkerIcon = (point: DataPoint) => {
    if (!icons) return undefined;
    const reduction = ((point.pm25RoadSide - point.pm25PedestrianSide) / point.pm25RoadSide) * 100;
    if (reduction > 20) return icons.green;
    if (reduction < 5) return icons.red;
    return icons.yellow;
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return { label: 'High Confidence', color: 'bg-emerald-100 text-emerald-700' };
    if (score >= 60) return { label: 'Moderate', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Preliminary', color: 'bg-rose-100 text-rose-700' };
  };

  return (
    <div className="h-full w-full relative flex flex-col bg-slate-100">
      {/* Header & Legend */}
      {!activePopup && (
        <div className="absolute top-4 left-4 right-4 z-[2000] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-display font-bold text-forest-900">Global Green Screen Sites</h2>
              <div className="flex gap-2">
                {dataPoints.length > 0 && (
                  <button 
                    onClick={() => {
                      const latest = filteredPoints[filteredPoints.length - 1] || dataPoints[dataPoints.length - 1];
                      setCenter([latest.latitude, latest.longitude]);
                      setZoom(12);
                    }}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-forest-50 hover:text-forest-600 transition-all"
                    title="Recenter on latest"
                  >
                    <Wind className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-forest-100 text-forest-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm"></div>
                <span className="text-slate-600">&gt;20% Reduc.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-sm"></div>
                <span className="text-slate-600">5-20%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow-sm"></div>
                <span className="text-slate-600">&lt;5%</span>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Barrier Type</label>
                  <select 
                    value={barrierFilter}
                    onChange={(e) => setBarrierFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] font-bold text-slate-700 outline-none"
                  >
                    <option value="All">All Types</option>
                    {uniqueBarriers.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Plant Species</label>
                  <select 
                    value={plantFilter}
                    onChange={(e) => setPlantFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] font-bold text-slate-700 outline-none"
                  >
                    <option value="All">All Species</option>
                    {uniquePlants.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 w-full relative overflow-hidden">
        {dataPoints.length === 0 ? (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-4 text-forest-600">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-800 mb-2">No Research Sites Yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-6">
              Be the first to contribute data from your region.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Start</p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-left flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center text-[10px] font-bold">1</div>
                <span className="text-xs font-medium text-slate-600">Tap "Record" to add your own site</span>
              </div>
            </div>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[500] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700">No sites match your filters</span>
            <button 
              onClick={() => { setBarrierFilter('All'); setPlantFilter('All'); }}
              className="text-xs font-bold text-forest-600 underline ml-1"
            >
              Clear
            </button>
          </div>
        ) : null}

        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
          zoomControl={false}
        >
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
/>
          <MapUpdater center={center} zoom={zoom} />
          
          {filteredPoints.map((point) => {
            const reduction = ((point.pm25RoadSide - point.pm25PedestrianSide) / point.pm25RoadSide) * 100;
            
            return (
              <React.Fragment key={point.id}>
                <CircleMarker 
                  center={[point.latitude, point.longitude]}
                  radius={6}
                  pathOptions={{ 
                    fillColor: reduction > 20 ? '#10B981' : reduction < 5 ? '#EF4444' : '#F59E0B',
                    fillOpacity: 0.8,
                    color: 'white',
                    weight: 1
                  }}
                />
                <Marker 
                  position={[point.latitude, point.longitude]}
                  icon={getMarkerIcon(point)}
                  eventHandlers={{
                    popupopen: () => setActivePopup(point.id),
                    popupclose: () => setActivePopup(null),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[220px]">
                      {point.siteId ? (
                        <div className="mb-2 px-2 py-1 bg-forest-50 border border-forest-100 rounded-lg text-center">
                          <span className="font-bold text-[9px] text-forest-700 block tracking-wider uppercase">Seattle Study Site</span>
                          <span className="font-black text-xs text-forest-900 block mt-0.5">{point.siteId} — {point.neighborhood}</span>
                          <p className="text-[8px] text-slate-400 mt-0.5 max-w-[200px] mx-auto truncate leading-tight" title={point.address}>{point.address}</p>
                        </div>
                      ) : point.isSample && (
                        <div className="px-2 py-0.5 mb-2 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded text-[9px] font-black uppercase text-center tracking-wider">
                          Sample Data
                        </div>
                      )}
                      <div className="flex flex-col items-center text-center mb-3">
                        <div className={`text-3xl font-display font-black mb-1 ${
                          reduction > 20 ? 'text-emerald-600' : 
                          reduction < 5 ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          -{reduction.toFixed(1)}%
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Data confidence</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getConfidenceLabel(point.confidenceScore).color}`}>
                            {getConfidenceLabel(point.confidenceScore).label}
                          </span>
                          <p className="text-[6px] text-slate-400 mt-0.5 leading-tight max-w-[140px]">Confidence score calculated from measurement completeness and protocol consistency.</p>
                        </div>
                      </div>
                      
                      {point.imageUrl && (
                        <div className="w-full h-24 mb-3 rounded-lg overflow-hidden shadow-sm">
                          <img src={point.imageUrl} alt="Barrier" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Barrier Type</span>
                          <span className="font-bold text-slate-700">{point.barrierType}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Species</span>
                          <span className="font-bold text-slate-700">{point.plantSpecies}</span>
                        </div>
                        
                        {point.height !== undefined && (
                          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                            <span className="text-slate-500 font-bold uppercase tracking-tighter">Barrier Height</span>
                            <span className="font-bold text-slate-700">{point.height} m</span>
                          </div>
                        )}
                        {point.distanceFromRoad !== undefined && (
                          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                            <span className="text-slate-500 font-bold uppercase tracking-tighter">Dist from Road</span>
                            <span className="font-bold text-slate-700">{point.distanceFromRoad} m</span>
                          </div>
                        )}
                        {point.dailyTraffic !== undefined && (
                          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                            <span className="text-slate-500 font-bold uppercase tracking-tighter">Traffic (AADT)</span>
                            <span className="font-bold text-slate-700">{point.dailyTraffic.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Roadside PM2.5</span>
                          <span className="font-mono font-bold text-slate-700">{point.pm25RoadSide} µg/m³</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Pedestrian PM2.5</span>
                          <span className="font-mono font-bold text-slate-700">{point.pm25PedestrianSide} µg/m³</span>
                        </div>
                        
                        {/* New Scientific Metadata Display */}
                        {point.windSpeed !== undefined && (
                          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                            <span className="text-slate-500 font-bold uppercase tracking-tighter">Wind Context</span>
                            <span className="font-bold text-slate-700">{point.windSpeed} m/s {point.windDirection}</span>
                          </div>
                        )}
                        {point.plantCoveragePct !== undefined && (
                          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                            <span className="text-slate-500 font-bold uppercase tracking-tighter">Plant Coverage</span>
                            <span className="font-bold text-slate-700">{point.plantCoveragePct}%</span>
                          </div>
                        )}
                        {point.plantIdStatus && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-500 font-bold uppercase tracking-tighter">Plant ID</span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded text-[8px]">{point.plantIdStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
