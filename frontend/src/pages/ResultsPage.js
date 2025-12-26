import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, CheckCircle2, AlertCircle, XCircle, Sparkles, Target } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const ResultsPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
      setSession(response.data);
    } catch (error) {
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionConfig = (decision) => {
    const configs = {
      BUILD: {
        icon: CheckCircle2,
        color: 'text-secondary',
        bgColor: 'bg-secondary/20',
        borderColor: 'border-secondary',
        title: 'BUILD',
        subtitle: 'Strong market validation',
      },
      PIVOT: {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500',
        title: 'PIVOT',
        subtitle: 'Promising but needs adjustment',
      },
      KILL: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/20',
        borderColor: 'border-destructive',
        title: 'KILL',
        subtitle: 'Insufficient market demand',
      },
    };
    return configs[decision] || configs.PIVOT;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.market_fit_score) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 mb-4">No results available yet</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const decisionConfig = getDecisionConfig(session.decision);
  const DecisionIcon = decisionConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              data-testid="back-to-dashboard-btn"
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="text-xl font-heading font-bold text-gradient">IdeaVerdict</div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Validation Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">Your Market Fit Analysis</h1>
          <p className="text-lg text-slate-300">Based on your validation session</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 mb-8 border-2 ${decisionConfig.borderColor}"
          data-testid="decision-card"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl ${decisionConfig.bgColor} flex items-center justify-center`}>
                <DecisionIcon className={`w-8 h-8 ${decisionConfig.color}`} />
              </div>
              <div>
                <h2 className={`text-3xl font-heading font-bold ${decisionConfig.color}`}>
                  {decisionConfig.title}
                </h2>
                <p className="text-slate-300">{decisionConfig.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Market Fit Score</span>
              <span className="text-2xl font-heading font-bold font-mono">
                {session.market_fit_score}/100
              </span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${session.market_fit_score}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-3 rounded-full ${
                  session.decision === 'BUILD'
                    ? 'bg-secondary'
                    : session.decision === 'PIVOT'
                    ? 'bg-yellow-500'
                    : 'bg-destructive'
                }`}
              ></motion.div>
            </div>
          </div>

          {session.reasoning && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-heading font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed">{session.reasoning}</p>
            </div>
          )}
        </motion.div>

        {session.next_actions && session.next_actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-8"
            data-testid="next-actions-card"
          >
            <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Next Steps
            </h3>
            <div className="space-y-4">
              {session.next_actions.map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  data-testid={`action-item-${idx}`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  <p className="text-slate-200 flex-1">{action}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            data-testid="back-dashboard-btn"
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-8 py-6 text-lg"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};