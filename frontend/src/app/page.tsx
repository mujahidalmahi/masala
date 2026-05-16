'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Zap, Trophy, Users, BookOpen, Target,
  BarChart3, Clock, ChevronRight, Star, Sparkles,
  Shield, Layers, Gamepad2, ScrollText, ArrowRight,
  GraduationCap, Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                StudySprint
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How it Works</Link>
              <Link href="#about" className="text-sm text-white/60 hover:text-white transition-colors">About</Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden sm:inline">
                <Button variant="ghost" className="text-white/70 hover:text-white">Sign In</Button>
              </Link>
              <Link href="/signup" className="hidden sm:inline">
                <Button variant="gradient" size="sm">Get Started Free</Button>
              </Link>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-[#0a0a0f] border-white/5 p-6">
                  <div className="flex flex-col gap-6 mt-8">
                    <Link
                      href="#features"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white/60 hover:text-white transition-colors text-lg"
                    >
                      Features
                    </Link>
                    <Link
                      href="#how-it-works"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white/60 hover:text-white transition-colors text-lg"
                    >
                      How it Works
                    </Link>
                    <Link
                      href="#about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white/60 hover:text-white transition-colors text-lg"
                    >
                      About
                    </Link>
                    <div className="border-t border-white/5 pt-6 space-y-3">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full text-white/70 hover:text-white">Sign In</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="gradient" className="w-full">Get Started Free</Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-[#0a0a0f]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">The Complete Student OS</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Your Learning
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Operating System
                </span>
              </h1>
              <p className="text-base sm:text-lg text-white/50 mb-6 sm:mb-8 max-w-xl leading-relaxed">
                StudySprint OS tracks what you study, generates practice, builds routines,
                predicts performance, and turns learning into a progress-based game.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="gradient" className="gap-2 w-full sm:w-auto">
                    Start Your Journey <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-white/10 text-white/70 w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
                {[
                  { icon: Users, label: '10K+ Active' },
                  { icon: Trophy, label: '50K+ Streaks' },
                  { icon: Brain, label: 'AI Powered' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-white/40 text-sm">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-96 h-96 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-white/5 p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-2xl" />
                  {[
                    { icon: Brain, label: 'AI Tutor', x: '10%', y: '10%', delay: 0.5 },
                    { icon: Trophy, label: 'Level Up', x: '60%', y: '5%', delay: 0.7 },
                    { icon: Target, label: 'Smart Quiz', x: '5%', y: '55%', delay: 0.9 },
                    { icon: Flame, label: 'Streaks', x: '65%', y: '60%', delay: 1.1 },
                    { icon: BarChart3, label: 'Analytics', x: '30%', y: '75%', delay: 1.3 },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: item.delay, type: 'spring' }}
                      className="absolute flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e]/90 border border-white/5 backdrop-blur-sm"
                      style={{ left: item.x, top: item.y }}
                    >
                      <item.icon className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-white/70">{item.label}</span>
                    </motion.div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-48 h-48 rounded-full border border-blue-500/10"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      className="absolute w-32 h-32 rounded-full border border-violet-500/10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Everything You Need to
              </span>{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Master Learning
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Four layers working together: track, study, test, review, improve, and level up.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Smart Study Tracker',
                desc: 'Track subjects, chapters, topics, duration, and mastery progress. Your learning dashboard in one place.',
                color: 'from-blue-500/20 to-blue-600/10',
              },
              {
                icon: GraduationCap,
                title: 'Curriculum-Aware',
                desc: 'Understands your board, grade, and syllabus. Suggests content based on your actual curriculum.',
                color: 'from-violet-500/20 to-violet-600/10',
              },
              {
                icon: ScrollText,
                title: 'Textbook Organizer',
                desc: 'Upload PDFs, notes, screenshots. Extracts chapters, topics, and key concepts into a structured map.',
                color: 'from-emerald-500/20 to-emerald-600/10',
              },
              {
                icon: Target,
                title: 'Question Builder',
                desc: 'Generate MCQs, short/long questions, board-style exams, and topic-wise quizzes automatically.',
                color: 'from-rose-500/20 to-rose-600/10',
              },
              {
                icon: Brain,
                title: 'AI Tutor',
                desc: 'Click any topic for explanations, examples, summaries, or instant quiz. Answers from your content only.',
                color: 'from-amber-500/20 to-amber-600/10',
              },
              {
                icon: Gamepad2,
                title: 'RPG Study Mode',
                desc: 'Earn XP, level up, unlock badges, master skill trees. Each subject becomes a progression game.',
                color: 'from-cyan-500/20 to-cyan-600/10',
              },
              {
                icon: Users,
                title: 'Focus Rooms',
                desc: 'Join live study rooms, see active users, compete on leaderboards, build accountability.',
                color: 'from-indigo-500/20 to-indigo-600/10',
              },
              {
                icon: Clock,
                title: 'Smart Routines',
                desc: 'Auto-builds daily plans based on exams, weak topics, available time, and mastery level.',
                color: 'from-orange-500/20 to-orange-600/10',
              },
              {
                icon: BarChart3,
                title: 'Progress Prediction',
                desc: 'Predicts quiz scores, topic mastery, exam readiness, and GPA trends from your study data.',
                color: 'from-pink-500/20 to-pink-600/10',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-6 rounded-xl bg-[#111118] border border-white/5 hover:border-blue-500/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Students', icon: Users },
              { value: '50K+', label: 'Study Streaks', icon: Flame },
              { value: '100K+', label: 'Quizzes Taken', icon: Target },
              { value: '1M+', label: 'Hours Tracked', icon: Clock },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                The Learning Loop
              </span>
            </h2>
            <p className="text-white/40 text-lg">Track → Study → Test → Review → Improve → Level Up</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Track & Study',
                desc: 'Log what you study, start focus sessions, and build your daily routine.',
                items: ['Select curriculum & subject', 'Start focus timer', 'Log study sessions', 'Build smart routines'],
              },
              {
                step: '02',
                title: 'Test & Practice',
                desc: 'Generate quizzes, take exams, and identify weak areas automatically.',
                items: ['Auto-generated quizzes', 'Board-style questions', 'Topic-wise tests', 'Weak area detection'],
              },
              {
                step: '03',
                title: 'Level Up & Improve',
                desc: 'Earn XP, climb leaderboards, and track your predicted performance.',
                items: ['XP & streak rewards', 'RPG skill trees', 'Performance prediction', 'Printable reports'],
              },
            ].map((phase, i) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative p-8 rounded-xl bg-[#111118] border border-white/5"
              >
                <div className="text-5xl font-bold bg-gradient-to-br from-blue-500/20 to-violet-500/20 bg-clip-text text-transparent mb-4">
                  {phase.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{phase.title}</h3>
                <p className="text-sm text-white/40 mb-6">{phase.desc}</p>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Ready to Transform Your
              </span>{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Study Life?
              </span>
            </h2>
            <p className="text-lg text-white/40 mb-10 max-w-2xl mx-auto">
              Join thousands of students who turned studying from a chore into a progress-based adventure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/signup">
                <Button size="lg" variant="gradient" className="gap-2 animate-pulse-glow w-full sm:w-auto">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/10 text-white/70 w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-white/60 text-sm">StudySprint OS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <span>Built for students who want to win</span>
              <Link href="/admin/login" className="hover:text-white/50 transition-colors">Admin</Link>
              <span>© 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
