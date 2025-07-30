import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "./utils";

export const useSession = (): { session: Session | null; pending: boolean } => {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setPending(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  return { session, pending };
};
