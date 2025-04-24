
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    // Extract video ID from Loom URL
    const videoId = url.split('/').pop()
    if (!videoId) {
      throw new Error('Invalid Loom URL')
    }

    const response = await fetch(`https://api.loom.com/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOOM_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Loom metadata: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Loom metadata fetched:', data)

    return new Response(
      JSON.stringify({
        title: data.name,
        description: data.description || '',
        duration: `${Math.round(data.duration / 60)} min`, // Convert seconds to minutes
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error) {
    console.error('Error fetching Loom metadata:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})
