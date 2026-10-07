'use client';
import { createClient } from '@supabase/supabase-js';
import { isUnderAge } from '@/lib/legal';
const supabase = createClient('url', 'key');
export default function Login() {
  const go = (email: string, birthYear: number) => {
    if (isUnderAge(birthYear)) return;
    return supabase.auth.signInWithOtp({ email, options: { data: { age_confirmed: true } } });
  };
  return <button onClick={() => go('a@b.c', 1990)}>Sign up</button>;
}
