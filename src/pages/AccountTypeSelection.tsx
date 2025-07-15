"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building, User, Mail, Sparkles, BarChart3, Users } from "lucide-react"
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

const navLinks = [
  { name: "Pricing", link: "#pricing" },
]

const AccountTypeSelection = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <LoaderOne />
      </div>
    )
  }

  const stickyScrollContent = [
    {
      title: "Sign up",
      description:
        "Create your account in seconds to get started with NxtMail. Choose between personal or business account types.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white rounded-md">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Quick Signup</p>
          </div>
        </div>
      ),
    },
    {
      title: "Support email setup",
      description:
        "Connect your support or personal email to enable AI-powered workflows. Seamless integration with all major email providers.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white rounded-md">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Email Setup</p>
          </div>
        </div>
      ),
    },
    {
      title: "AI analyzes email and tags",
      description:
        "Our AI scans incoming emails, extracts key information, and applies smart tags automatically for better organization.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white rounded-md">
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">AI Analysis</p>
          </div>
        </div>
      ),
    },
    {
      title: "Create ticket for business",
      description:
        "For business accounts, the system creates a support ticket and routes it to your team automatically.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white rounded-md">
          <div className="text-center">
            <Building className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Business Tickets</p>
          </div>
        </div>
      ),
    },
    {
      title: "Create notification for personal",
      description:
        "For personal accounts, you get a notification with the relevant label and details for easy management.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white rounded-md">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Smart Notifications</p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Navbar at the top, full width, sticky */}
      <Navbar className="sticky top-0 w-full max-w-7xl mx-auto rounded-2xl z-50">
        {/* Desktop Navigation */}
        <NavBody className="bg-transparent">
          <NavbarLogo logoSrc="/logo.png" />
          <NavItems items={navLinks} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="primary" onClick={() => navigate("/register/personal")}>Sign Up</NavbarButton>
            <NavbarButton variant="primary" onClick={() => navigate("/login")}>Login</NavbarButton>
          </div>
        </NavBody>
        {/* Mobile Navigation */}
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
                  navigate("/register")
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

      {/* Background behind everything */}
      <BackgroundLines className="absolute inset-0 z-0 pointer-events-none" />

      {/* Main content above background */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full flex flex-col items-center mt-32 mb-12 gap-4">
          <div className="text-5xl md:text-7xl font-extrabold text-center text-white mb-2">NxtMail</div>
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-3xl md:text-5xl font-bold text-center text-white">
              Build email box zero with <span className="text-blue-500">NxtMail.</span>
            </span>
            <div className="text-lg md:text-2xl text-neutral-300 font-medium text-center max-w-2xl mb-6">
              AI-generated email complaint business in one second.
            </div>
            <button 
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition"
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              See the product
            </button>
          </div>
        </div>

        {/* Move dashboard section before pricing/account type selection */}
        <div className="mt-24">
          <ContainerScroll
            titleComponent={
              <div className="text-3xl md:text-4xl font-bold text-white mb-6">
                See your AI-powered dashboard in action!
              </div>
            }
          >
            <img
              src="/dashboard.png"
              alt="Dashboard Preview"
              className="w-full h-full object-contain rounded-xl shadow-xl"
            />
          </ContainerScroll>
        </div>

        {/* Tagline with pointer highlight effect */}
        <div className="w-full flex flex-col items-center justify-center mt-10 mb-10">
          <PointerHighlight>
            <div className="text-2xl md:text-3xl font-semibold text-white text-center">
              Experience seamless, AI-driven email management.<br />
              <span className="text-blue-400">Your inbox, reimagined.</span>
            </div>
          </PointerHighlight>
        </div>

        {/* Account Type Selection */}
        <div id="pricing" className="max-w-4xl w-full space-y-8 mt-20 flex flex-col items-center justify-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-neutral-300">Select the account type that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Personal Account */}
            <div
                className="bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 border-zinc-800 hover:border-purple-500 transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/register/personal")}
            >
              <div className="absolute top-6 right-6">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <h3 className="text-2xl font-bold text-white">Personal</h3>
                    <p className="text-neutral-400">For influencers & individuals</p>
              </div>
                </div>
                <ul className="text-zinc-200 text-base space-y-3 w-full mb-8">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>AI-powered email categorization</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>Smart inbox management</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>Brand collaborations tracking</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>Fan mail organization</li>
                </ul>
                <div className="text-center w-full">
                  <div className="text-3xl font-bold text-white mb-2">₹199/month</div>
                  <p className="text-neutral-400 mb-6">Perfect for content creators</p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                  Get Started
                </button>
              </div>
            </div>

            {/* Business Account */}
            <div
                className="bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 border-zinc-800 hover:border-blue-500 transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/register/business")}
            >
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <h3 className="text-2xl font-bold text-white">Business</h3>
                    <p className="text-neutral-400">For companies & teams</p>
              </div>
                </div>
                <ul className="text-zinc-200 text-base space-y-3 w-full mb-8">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>AI customer support tickets</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>Team collaboration tools</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>Advanced analytics & reporting</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✔</span>Automated response generation</li>
                </ul>
                <div className="text-center w-full">
                  <div className="text-3xl font-bold text-white mb-2">Custom Pricing</div>
                  <p className="text-neutral-400 mb-6">Scale with your business</p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-neutral-600">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </button>
            </p>
            </div>
          </div>
        </div>
      {/* Footer */}
      <footer className="w-full py-6 bg-black text-center border-t border-zinc-800 mt-8">
        <span className="text-neutral-400 text-sm">NxtMail</span>
      </footer>
    </div>
  )
}

  export default AccountTypeSelection
