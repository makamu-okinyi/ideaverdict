import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Loader2, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const STEP_INFO = {
  1: { name: 'Idea Intake', desc: 'Tell us about your startup idea' },
  2: { name: 'Assumption Testing', desc: 'Identify key assumptions' },
  3: { name: 'Customer Discovery', desc: 'Plan customer validation' },
  4: { name: 'Feedback Analysis', desc: 'Analyze customer responses' },
  5: { name: 'Final Analysis', desc: 'Get your verdict' },
};

export const ChatPage = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
      setSession(response.data);
      setCurrentStep(response.data.current_step);
    } catch (error) {
      toast.error('Failed to load session');
      navigate('/dashboard');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions/${sessionId}/messages`);
      setMessages(response.data);
      
      if (response.data.length === 0) {
        const welcomeMsg = {
          role: 'assistant',
          content: "Hey there! I'm your AI validation co-founder. Let's figure out if your startup idea has legs. First question: What problem are you trying to solve?",
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMsg]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat/message`, {
        session_id: sessionId,
        message: input
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentStep(response.data.current_step);
      
      if (response.data.current_step === 4) {
        setTimeout(() => {
          if (window.confirm('Ready to get your final Market Fit Score and decision?')) {
            analyzeSession();
          }
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSession = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/chat/analyze`, { session_id: sessionId });
      toast.success('Analysis complete!');
      navigate(`/results/${sessionId}`);
    } catch (error) {
      toast.error('Failed to analyze session');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
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
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">Step {currentStep}/5</span>
            </div>
            {currentStep === 4 && (
              <Button
                onClick={analyzeSession}
                disabled={loading}
                data-testid="get-verdict-btn"
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md"
              >
                Get Final Verdict
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="p-6">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold text-lg">{STEP_INFO[currentStep]?.name}</h3>
                <span className="text-xs text-slate-400">{currentStep}/5</span>
              </div>
              <p className="text-sm text-slate-300">{STEP_INFO[currentStep]?.desc}</p>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-1.5 rounded-full ${
                      step < currentStep
                        ? 'bg-primary'
                        : step === currentStep
                        ? 'bg-primary/50'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6" data-testid="chat-messages">
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${idx}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'glass'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>AI Co-Founder</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-xl p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-6 pt-0">
            <div className="glass rounded-xl p-4">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  data-testid="chat-input"
                  className="flex-1 bg-white/5 border-white/10 focus:border-primary text-white placeholder:text-slate-500 min-h-[60px] max-h-[200px] resize-none"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  data-testid="send-message-btn"
                  className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-6 self-end"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};