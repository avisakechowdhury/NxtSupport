"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Building,
  User,
  Mail,
  Sparkles,
  BarChart3,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Brain,
  Target,
  Workflow,
  ChevronDown,
  Play,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  Database,
  Lock,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { BackgroundLines } from "../components/ui/background-lines"
import {
  Navbar,
  NavBody,
  NavbarLogo,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../components/ui/resizable-navbar"
import { ContainerScroll } from "../components/ui/container-scroll-animation"
import { LoaderOne } from "../components/ui/loader"
import { TypewriterEffect } from "../components/ui/typewriter-effect"
import { PointerHighlight } from "../components/ui/pointer-highlight"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

// Add global styles
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    font-family: 'Inter', sans-serif;
  }

  body {
    background-color: #000000;
    color: #ffffff;
    overflow-x: hidden;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  ::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }

  /* Custom animations */
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
    }
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  /* Tailwind-like utilities */
  .bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
  }

  .bg-gradient-to-b {
    background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
  }

  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
  }

  .from-blue-500 {
    --tw-gradient-from: #3b82f6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
  }

  .to-purple-500 {
    --tw-gradient-to: #8b5cf6;
  }

  .from-purple-500 {
    --tw-gradient-from: #8b5cf6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0));
  }

  .to-pink-500 {
    --tw-gradient-to: #ec4899;
  }

  .from-green-500 {
    --tw-gradient-from: #10b981;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(16, 185, 129, 0));
  }

  .to-emerald-500 {
    --tw-gradient-to: #10b981;
  }

  .from-orange-500 {
    --tw-gradient-from: #f97316;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(249, 115, 22, 0));
  }

  .to-red-500 {
    --tw-gradient-to: #ef4444;
  }

  .from-violet-500 {
    --tw-gradient-from: #8b5cf6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0));
  }

  .from-yellow-500 {
    --tw-gradient-from: #eab308;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(234, 179, 8, 0));
  }

  .to-orange-500 {
    --tw-gradient-to: #f97316;
  }

  .from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
  }

  .to-purple-600 {
    --tw-gradient-to: #7c3aed;
  }

  .from-blue-900 {
    --tw-gradient-from: #1e3a8a;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(30, 58, 138, 0));
  }

  .to-purple-900 {
    --tw-gradient-to: #581c87;
  }

  .from-green-900 {
    --tw-gradient-from: #14532d;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(20, 83, 45, 0));
  }

  .to-blue-900 {
    --tw-gradient-to: #1e3a8a;
  }

  .from-purple-900 {
    --tw-gradient-from: #581c87;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(88, 28, 135, 0));
  }

  .bg-clip-text {
    -webkit-background-clip: text;
    background-clip: text;
  }

  .text-transparent {
    color: transparent;
  }

  /* Glass morphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Hover effects */
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  /* Text effects */
  .text-glow {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }

  /* Button effects */
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  }

  /* Card effects */
  .card-hover {
    transition: all 0.3s ease;
  }

  .card-hover:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  /* Loading animation */
  .loading-dots {
    display: inline-block;
  }

  .loading-dots::after {
    content: '';
    animation: loading-dots 1.5s infinite;
  }

  @keyframes loading-dots {
    0%, 20% {
      content: '.';
    }
    40% {
      content: '..';
    }
    60%, 100% {
      content: '...';
    }
  }
`

// Add the style component right after the AuxigentLanding function declaration
const AuxigentLanding = () => {
  // Add useEffect to inject styles
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = globalStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const [showSignupModal, setShowSignupModal] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <LoaderOne />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-white text-xl"
        >
          Loading Auxigent...
        </motion.div>
      </div>
    )
  }

  const navLinks = [
    { name: "Features", link: "#features" },
    { name: "How it Works", link: "#how-it-works" },
    { name: "Pricing", link: "#pricing" },
    { name: "Contact", link: "#contact" },
  ]

  const typewriterWords = [
    { text: "Transform" },
    { text: "your" },
    { text: "inbox" },
    { text: "with" },
    { text: "AI", className: "text-blue-500" },
    { text: "intelligence" },
  ]

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze and categorize your emails automatically",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Processing",
      description: "Process thousands of emails in seconds with our optimized AI engine",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols to protect your data",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Routing",
      description: "Automatically route emails to the right team members based on content",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Detailed insights and reports on your email performance and trends",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: <Workflow className="w-8 h-8" />,
      title: "Workflow Automation",
      description: "Create custom workflows to automate repetitive email tasks",
      gradient: "from-red-500 to-pink-500",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Connect Your Email",
      description: "Seamlessly integrate with Gmail, Outlook, or any IMAP/SMTP provider in under 60 seconds",
      icon: <Mail className="w-16 h-16" />,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      number: "02",
      title: "AI Analysis Begins",
      description: "Our AI scans and categorizes emails using advanced natural language processing",
      icon: <Sparkles className="w-16 h-16" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      number: "03",
      title: "Smart Organization",
      description: "Emails are automatically tagged, prioritized, and routed to the right destination",
      icon: <Target className="w-16 h-16" />,
      gradient: "from-orange-500 to-red-500",
    },
    {
      number: "04",
      title: "Take Action",
      description: "Respond faster with AI-generated suggestions and automated workflows",
      icon: <Zap className="w-16 h-16" />,
      gradient: "from-violet-500 to-purple-500",
    },
  ]

  const integrations = [
    { name: "Gmail", logo: "data:image/png;base64,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" },
    { name: "Outlook", logo: null },
    { name: "Slack", logo: null },
    { name: "Trello", logo: null },
    { name: "Notion", logo: null },
    { name: "Zapier", logo: null },
    { name: "HubSpot", logo: null },
    { name: "Salesforce", logo: null },
  ]

  const aiCapabilities = [
    {
      title: "Natural Language Processing",
      description: "Understands context, sentiment, and intent in every email",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      title: "Predictive Analytics",
      description: "Predicts email importance and suggests optimal response times",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Auto-Response Generation",
      description: "Generates contextually appropriate responses for common queries",
      icon: <Settings className="w-6 h-6" />,
    },
    {
      title: "Smart Categorization",
      description: "Automatically sorts emails into custom categories and labels",
      icon: <Database className="w-6 h-6" />,
    },
  ]

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest",
      icon: <Lock className="w-6 h-6" />,
    },
    {
      title: "GDPR Compliant",
      description: "Fully compliant with international data protection regulations",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Zero Data Retention",
      description: "We don't store your email content after processing",
      icon: <Database className="w-6 h-6" />,
    },
    {
      title: "SOC 2 Certified",
      description: "Independently audited security controls and procedures",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const deviceSupport = [
    {
      device: "Desktop",
      icon: <Monitor className="w-12 h-12" />,
      description: "Full-featured web application",
    },
    {
      device: "Mobile",
      icon: <Smartphone className="w-12 h-12" />,
      description: "Native iOS and Android apps",
    },
    {
      device: "Tablet",
      icon: <Tablet className="w-12 h-12" />,
      description: "Optimized tablet experience",
    },
  ]

  const faqs = [
    {
      question: "How does Auxigent's AI email analysis work?",
      answer:
        "Our AI uses advanced natural language processing to understand email content, sender patterns, and context to automatically categorize and prioritize your messages with 99.7% accuracy.",
    },
    {
      question: "Is my email data secure with Auxigent?",
      answer:
        "Absolutely. We use enterprise-grade encryption, never store your email content, and are SOC 2 certified. All processing happens in real-time with immediate deletion after analysis.",
    },
    {
      question: "Can I integrate Auxigent with my existing email provider?",
      answer:
        "Yes! Auxigent works seamlessly with Gmail, Outlook, Yahoo, and any IMAP/SMTP email provider. Setup takes less than 60 seconds with our one-click integration.",
    },
    {
      question: "What's the difference between Personal and Business plans?",
      answer:
        "Personal plans focus on individual productivity with smart categorization and basic automation. Business plans add team collaboration, advanced analytics, custom workflows, and priority support.",
    },
    {
      question: "How accurate is the AI categorization?",
      answer:
        "Our AI achieves 99.7% accuracy in email categorization and continues to learn from your preferences to improve over time. You can also create custom rules and categories.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Background */}
      <BackgroundLines className="absolute inset-0 z-0 pointer-events-none">{<></>}</BackgroundLines>

      {/* Navbar */}
      <Navbar className="sticky top-0 w-full max-w-7xl mx-auto rounded-2xl z-50">
        <NavBody className="bg-transparent backdrop-blur-md">
          <NavbarLogo logoSrc="/logo.png" />
          <NavItems items={navLinks} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="primary" onClick={() => setShowSignupModal(true)}>
              Sign Up
            </NavbarButton>
            <NavbarButton variant="primary" onClick={() => navigate("/login")}>
              Login
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo logoSrc="/logo.png" />
            <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {navLinks.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setShowSignupModal(true)
                }}
                variant="primary"
                className="w-full"
              >
                Sign Up
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 text-lg px-4 py-2">
            🚀 Next-Gen AI Email Intelligence
          </Badge>

          <motion.div
            className="text-7xl md:text-9xl font-extrabold text-center text-white mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Auxigent
          </motion.div>

          <div className="mb-8">
            <TypewriterEffect words={typewriterWords} className="text-2xl md:text-4xl" />
          </div>

          <motion.p
            className="text-xl md:text-2xl text-neutral-300 font-medium text-center max-w-4xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Stop drowning in emails. Let our AI automatically categorize, prioritize, and manage your inbox so you can
            focus on what matters most.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-4 rounded-xl shadow-lg"
              onClick={() => setShowSignupModal(true)}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              className="border-white/20 text-lg px-8 py-4 bg-transparent hover:bg-white/10 rounded-xl"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50M+", label: "Emails Processed Daily", icon: <Mail className="w-8 h-8" /> },
              { number: "100K+", label: "Active Users", icon: <Users className="w-8 h-8" /> },
              { number: "99.9%", label: "Uptime Guarantee", icon: <Clock className="w-8 h-8" /> },
              { number: "5x", label: "Faster Email Processing", icon: <TrendingUp className="w-8 h-8" /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-blue-400 mb-2 flex justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform your email workflow and boost productivity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 h-full overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />
                    <div className="relative z-10">
                      <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Advanced{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Capabilities
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powered by cutting-edge machine learning and natural language processing
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {aiCapabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                  {capability.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{capability.title}</h3>
                  <p className="text-gray-300">{capability.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">How Auxigent Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </motion.div>

          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-12`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex-1 space-y-6">
                  <div className="text-8xl font-bold text-blue-500/20">{step.number}</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{step.title}</h3>
                  <p className="text-xl text-gray-300 leading-relaxed">{step.description}</p>
                </div>
                <div className="flex-1 flex justify-center">
                  <motion.div
                    className={`w-40 h-40 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center text-white shadow-2xl`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.icon}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContainerScroll
            titleComponent={
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Beautiful Dashboard Experience</h2>
                <PointerHighlight>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Manage all your emails from one{" "}
                    <span className="text-blue-400 font-semibold">intuitive interface</span> designed for productivity
                  </p>
                </PointerHighlight>
              </div>
            }
          >
            <img
              src="/dashboard.png"
              alt="Auxigent Dashboard Preview"
              className="w-full h-full object-contain rounded-xl shadow-2xl"
            />
          </ContainerScroll>
        </div>
      </section>

      {/* Security Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-green-900/10 to-blue-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Enterprise-Grade{" "}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Security
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your data security is our top priority. Built with industry-leading security standards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-green-500/20"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Device Support Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Access{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Anywhere
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Seamless experience across all your devices</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {deviceSupport.map((device, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="text-center p-8 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-orange-400 mb-4 flex justify-center">{device.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-2">{device.device}</h3>
                <p className="text-gray-300">{device.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Seamless Integrations</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with your favorite tools and platforms in one click
            </p>
          </motion.div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center p-4 bg-white/5 rounded-xl transition-all duration-300 group relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={integration.logo ? { scale: 1.1 } : {}}
              >
                {integration.logo ? (
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-10 h-10 mb-2 bg-gray-400 rounded opacity-40 blur-sm flex items-center justify-center relative">
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold opacity-80">Coming Soon</span>
                  </div>
                )}
                <span className="text-xs text-gray-300 text-center">{integration.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Start free, upgrade when you're ready to scale</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Personal Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 relative overflow-hidden h-full">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Popular</Badge>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Personal</h3>
                      <p className="text-gray-400">For individuals & creators</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">₹199</span>
                    <span className="text-gray-400">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "AI email categorization",
                      "Smart inbox management",
                      "Brand collaboration tracking",
                      "Fan mail organization",
                      "Basic analytics dashboard",
                      "Mobile app access",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-3"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Business</h3>
                      <p className="text-gray-400">For teams & companies</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">Custom</span>
                    <span className="text-gray-400"> pricing</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Everything in Personal",
                      "Team collaboration tools",
                      "Advanced analytics & reporting",
                      "Custom workflows & automation",
                      "Priority support",
                      "API access",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg py-3"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know about Auxigent</p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to Transform Your Email Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of users who have already revolutionized their email workflow with Auxigent's AI
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-xl shadow-lg"
                onClick={() => setShowSignupModal(true)}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 bg-transparent rounded-xl"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Sign Up Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl flex flex-col items-center relative animate-fade-in border border-blue-100">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowSignupModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight text-center w-full">Choose Account Type</h2>
            <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
              {/* Personal Card */}
              <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-purple-100 hover:shadow-2xl transition group">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-4 text-purple-500 group-hover:scale-110 transition-transform"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2"/></svg>
                <h3 className="text-xl font-bold mb-2 text-purple-700">Personal</h3>
                <p className="text-gray-600 mb-4 text-center">For individuals and creators who want smart, AI-powered email management and productivity tools.</p>
                <button
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow hover:from-purple-600 hover:to-pink-600 transition"
                  onClick={() => {
                    setShowSignupModal(false)
                    navigate("/register/personal")
                  }}
                >
                  Choose Personal
                </button>
              </div>
              {/* Business Card */}
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100 hover:shadow-2xl transition group">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-4 text-blue-500 group-hover:scale-110 transition-transform"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="2"/></svg>
                <h3 className="text-xl font-bold mb-2 text-blue-700">Business</h3>
                <p className="text-gray-600 mb-4 text-center">For teams and companies needing collaboration, analytics, automation, and advanced support.</p>
                <button
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow hover:from-blue-600 hover:to-cyan-600 transition"
                  onClick={() => {
                    setShowSignupModal(false)
                    navigate("/register/business")
                  }}
                >
                  Choose Business
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                  <img src="/logo.png" alt="Auxigent Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-2xl font-bold">Auxigent</span>
              </div>
              <p className="text-gray-400">AI-powered email management for the modern world.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>@ 2025 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuxigentLanding
