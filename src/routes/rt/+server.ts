import type { RequestHandler } from "@sveltejs/kit";
import { RealtimeClient } from '@supabase/realtime-js'
import { createClient } from '@supabase/supabase-js'
import { generateToken } from '$lib/server/generate_token';

export const GET: RequestHandler = async () => {

  const supabase = createClient('https://supabase.4c.cl', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyOTYwMjc4MCwiZXhwIjo0ODg1Mjc2MzgwLCJyb2xlIjoiYW5vbiJ9.M3k7s0oTjXgndhMa6GnmsaJl0sQLTrLDuR9za4XgBeM');
  console.log('Supabase Instance: ', supabase.realtime);
    // Generate token
    const token = generateToken();

    const channel = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
    },
    (payload) => console.log(payload)
  )
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected!')
    }
  
    if (status === 'CHANNEL_ERROR') {
      console.log(`There was an error subscribing to channel: ${err?.message || 'Error no indetiifcado'}`)
    }
  
    if (status === 'TIMED_OUT') {
      console.log('Realtime server did not respond in time.')
    }
  
    if (status === 'CLOSED') {
      console.log('Realtime channel was unexpectedly closed.')
    }
  })
console.log(channel);


return  new Response('OK', {});
};