/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const VesselContext = createContext<any>(null);

export function VesselProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<any>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const mapRef = useRef<any>(null);

  const handleVesselSelect = useCallback((vesselData: any) => {
    setIsPanelLoading(true);
    setSelected(vesselData);

    const lon = vesselData.LONGITUDE ?? vesselData.longitude ?? vesselData.lon;
    const lat = vesselData.LATITUDE ?? vesselData.latitude ?? vesselData.lat;

    if (lon !== undefined && lat !== undefined) {
      mapRef.current?.flyToVessel(Number(lon), Number(lat));
    }
    
    setTimeout(() => setIsPanelLoading(false), 400); 
  }, []);

  return (
    <VesselContext.Provider value={{ selected, isPanelLoading, mapRef, handleVesselSelect }}>
      {children}
    </VesselContext.Provider>
  );
}

export const useVessels = () => useContext(VesselContext);