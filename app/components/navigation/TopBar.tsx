import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '~/services/supabase.client';

export function TopBar() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Fetch user's teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch teams where user is a member
        const { data: teamMembers, error } = await supabase
          .from('team_members')
          .select(
            `
            team_id,
            role,
            teams (
              id,
              slug,
              name,
              description,
              created_at,
              updated_at,
              creator_user_id
            )
          `
          )
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching teams:', error);
          return;
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, [params.teamSlug]);

  const handleSignOut = async () => {
    // For now, just redirect to login
    // In a real app, you'd call a server action to sign out
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4"></div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="gap-2 transition-all duration-200 hover:scale-105"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
