import React from 'react';

const DEMO_ACCOUNTS = [
  {
    label: 'Demo Farmer',
    email: 'demo@farm.com',
    password: 'Demo@123',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 22c4-4 8-7.5 8-12a8 8 0 10-16 0c0 4.5 4 8 8 12z" />
        <path d="M12 12V8M12 12l-3 3M12 12l3 3" opacity=".6" />
      </svg>
    ),
    color: 'emerald',
  },
  {
    label: 'Demo Admin',
    email: 'admin@farm.com',
    password: 'Admin@123',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    ),
    color: 'teal',
  },
];

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200/60',
    hoverBg: 'hover:bg-emerald-100/80',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    ring: 'focus:ring-emerald-300',
    glow: 'hover:shadow-emerald-200/60',
  },
  teal: {
    bg: 'bg-teal-50/60',
    border: 'border-teal-200/60',
    hoverBg: 'hover:bg-teal-100/80',
    text: 'text-teal-700',
    iconBg: 'bg-teal-100',
    ring: 'focus:ring-teal-300',
    glow: 'hover:shadow-teal-200/60',
  },
};

const DemoLoginCard = ({ onDemoLogin, loading }) => (
  <div className="relative mb-7 animate-fade-in-up-delay-2 opacity-0">
    {/* Subtle animated border */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 rounded-2xl opacity-60 blur-[1px]" />

    <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-700 tracking-wide">Quick Demo Access</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        {DEMO_ACCOUNTS.map((acct) => {
          const c = colorMap[acct.color];
          return (
            <button
              key={acct.email}
              type="button"
              disabled={loading}
              onClick={() => onDemoLogin(acct)}
              className={`
                flex-1 group relative flex items-center justify-center gap-2.5
                py-3 px-4 rounded-xl text-sm font-semibold
                ${c.bg} ${c.border} border ${c.text}
                ${c.hoverBg} ${c.glow}
                shadow-sm hover:shadow-md
                transition-all duration-300 ease-out
                hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 ${c.ring} focus:ring-offset-1
                disabled:opacity-40 disabled:pointer-events-none
              `}
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                {acct.icon}
              </span>
              <span className="leading-tight">{acct.label}</span>
            </button>
          );
        })}
      </div>

      {/* Credentials hint */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        <span>demo@farm.com / Demo@123 &nbsp;&bull;&nbsp; admin@farm.com / Admin@123</span>
      </div>
    </div>
  </div>
);

export { DEMO_ACCOUNTS };
export default DemoLoginCard;
