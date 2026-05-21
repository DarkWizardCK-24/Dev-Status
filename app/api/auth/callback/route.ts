import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
  const detectedOrigin = forwardedHost ? `https://${forwardedHost}` : new URL(request.url).origin;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '') || detectedOrigin;

  const code = searchParams.get('code');
  const ticket = searchParams.get('ticket');
  const state = searchParams.get('state') ?? '/';

  const cookieStore = await cookies();
  const pending: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          pending.push(...cookiesToSet);
        },
      },
    },
  );

  if (ticket) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data, error } = await admin
      .from('cross_app_handoffs')
      .select('access_token, refresh_token, used, expires_at')
      .eq('id', ticket)
      .single();
    if (!error && data && !data.used && new Date(data.expires_at) > new Date()) {
      await admin.from('cross_app_handoffs').update({ used: true }).eq('id', ticket);
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (!sessionError) {
        const response = NextResponse.redirect(`${origin}${state}`);
        pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        return response;
      }
    }
    return NextResponse.redirect(`${origin}/?error=handoff_failed`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${state}`);
      pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
