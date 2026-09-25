// Copy for the static visuals. Every figure here is taken from the portfolio's
// content files (sahilbnsll/Portfolio → src/data/{home,career,projects}.json and
// src/components/CICDPipeline.tsx) — update those first, then mirror them here.

export const HERO = {
  greeting: 'hi, sahil here.',
  role: 'DevOps & Cloud Infrastructure Engineer',
  status: 'Open to work · DevOps / Platform / SRE',
  stack: ['AWS', 'Terraform', 'Kubernetes', 'GitHub Actions', 'Prometheus'], // home "$ current-stack"
};

export const LINKS = [
  { id: 'portfolio', label: 'Portfolio', primary: true },
  { id: 'resume', label: 'Resume' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'showproof', label: 'ShowProof' },
  { id: 'call', label: 'Book a call' },
  { id: 'email', label: 'Email' },
];

// One tile per reliability dimension; sourced from career.json + projects.json.
export const IMPACT = [
  { id: 'cost', eyebrow: 'COST', value: '~$40k', caption: ['AWS spend cut', 'per year (−40%)'] },
  { id: 'uptime', eyebrow: 'UPTIME', value: '99.99%', caption: ['SFTP platform', '500+ merchants'] },
  { id: 'recovery', eyebrow: 'RECOVERY', value: '−40%', caption: ['MTTR after the', 'Terraform migration'] },
  { id: 'detection', eyebrow: 'DETECTION', value: '−60%', caption: ['MTTD with', 'Prometheus/Grafana'] },
  { id: 'security', eyebrow: 'SECURITY', value: '95%', caption: ['critical CVEs', 'blocked in CI'] },
];

export const PROJECTS = [
  {
    id: 'lumacv',
    name: 'LumaCV',
    eyebrow: 'AI · OPEN SOURCE',
    summary:
      'Open-source resume platform with anti-hallucination fact checks, deterministic ATS scoring and native Typst PDFs.',
    metric: '30 min → <60 s per tailored resume',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Typst'],
  },
  {
    id: 'superpack',
    name: 'Claude Superpack',
    eyebrow: 'AI AGENTS · NPM',
    summary:
      'Risk-tiered engineering OS for Claude Code: 9 skills, 15 on-demand domain references, deterministic verification scripts.',
    metric: '−73% always-on context (2,753 → 742 tokens)',
    tags: ['Node.js', 'npm', 'CLI', 'OIDC publish'],
  },
  {
    id: 'zabesync',
    name: 'LinkedIn Content Pipeline',
    eyebrow: 'AUTOMATION · ZABESYNC',
    summary:
      'Discord-driven n8n pipeline: AI research and drafts, Supabase-backed dedup, one-click publish to LinkedIn.',
    metric: 'hours → seconds per content cycle',
    tags: ['n8n', 'AWS EC2', 'Docker', 'Supabase'],
  },
  {
    id: 'naukri',
    name: 'Naukri Automation Bot',
    eyebrow: 'AUTOMATION · PYTHON',
    summary:
      'Headless bot on Render’s free tier that refreshes a Naukri resume daily, reusing sessions to skip OTP prompts.',
    metric: '100% hands-off profile refresh',
    tags: ['Python', 'Selenium', 'Docker', 'Render'],
  },
];

// Portfolio → education.json + certifications.json. Same card anatomy as PROJECTS.
export const EDUCATION = [
  {
    id: 'degree',
    name: 'B.Tech, CS & Engineering',
    eyebrow: 'EDUCATION · 2019 – 2023',
    summary:
      'University of Petroleum and Energy Studies. DevOps & Cloud specialization; published research on microservices and cloud-native security.',
    metric: 'CGPA 7.86 / 10',
    tags: ['DevOps & Cloud', 'AWS', 'Kubernetes', 'Infra automation'],
  },
  {
    id: 'certifications',
    name: 'DevOps on AWS Specialization',
    eyebrow: 'CERTIFICATIONS · 3',
    summary:
      'Amazon Web Services, Feb 2024. Also: Postman API Fundamentals Student Expert (Jul 2024) and Agile with Atlassian Jira (Jan 2024).',
    metric: 'credential LF56PF27EJDY',
    tags: ['AWS', 'Postman', 'Atlassian'],
  },
];

