import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'Admin' | 'Supervisor' | 'User' | 'Básico';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const isDemo = localStorage.getItem('leadtracker_demo_mode') === 'true';
      if (isDemo) {
        const storedEmail = localStorage.getItem('leadtracker_user_email');
        setRole(storedEmail === 'admin@adstrack.com.br' ? 'Admin' : 'User');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setRole(data.role as UserRole);
        }
      }
      setLoading(false);
    };

    fetchRole();
  }, []);

  return { role, loading, isAdmin: role === 'Admin', isSupervisor: role === 'Supervisor' };
}
