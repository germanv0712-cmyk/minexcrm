// Login + Forgot password + 2FA
const PageLogin = () => {
  const { t, lang, setLang } = useT();
  const { setAuth } = Layout.useApp();
  const { go } = Layout.useRouter();
  const [step, setStep] = React.useState('login'); // login | forgot | 2fa
  const [showPwd, setShowPwd] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [loginErr, setLoginErr] = React.useState('');
  const [loginLoading, setLoginLoading] = React.useState(false);

  const DEMO_MODE_TRIGGERS = ['Failed to fetch', 'NetworkError', 'fetch', 'DATABASE_URL', '503', 'Service Unavailable'];

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);
    try {
      // Attempt real backend auth
      await window.MxAuth.login(email, pwd);
      // Full reload so store.jsx re-initializes with JWT present (apiMode = true)
      window.location.hash = '#/dashboard';
      window.location.reload();
    } catch (err) {
      const msg = err.message || '';
      // Demo mode: activate when backend is unreachable or DB not yet configured
      const isDemo = DEMO_MODE_TRIGGERS.some((t) => msg.includes(t));
      if (isDemo) {
        setStep('2fa');
      } else {
        setLoginErr(msg || 'Credenciales incorrectas');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const submitVerify = async (e) => {
    e.preventDefault();
    // In production: verify OTP with backend. For now, allow demo bypass.
    setAuth((a) => ({ ...a, signed: true }));
    go('/dashboard');
  };

  // Top-left mining scene
  const Scene = () => (
    <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A2540"/>
          <stop offset="60%" stopColor="#1E3A8A"/>
          <stop offset="100%" stopColor="#2563EB"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F172A"/>
          <stop offset="100%" stopColor="#0A2540"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#sky)"/>
      {/* Sun glow */}
      <ellipse cx="600" cy="320" rx="320" ry="260" fill="url(#sun)"/>
      <circle cx="600" cy="320" r="80" fill="#F59E0B" opacity="0.7"/>
      {/* Distant mountains */}
      <path d="M0 520 L120 440 L220 480 L340 400 L460 460 L580 410 L700 470 L800 430 L800 1000 L0 1000 Z" fill="#1E3A8A" opacity="0.55"/>
      {/* Open-pit terraces */}
      <g fill="url(#ridge)">
        <path d="M0 640 L120 600 L260 640 L420 580 L580 640 L740 600 L800 640 L800 1000 L0 1000 Z"/>
      </g>
      <g stroke="#94A3B8" strokeWidth="1.5" opacity="0.25" fill="none">
        <path d="M40 720 L760 720"/>
        <path d="M80 780 L720 780"/>
        <path d="M120 840 L680 840"/>
        <path d="M170 900 L630 900"/>
      </g>
      {/* Drill rig silhouettes */}
      <g fill="#0F172A" opacity="0.92">
        <g transform="translate(160 540)">
          <rect x="-3" y="-90" width="6" height="90"/>
          <polygon points="-3,-90 3,-90 0,-130"/>
          <rect x="-25" y="0" width="50" height="22" rx="2"/>
          <circle cx="-15" cy="26" r="5"/>
          <circle cx="15" cy="26" r="5"/>
        </g>
        <g transform="translate(530 580)">
          <rect x="-2" y="-70" width="4" height="70"/>
          <polygon points="-2,-70 2,-70 0,-100"/>
          <rect x="-18" y="0" width="36" height="16" rx="2"/>
          <circle cx="-10" cy="20" r="4"/>
          <circle cx="10" cy="20" r="4"/>
        </g>
      </g>
      {/* Stars */}
      <g fill="#FFFFFF" opacity="0.6">
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={(i * 73) % 800} cy={(i * 47) % 480} r={(i % 4 === 0) ? 1.4 : 0.8}/>
        ))}
      </g>
      {/* Drone */}
      <g transform="translate(280 280)" fill="#FFFFFF">
        <rect x="-10" y="-2" width="20" height="4" rx="1"/>
        <circle cx="-12" cy="0" r="3" opacity="0.8"/>
        <circle cx="12" cy="0" r="3" opacity="0.8"/>
      </g>
      <g stroke="#0EA5E9" strokeWidth="1" opacity="0.3">
        <line x1="280" y1="285" x2="160" y2="540"/>
        <line x1="280" y1="285" x2="530" y2="580"/>
      </g>
    </svg>
  );

  const LangPicker = () => (
    <div className="absolute top-5 right-6 z-10 flex items-center gap-1 bg-white/90 dark:bg-neutral-900 rounded-full px-1 py-1 shadow-sm border border-neutral-200">
      {['es', 'en'].map((k) => (
        <button key={k} onClick={() => setLang(k)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${lang === k ? 'bg-primary-500 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}>
          <span className="mr-1">{k === 'es' ? '🇨🇴' : '🇺🇸'}</span>{k.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white fade-in">
      {/* Left visual */}
      <div className="hidden lg:flex relative w-3/5 bg-primary-900 text-white overflow-hidden">
        <Scene/>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-primary-900/40 to-transparent"/>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <UI.Logo dark size={36}/>
          <div className="max-w-lg">
            <div className="text-xs uppercase tracking-widest text-primary-300 mb-3 font-mono">SaaS · Minería · Colombia</div>
            <h1 className="font-display font-bold text-4xl xl:text-5xl leading-tight text-white">
              {lang === 'es' ? 'La plataforma operativa y comercial para contratistas mineros.' : 'The operational and commercial platform for mining contractors.'}
            </h1>
            <p className="mt-4 text-primary-300 text-base max-w-md">
              {lang === 'es' ? 'Pipeline comercial + perforaciones + núcleos + HSE + flota en un único sistema multi-empresa y multi-proyecto.' : 'Sales pipeline + drilling + cores + HSE + fleet in one multi-tenant, multi-project platform.'}
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2"><Icon.Drill size={16} className="text-accent-500"/> 87 pozos activos</div>
              <div className="flex items-center gap-2"><Icon.ShieldAlert size={16} className="text-success-500"/> 312 días sin accidentes</div>
              <div className="flex items-center gap-2"><Icon.HardHat size={16} className="text-warning-500"/> 6 mineras conectadas</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-primary-300">
            <span>© 2026 MinexCRM · Bogotá, Colombia</span>
            <span className="font-mono">v2.4.0 · Enterprise</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-white">
        <LangPicker/>
        <div className="lg:hidden absolute top-5 left-6"><UI.Logo size={28}/></div>

        {step === 'login' ? (
          <form onSubmit={submitLogin} className="w-full max-w-sm">
            <h2 className="font-display font-bold text-2xl text-neutral-900">{t('welcome')}</h2>
            <p className="text-sm text-neutral-600 mt-1">{t('signin_subtitle')}</p>

            <div className="mt-8 space-y-4">
              {loginErr && (
                <div className="bg-danger-50 border border-danger-500 text-danger-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                  <Icon.AlertCircle size={15}/> {loginErr}
                </div>
              )}
              <UI.Field label={t('email')} required>
                <UI.Input icon={Icon.Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="nombre@empresa.com"/>
              </UI.Field>
              <UI.Field label={t('password')} required>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400"><Icon.Lock size={16}/></span>
                  <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} className="mx-input pl-9 pr-10" autoComplete="current-password"/>
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700">
                    {showPwd ? <Icon.EyeOff size={16}/> : <Icon.Eye size={16}/>}
                  </button>
                </div>
              </UI.Field>
              <div className="flex items-center justify-between">
                <UI.Checkbox label={t('remember_me')} checked={remember} onChange={setRemember}/>
                <button type="button" onClick={() => setStep('forgot')} className="text-sm text-primary-700 hover:text-primary-500 font-medium">{t('forgot_password')}</button>
              </div>
              <UI.Button kind="primary" size="lg" className="w-full" type="submit" iconRight={loginLoading ? null : Icon.ArrowRight} disabled={loginLoading}>{loginLoading ? 'Autenticando…' : t('signin')}</UI.Button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-neutral-200"/>
                <span className="text-[11px] uppercase tracking-wide text-neutral-400">{t('or')}</span>
                <div className="flex-1 h-px bg-neutral-200"/>
              </div>
              <UI.Button kind="secondary" size="lg" className="w-full" type="button"
                icon={() => <span className="text-[14px] font-bold text-[#0078D4]">⌘</span>}>{t('cont_ms')}</UI.Button>
              <UI.Button kind="secondary" size="lg" className="w-full" type="button"
                icon={() => <span className="text-[14px] font-bold text-[#EA4335]">G</span>}>{t('cont_google')}</UI.Button>
            </div>

            <div className="mt-10 text-center text-xs text-neutral-500">
              {t('demo_footer')} <a href="#" className="text-primary-700 font-medium hover:text-primary-500">Solicitar demo →</a>
            </div>
          </form>
        ) : step === 'forgot' ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep('login'); }} className="w-full max-w-sm">
            <button type="button" onClick={() => setStep('login')} className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 inline-flex items-center gap-1"><Icon.ChevronLeft size={14}/> {t('signin')}</button>
            <h2 className="font-display font-bold text-2xl text-neutral-900">¿Olvidaste tu contraseña?</h2>
            <p className="text-sm text-neutral-600 mt-1">Te enviaremos un enlace de recuperación a tu correo corporativo.</p>
            <div className="mt-6 space-y-4">
              <UI.Field label={t('email')} required>
                <UI.Input icon={Icon.Mail} type="email" placeholder="nombre@empresa.com" defaultValue={email}/>
              </UI.Field>
              <UI.Button kind="primary" size="lg" className="w-full" type="submit" iconRight={Icon.Send}>Enviar enlace</UI.Button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitVerify} className="w-full max-w-sm">
            <button type="button" onClick={() => setStep('login')} className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 inline-flex items-center gap-1"><Icon.ChevronLeft size={14}/> {t('signin')}</button>
            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4"><Icon.Lock size={20}/></div>
            <h2 className="font-display font-bold text-2xl text-neutral-900">Verificación en dos pasos</h2>
            <p className="text-sm text-neutral-600 mt-1">Ingresa el código de 6 dígitos enviado a <span className="font-medium text-neutral-900">{email}</span>.</p>
            <TwoFAInputs/>
            <UI.Button kind="primary" size="lg" className="w-full mt-6" type="submit" iconRight={Icon.ArrowRight}>Verificar y entrar</UI.Button>
            <button type="button" className="mt-3 text-sm text-primary-700 hover:text-primary-500 font-medium w-full text-center">Reenviar código</button>
          </form>
        )}
      </div>
    </div>
  );
};

const TwoFAInputs = () => {
  const [vals, setVals] = React.useState(['1','7','3','2','5','4']);
  const refs = React.useRef([]);
  return (
    <div className="mt-6 grid grid-cols-6 gap-2">
      {vals.map((v, i) => (
        <input key={i} type="text" inputMode="numeric" maxLength={1} value={v}
          ref={(el) => refs.current[i] = el}
          onChange={(e) => {
            const nv = e.target.value.replace(/\D/g, '').slice(0, 1);
            const next = [...vals]; next[i] = nv; setVals(next);
            if (nv && i < 5) refs.current[i + 1] && refs.current[i + 1].focus();
          }}
          className="mx-input h-14 text-center text-lg font-display font-bold"/>
      ))}
    </div>
  );
};

window.PageLogin = PageLogin;
