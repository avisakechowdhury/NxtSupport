import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { WavyBackground } from '../ui/wavy-background';

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <WavyBackground>
      <div className="min-h-screen flex items-center justify-center bg-transparent px-2 sm:px-4 overflow-x-hidden">
        <div className="shadow-input mx-auto w-full max-w-xs sm:max-w-md rounded-none bg-white p-2 sm:p-4 md:rounded-2xl md:p-8 dark:bg-black max-w-full">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 text-center">Sign in to your account</h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center">
            Enter your email and password to access your dashboard
          </p>
          {error && (
            <div className="mb-6 mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm text-center">
              {error}
            </div>
          )}
          <form className="my-8" onSubmit={handleSubmit}>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-6">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </LabelInputContainer>
            <button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] text-base sm:text-sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in →'}
              <BottomGradient />
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:underline font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </WavyBackground>
  );
};

export default LoginForm;