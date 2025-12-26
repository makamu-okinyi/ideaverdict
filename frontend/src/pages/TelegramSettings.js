import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Link as LinkIcon, Unlink, Sparkles } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const TelegramSettings = () => {
  const [botToken, setBotToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [botInfo, setBotInfo] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/telegram/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const handleConnect = async () => {
    if (!botToken.trim()) {
      toast.error('Please enter a bot token');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/telegram/setup`, {
        bot_token: botToken
      });
      setBotInfo(response.data);
      toast.success('Telegram bot connected successfully!');
      await fetchStatus();
      setBotToken('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to connect bot');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Telegram bot?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/telegram/disconnect`);
      toast.success('Telegram bot disconnected');
      setStatus({ connected: false });
      setBotInfo(null);
    } catch (error) {
      toast.error('Failed to disconnect bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Telegram Integration</span>
          </div>
          <h1 className="text-4xl font-heading font-bold mb-2">Connect Telegram Bot</h1>
          <p className="text-lg text-slate-300">
            Receive validation insights and Market Fit Scores directly in Telegram
          </p>
        </motion.div>

        {status?.connected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 mb-8 border-2 border-secondary"
            data-testid="connected-status"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary">Connected</h2>
                  <p className="text-slate-300">Your Telegram bot is active</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={loading}
                data-testid="disconnect-btn"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>

            {botInfo && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-heading font-semibold mb-4">Next Steps:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p className="text-slate-200">
                      Open Telegram and search for <span className="font-mono text-primary">@{botInfo.bot_username}</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p className="text-slate-200">
                      Send <span className="font-mono text-primary">/start</span> to begin receiving validation updates
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p className="text-slate-200">
                      Your Market Fit Scores and decisions will be sent directly to your chat
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8"
            data-testid="connect-form"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold mb-2">Setup Your Bot</h2>
              <p className="text-slate-300">
                Follow these steps to create and connect your Telegram bot
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-heading font-semibold mb-4">How to get your Bot Token:</h3>
                <div className="space-y-3">
                  {[
                    'Open Telegram and search for @BotFather',
                    'Send /newbot and follow the instructions',
                    'Choose a name for your bot (e.g., "My IdeaVerdict Bot")',
                    'Choose a username ending in "bot" (e.g., "myidea_validator_bot")',
                    'Copy the bot token provided by BotFather',
                    'Paste it below to connect',
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <p className="text-slate-200">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bot-token" className="text-sm font-medium text-slate-200 mb-2 block">
                    Telegram Bot Token
                  </Label>
                  <Input
                    id="bot-token"
                    type="text"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    data-testid="bot-token-input"
                    className="bg-white/5 border-white/10 focus:border-primary text-white placeholder:text-slate-500 font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Your token is securely stored and only used to send you validation updates
                  </p>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={loading || !botToken.trim()}
                  data-testid="connect-btn"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-md py-6 text-base"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  {loading ? 'Connecting...' : 'Connect Telegram Bot'}
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">ℹ️</span>
                </div>
                <p>
                  Your bot token is stored securely and encrypted. We never share your data with third parties.
                  You can disconnect anytime.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-heading font-semibold mb-4">What you'll receive:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Session Updates', desc: 'Progress notifications as you validate' },
              { title: 'Market Fit Score', desc: 'Instant score delivery (0-100)' },
              { title: 'Decision Alerts', desc: 'Build/Pivot/Kill recommendations' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <div className="text-sm font-heading font-semibold mb-1">{item.title}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
