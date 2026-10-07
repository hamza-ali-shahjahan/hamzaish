'use client';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('url', 'key');
export default function Login() {
  const go = (email: string) => supabase.auth.signInWithOtp({ email });
  return <button onClick={() => go('a@b.c')}>Sign up</button>;
}
