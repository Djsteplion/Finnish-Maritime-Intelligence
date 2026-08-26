
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import VesselLocation from './VesselLocation'

async function getVesselsLocation() {
  const res = await fetch('https://meri.digitraffic.fi/api/ais/v1/locations');
  
  if (!res.ok) {
    console.error("API Error:", res.status);
    return []; // Return empty array on error
  }
  
  const json = await res.json();
  
  console.log("SERVER DATA RAW:", json);

  // Safeguard: Check if json exists and has .locations
  return json?.features || []; 
}

export default async function PostsPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['ais-locations'],
    queryFn: getVesselsLocation,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VesselLocation />
    </HydrationBoundary>
  )
}