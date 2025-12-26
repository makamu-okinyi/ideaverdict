import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, MessageSquare, TrendingUp, Clock, LogOut, Sparkles, Send } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions`);
      setSessions(response.data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API_URL}/sessions`, {});
      navigate(`/validate/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const getDecisionColor = (decision) => {
    if (!decision) return 'bg-muted';
    if (decision === 'BUILD') return 'bg-secondary';
    if (decision === 'PIVOT') return 'bg-yellow-500';
    if (decision === 'KILL') return 'bg-destructive';
    return 'bg-muted';
  };

  const getDecisionBadge = (decision) => {
    if (!decision) return null;
    const color = getDecisionColor(decision);
    return (
      <span className={`${color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
        {decision}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-heading font-bold text-gradient">IdeaVerdict</div>
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="hidden sm:block text-sm text-slate-400">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-semibold text-primary">{user?.name?.[0] || user?.email?.[0]}</span>
              </div>
              <span>{user?.name || user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-testid="logout-btn"
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2">Your Validations</h1>
            <p className="text-lg text-slate-300">Track and manage your startup idea validations</p>
          </div>
          <Button
            onClick={createNewSession}
            data-testid="create-session-btn"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Validation
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center"
            data-testid="empty-state"
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-bold mb-2">No validations yet</h3>
            <p className="text-slate-300 mb-6">Start validating your first startup idea with AI</p>
            <Button
              onClick={createNewSession}
              data-testid="empty-create-btn"
              className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Validation
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6" data-testid="sessions-list">
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(session.status === 'completed' ? `/results/${session.id}` : `/validate/${session.id}`)}
                className="glass rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
                data-testid={`session-card-${idx}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-heading font-semibold group-hover:text-primary transition-colors">
                        {session.idea_summary || `Validation Session #${sessions.length - idx}`}
                      </h3>
                      {getDecisionBadge(session.decision)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Step {session.current_step} of 5</span>
                      </div>
                      {session.market_fit_score && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Score: {session.market_fit_score}/100</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(session.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {session.status === 'completed' ? 'View Results →' : 'Continue →'}
                  </div>
                </div>
                {session.market_fit_score && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getDecisionColor(session.decision)}`}
                        style={{ width: `${session.market_fit_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};