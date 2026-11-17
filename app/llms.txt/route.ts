import { llmsTxt } from '@/lib/kg/llms';

// Built once at build time (no request data): the « Statuts officiels » section comes from data/kg.
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
