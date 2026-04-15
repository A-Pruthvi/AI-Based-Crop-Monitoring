import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validatePassword, isValidEmail } from '../utils/helpers';
import Logo from '../components/Logo';

/* ─── Password strength helper ─── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[a-z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: '',          color: ''              },
    { label: 'Very weak', color: 'bg-red-500'    },
    { label: 'Weak',      color: 'bg-orange-400' },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Strong',    color: 'bg-green-400'  },
    { label: 'Very strong', color: 'bg-green-600'},
  ];
  return { score: s, ...map[s] };
};

/* ══════════════════════════════════════════════════════════ */
const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    farmName: '', phone: '', agreeTerms: false,
  });
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [errors,        setErrors]        = useState({});
  const [success,       setSuccess]       = useState(false);

  const strength = getStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim())         e.name = 'Full name is required';
    if (!formData.email.trim())        e.email = 'Email is required';
    else if (!isValidEmail(formData.email)) e.email = 'Enter a valid email address';

    const pw = validatePassword(formData.password);
    if (!formData.password)            e.password = 'Password is required';
    else if (!pw.isValid)              e.password = pw.errors[0];

    if (formData.password !== formData.confirmPassword)
                                       e.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms)          e.agreeTerms = 'You must agree to the terms';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await register({
        name:        formData.name,
        email:       formData.email,
        password:    formData.password,
        farmName:    formData.farmName,
        phoneNumber: formData.phone,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    }
  };

  /* ─── shared input classes ─── */
  const inputCls = (field) =>
    `w-full px-4 py-3.5 bg-white/60 backdrop-blur-sm border rounded-xl
     text-gray-800 placeholder-gray-400 text-[15px] transition-all duration-300
     focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
     hover:border-gray-300
     ${errors[field] ? 'border-red-400 focus:ring-red-400/30' : 'border-gray-200/80'}`;

  return (
    <div className="min-h-screen flex font-sans bg-gray-50 relative overflow-hidden">

      {/* ══ LEFT – hero panel ══ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(16,185,129,0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(20,184,166,0.3),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-14 py-16 text-white">
          <Logo size="lg" showText variant="light" />
          <p className="mt-6 text-lg text-white/75 text-center max-w-md leading-relaxed">
            Join thousands of farmers using AI-powered drone analysis to protect their crops
          </p>
          <div className="mt-10 mb-8 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
            {[
              { val: '10K+', label: 'Farms Protected' },
              { val: '98%',  label: 'Accuracy Rate'   },
              { val: '50+',  label: 'Diseases Detected'},
              { val: '24/7', label: 'Expert Support'   },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 text-center group cursor-default hover:bg-white/15 transition-colors">
                <p className="text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors">{s.val}</p>
                <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT – register form ══ */}
      <div className="w-full lg:w-[48%] flex items-start justify-center px-6 py-10 overflow-y-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[440px] py-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" showText variant="dark" />
          </div>

          {/* Glass card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10">

            {/* Header */}
            <div className="text-center mb-7">
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Create Account</h2>
              <p className="mt-2 text-gray-500 text-[15px]">Fill in your details to get started</p>
            </div>

            {/* Success */}
            {success && (
              <div className="mb-5 p-4 bg-green-50/80 border border-green-200/60 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-green-700 font-medium">Account created! Redirecting to login…</p>
              </div>
            )}

            {/* Submit error */}
            {errors.submit && (
              <div className="mb-5 p-4 bg-red-50/80 border border-red-200/60 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-700 pt-1">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Full Name *</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Enter your full name" autoComplete="name"
                    className={`${inputCls('name')} pl-12`} />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Email Address *</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" autoComplete="email"
                    className={`${inputCls('email')} pl-12`} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">⚠ {errors.email}</p>}
              </div>

              {/* Farm + Phone — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Farm Name</label>
                  <input type="text" name="farmName" value={formData.farmName} onChange={handleChange}
                    placeholder="Optional" className={inputCls('farmName')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="Optional" className={inputCls('phone')} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Password *</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleChange} placeholder="Create a strong password" autoComplete="new-password"
                    className={`${inputCls('password')} pl-12 pr-12`} />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />
                        : <><path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.score <= 2 ? 'text-red-500' : strength.score <= 3 ? 'text-yellow-500' : 'text-green-600'
                    }`}>{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="mt-1.5 text-xs text-red-600">⚠ {errors.password}</p>}
                {!errors.password && <p className="mt-1.5 text-xs text-gray-400">Min 8 chars with uppercase, lowercase and number</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Confirm Password *</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password"
                    className={`${inputCls('confirmPassword')} pl-12 pr-12`} />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      {showConfirm
                        ? <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />
                        : <><path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {/* Match indicator */}
                {formData.confirmPassword && (
                  <p className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
                    formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {formData.password === formData.confirmPassword ? '✓ Passwords match' : '⚠ Passwords do not match'}
                  </p>
                )}
                {errors.confirmPassword && !formData.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">⚠ {errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white
                                    peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                                    transition-all duration-200 flex items-center justify-center
                                    group-hover:border-emerald-400">
                      <svg className={`w-3 h-3 text-white transition-all duration-200 ${formData.agreeTerms ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                        fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="mt-1.5 text-xs text-red-600 ml-8">⚠ {errors.agreeTerms}</p>}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || success}
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sign in link */}
          <p className="mt-7 text-center text-gray-500 text-[15px]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
