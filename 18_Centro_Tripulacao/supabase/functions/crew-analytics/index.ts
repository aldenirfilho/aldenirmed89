import { createGateway } from '../_shared/gateway.mjs';
const names = ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEYS','SUPABASE_SECRET_KEYS','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','CREW_ALLOWED_ORIGINS','CREW_RATE_LIMIT_SALT'];
const env = Object.fromEntries(names.map(name => [name, Deno.env.get(name) || '']));
Deno.serve(createGateway('analytics', { env }));
