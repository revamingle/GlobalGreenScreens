export type BarrierType = 'Hedge' | 'Tree Row' | 'Living Wall';

export interface DataPoint {
  id: string;
  pm25RoadSide: number;
  pm25PedestrianSide: number;
  latitude: number;
  longitude: number;
  plantSpecies: string;
  barrierType: BarrierType;
  temperature: number;
  humidity: number;
  trafficLevel?: 'Low' | 'Medium' | 'High';
  repeats?: number;
  confidenceScore: number;
  imageUrl?: string;
  country: string;
  timestamp: string;
  isSample?: boolean; // To clearly label demo/sample data
  
  // Seattle Study specific metadata
  siteId?: string;
  neighborhood?: string;
  address?: string;
  height?: number;
  distanceFromRoad?: number;
  dailyTraffic?: number;
  
  // Scientific fields for higher credibility
  windSpeed?: number;
  windDirection?: string;
  rainStatus?: 'Dry' | 'Mist/Drizzle' | 'Rain' | 'Heavy Rain';
  plantCoveragePct?: number;
  plantIdStatus?: 'Unverified' | 'Verified (Field Guide)' | 'Verified (Expert)' | 'Verified (ID App)';
  safetyChecklist?: {
    safePlacement: boolean;
    secureEquipment: boolean;
    clearLineOfSight: boolean;
    awayFromExhausts: boolean;
  };
}

export type TabType = 'form' | 'map' | 'dashboard' | 'learn';
