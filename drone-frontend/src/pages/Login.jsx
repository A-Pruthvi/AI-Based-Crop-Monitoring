import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from '../components/Logo';
import DemoLoginCard, { DEMO_ACCOUNTS } from '../components/DemoLoginCard';
import { Alert } from '../components/ui';

/* ─── Feature list for the hero panel ─── */
const FEATURES = [
  { text: 'Real-time disease detection', icon: 'M9 12l2 2 4-4' },
  { text: 'AI treatment recommendations', icon: 'M9 12l2 2 4-4' },
  { text: 'Detailed health reports', icon: 'M9 12l2 2 4-4' },
  { text: 'Drone flight analytics', icon: 'M9 12l2 2 4-4' },
];

/* ──────────────────────────── Component ──────────────────────────── */
const Login = () => {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');

  /* handlers */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async (account) => {
    setFormData({ email: account.email, password: account.password });
    setFormError('');
    clearError();
    try {
      await login(account.email, account.password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Demo login failed. Make sure the backend is running.');
    }
  };

  /* ─── JSX ─── */
  return (
    <div className="min-h-screen flex font-sans bg-gray-50 relative overflow-hidden">

      {/* ============================== LEFT – Hero Panel ============================== */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(16,185,129,0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(20,184,166,0.3),transparent_60%)]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] animate-grid-fade"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating blur orbs */}
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] bg-teal-400/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/8 rounded-full blur-3xl animate-float-slow" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-14 py-16 text-white animate-slide-in-left">
          {/* Logo */}
          <Logo size="lg" showText variant="light" />

          {/* Tagline */}
          <p className="mt-6 text-lg text-white/75 text-center max-w-md leading-relaxed tracking-wide">
            AI-Powered Drone Crop Health Analysis for Modern Agriculture
          </p>

          {/* Decorative divider */}
          <div className="mt-10 mb-8 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Feature list */}
          <div className="space-y-4 w-full max-w-xs">
            {FEATURES.map((f, i) => (
              <div
                key={f.text}
                className="flex items-center gap-4 group"
                style={{ animationDelay: `${0.3 + i * 0.12}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110 shadow-inner-glow">
                  <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-white/85 tracking-wide group-hover:text-white transition-colors duration-300">
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom stat badges */}
          <div className="mt-14 flex gap-6">
            {[
              { val: '99%', label: 'Accuracy' },
              { val: '2s', label: 'Detection' },
              { val: '50+', label: 'Crop Types' },
            ].map((s) => (
              <div key={s.label} className="text-center group cursor-default">
                <p className="text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors">{s.val}</p>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================== RIGHT – Login Form Card ======================== */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-10 relative">
        {/* Background subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        {/* Soft glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[420px] animate-slide-in-right">
          {/* ─── Mobile Logo ─── */}
          <div className="lg:hidden flex justify-center mb-8 animate-fade-in">
            <Logo size="md" showText variant="dark" />
          </div>

          {/* ─── Glass Card ─── */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-glass-lg border border-white/60 p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-500 text-[15px] leading-relaxed">
                Sign in to your account to continue
              </p>
            </div>

            {/* ─── Demo Login Card ─── */}
            <DemoLoginCard onDemoLogin={handleDemoLogin} loading={loading} />

            {/* ─── Divider ─── */}
            <div className="flex items-center gap-3 mb-6 animate-fade-in-up-delay-2 opacity-0">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">or sign in</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            {/* ─── Error Message ─── */}
            {(formError || error) && (
              <div className="mb-5">
                <Alert 
                  variant="error" 
                  message={formError || error}
                  dismissible
                  onClose={() => {
                    setFormError('');
                    clearError();
                  }}
                  className="animate-shake"
                />
              </div>
            )}

            {/* ─── Form ─── */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="animate-fade-in-up-delay-3 opacity-0">
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-xl
                               text-gray-800 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
                               hover:border-gray-300
                               transition-all duration-300 text-[15px]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="animate-fade-in-up-delay-3 opacity-0">
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-3.5 bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-xl
                               text-gray-800 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
                               hover:border-gray-300
                               transition-all duration-300 text-[15px]"
                  />
                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between animate-fade-in-up-delay-4 opacity-0">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white
                                    peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                                    transition-all duration-200 flex items-center justify-center
                                    group-hover:border-emerald-400">
                      <svg className={`w-3 h-3 text-white transition-all duration-200 ${rememberMe ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="animate-fade-in-up-delay-4 opacity-0 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full relative overflow-hidden
                    bg-gradient-to-r from-emerald-600 to-teal-600
                    hover:from-emerald-700 hover:to-teal-700
                    text-white font-semibold text-[15px] tracking-wide
                    py-3.5 px-6 rounded-xl
                    shadow-lg hover:shadow-xl hover:shadow-emerald-400/20
                    transform hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                    group
                  `}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />

                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-500 text-[15px] animate-fade-in-up-delay-4 opacity-0">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
