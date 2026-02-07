export default function Home() {
  const modules = [
    { name: "Web", detail: "Headers, auth paths, misconfig checks" },
    { name: "API", detail: "Schema drift, auth gaps, rate limits" },
    { name: "Network", detail: "Open ports, TLS hygiene, banner review" },
    { name: "Cloud", detail: "Storage exposure, IAM hints" },
    { name: "IoT", detail: "Firmware version, default creds scan" },
    { name: "Build", detail: "CI secrets, config leakage" },
  ];

  const activity = [
    "Queued scope validation and consent checks",
    "Recon agent mapping public endpoints",
    "Web agent running safe header analysis",
    "API agent comparing schema to live responses",
    "Cloud agent reviewing public storage signals",
  ];

  const findings = [
    {
      title: "Missing HSTS header",
      detail: "TLS is enabled, but HSTS is not enforced.",
      severity: "Medium",
    },
    {
      title: "Public object storage listing",
      detail: "Bucket index visible without auth.",
      severity: "High",
    },
    {
      title: "Verbose API error message",
      detail: "Leaking internal exception names.",
      severity: "Low",
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.22),transparent_65%)] blur-3xl" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-6">
          <nav className="flex items-center justify-between">
            <div className="text-sm font-semibold tracking-[0.2em] text-foreground/70">
              DERIV AEGIS
            </div>
            <div className="flex items-center gap-3 text-xs text-foreground/60">
              <span className="rounded-full border border-foreground/10 bg-white/70 px-3 py-1">
                Demo mode
              </span>
              <span className="rounded-full border border-foreground/10 bg-white/70 px-3 py-1">
                Human approval required
              </span>
            </div>
          </nav>
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-4 py-2 text-xs text-foreground/70">
                Autonomous pentesting with human oversight
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Safe, explainable security scans for any authorized target.
              </h1>
              <p className="max-w-xl text-base leading-7 text-foreground/70">
                Configure a scoped scan, watch specialized agents collaborate in real
                time, and export a clear report. Demo results are simulated and
                non-disruptive.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-foreground/20">
                  Start Safe Scan
                </button>
                <button className="rounded-full border border-foreground/20 bg-white/80 px-6 py-3 text-sm font-semibold text-foreground">
                  View Sample Report
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-xl shadow-black/5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
                Scan configuration
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <label className="text-xs font-semibold text-foreground/60">
                  Target (web, IP, or range)
                  <input
                    className="mt-2 w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm text-foreground shadow-sm"
                    placeholder="https://example.com or 192.0.2.0/24"
                  />
                </label>
                <label className="text-xs font-semibold text-foreground/60">
                  Safe mode
                  <select className="mt-2 w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm text-foreground shadow-sm">
                    <option>Strict non-disruptive</option>
                    <option>Balanced validation</option>
                    <option>Expanded checks</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  {modules.map((module) => (
                    <span
                      key={module.name}
                      className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {module.name}
                    </span>
                  ))}
                </div>
                <label className="flex items-start gap-3 text-xs text-foreground/60">
                  <input type="checkbox" className="mt-0.5" />
                  I confirm I am authorized to test this target and accept the
                  safe-scan policy.
                </label>
                <button className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--glow)]">
                  Queue scan
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Agent activity</h2>
              <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground/60">
                Live
              </span>
            </div>
            <ul className="mt-6 space-y-4 text-sm text-foreground/70">
              {activity.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-dashed border-foreground/15 bg-foreground/5 p-4 text-xs text-foreground/60">
              Demo note: results shown are simulated to demonstrate reporting and
              agent collaboration.
            </div>
          </div>

          <div className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-xl shadow-black/5">
            <h2 className="text-xl font-semibold">Findings summary</h2>
            <div className="mt-6 space-y-4">
              {findings.map((finding) => (
                <div
                  key={finding.title}
                  className="rounded-2xl border border-foreground/10 bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      {finding.title}
                    </div>
                    <span className="rounded-full bg-[var(--warm)]/30 px-3 py-1 text-xs font-semibold text-foreground">
                      {finding.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-foreground/60">
                    {finding.detail}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-2xl border border-foreground/15 bg-foreground px-4 py-3 text-sm font-semibold text-white">
              Export PDF report
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.name}
              className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-lg shadow-black/5"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
                {module.name}
              </div>
              <p className="mt-4 text-sm text-foreground/70">{module.detail}</p>
              <p className="mt-6 text-xs text-foreground/50">
                Safe mode only. No intrusive payloads.
              </p>
            </div>
          ))}
        </section>

        <footer className="flex flex-col gap-4 border-t border-foreground/10 py-6 text-xs text-foreground/50 md:flex-row md:items-center md:justify-between">
          <span>Deriv Aegis MVP - Continuous, authorized security assurance.</span>
          <span>LLM routing: Groq primary, Gemini/HF fallback.</span>
        </footer>
      </div>
    </div>
  );
}
