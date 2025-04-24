
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
    console.log(`Received request to fetch metadata for URL: ${url}`)
    
    // Input validation
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid request: URL is required and must be a string')
    }
    
    // Extract video ID from Loom URL with improved regex that handles various Loom URL formats
    const videoIdMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    
    if (!videoId) {
      console.error(`Failed to extract video ID from URL: ${url}`)
      throw new Error('Invalid Loom URL or could not extract video ID')
    }

    console.log(`Extracted Loom video ID: ${videoId}`)

    const apiKey = Deno.env.get('LOOM_API_KEY')
    if (!apiKey) {
      console.error('LOOM_API_KEY environment variable is not set')
      throw new Error('LOOM_API_KEY environment variable is not set')
    }

    console.log(`Sending request to Loom API for video ID: ${videoId}`)
    
    const response = await fetch(`https://api.loom.com/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Loom API response status: ${response.status}`)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Failed response from Loom API: ${response.status} ${response.statusText}`)
      console.error(`Response body: ${errorBody}`)
      throw new Error(`Failed to fetch Loom metadata: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Loom metadata fetched successfully')
    
    // Return only the required fields
    const metadata = {
      title: data.name,
      description: data.description || '',
      duration: data.duration ? `${Math.round(data.duration / 60)} min` : '0 min', // Convert seconds to minutes
      thumbnailUrl: data.thumbnail_url || null
    }
    
    console.log('Returning processed metadata:', metadata)

    return new Response(
      JSON.stringify(metadata),
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
