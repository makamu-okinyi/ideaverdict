import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Target, Users, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-heading font-bold text-gradient"
          >
            IdeaVerdict
          </motion.div>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              data-testid="nav-login-btn"
              className="text-foreground hover:text-primary"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              data-testid="nav-get-started-btn"
              className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">AI-Powered Validation</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter mb-6">
                Know if your startup idea will work —{' '}
                <span className="text-gradient">before you build it</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
                An AI co-founder that validates your idea, analyzes real feedback, and tells you whether to build, pivot, or stop.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  data-testid="hero-validate-btn"
                  className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-8 py-6 text-lg group"
                >
                  Validate My Idea
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  data-testid="hero-how-it-works-btn"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-white/20 hover:bg-white/5 text-white font-medium rounded-md px-8 py-6 text-lg"
                >
                  See How It Works
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl glass p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-50"></div>
                <img 
                  src="https://images.unsplash.com/photo-1762279388988-3f8abcc7dca2?crop=entropy&cs=srgb&fm=jpg&q=85" 
                  alt="AI Validation" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">The Problem</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">Why most startups fail before they even start</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'No Market Need', desc: 'Most startups fail because there\'s no real market demand' },
              { title: 'Biased Interviews', desc: 'Customer interviews are awkward and lead to biased feedback' },
              { title: 'Misleading Signals', desc: '"Nice idea!" doesn\'t mean they\'ll pay for it' },
              { title: 'Build First, Learn Later', desc: 'Founders waste months building before validating' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 hover:border-primary/50 transition-colors"
                data-testid={`problem-card-${idx}`}
              >
                <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded-full bg-destructive"></div>
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">The Solution</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">How our AI helps you make the right decision</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: 'AI Asks the Right Questions', desc: 'Our AI knows what matters and what to ask your potential customers' },
              { icon: Users, title: 'Objective Analysis', desc: 'No bias. No emotions. Just data-driven insights from real feedback' },
              { icon: CheckCircle2, title: 'Clear Decision', desc: 'Get a Market Fit Score and a clear Build/Pivot/Kill recommendation' },
              { icon: TrendingUp, title: 'Fast Validation', desc: 'Validation in days, not months. Know if your idea will work quickly' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-8 hover:border-primary/50 transition-all hover:-translate-y-1"
                data-testid={`solution-card-${idx}`}
              >
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-semibold mb-3">{item.title}</h3>
                <p className="text-lg text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">Four simple steps to validate your startup idea</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Describe Your Idea', desc: 'Tell us about the problem you\'re solving' },
              { num: '02', title: 'Chat with AI Validator', desc: 'Answer strategic questions about your market' },
              { num: '03', title: 'Upload Feedback', desc: 'Share customer interviews or survey responses' },
              { num: '04', title: 'Get Your Decision', desc: 'Receive Market Fit Score + Build/Pivot/Kill verdict' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
                data-testid={`step-card-${idx}`}
              >
                <div className="glass rounded-xl p-6 h-full">
                  <div className="font-mono text-6xl font-bold text-primary/20 mb-4">{step.num}</div>
                  <h3 className="text-xl font-heading font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-300">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-primary/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">Why This Is Different</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8 text-left">
              {[
                { label: 'Not surveys', value: 'Decisions' },
                { label: 'Not opinions', value: 'Patterns' },
                { label: 'Not advice', value: 'Evidence' },
              ].map((item, idx) => (
                <div key={idx} className="glass rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">{item.label}</div>
                  <div className="text-2xl font-heading font-bold text-primary">{item.value}</div>
                </div>
              ))}
            </div>
            <p className="text-xl text-slate-300 mt-8 mb-8">Built for early-stage founders who need clarity, not confusion</p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              data-testid="cta-start-validation-btn"
              className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-8 py-6 text-lg"
            >
              Start Free Validation
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">New Feature</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6">
                Validate on the go with{' '}
                <span className="text-gradient">Telegram Bot</span>
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                Connect your validation sessions to Telegram and get AI-powered insights directly in your chat. Perfect for busy founders who want validation on the move.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Instant Notifications', desc: 'Get Market Fit Scores delivered to your Telegram' },
                  { title: 'Chat with AI Anywhere', desc: 'Continue validation sessions from your phone' },
                  { title: 'Quick Decision Updates', desc: 'Receive Build/Pivot/Kill recommendations instantly' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold mb-1">{feature.title}</h3>
                      <p className="text-slate-300">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="mt-8 bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-8 py-6 text-lg"
              >
                Connect Telegram Bot
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-50"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-heading font-bold">IdeaVerdict Bot</div>
                      <div className="text-sm text-slate-400">@ideaverdict_bot</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                      <div className="text-sm text-slate-400 mb-1">User</div>
                      <div className="text-slate-200">/start validation</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">IdeaVerdict Bot</div>
                      <div className="text-slate-200">👋 Hey! Ready to validate your startup idea? Let&apos;s start with the basics. What problem are you trying to solve?</div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                      <div className="text-sm text-slate-400 mb-1">User</div>
                      <div className="text-slate-200">I&apos;m building a tool to help...</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 text-sm text-slate-400 text-center">
                    Real-time AI validation in Telegram
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-8">Don&apos;t Build Blindly</h2>
              <p className="text-xl text-slate-300 mb-8">Join founders making data-driven decisions</p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                data-testid="final-cta-btn"
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-8 py-6 text-lg"
              >
                Start Validating Today
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <div className="text-2xl font-heading font-bold text-gradient mb-4">IdeaVerdict</div>
          <p>© 2025 IdeaVerdict. Validate smarter, build better.</p>
        </div>
      </footer>
    </div>
  );
};