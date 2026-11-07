/**
 * Single source of truth for every string and dataset on the homepage.
 * Swap BRAND + CASE_STUDIES + CONTACT for the real client data — no component
 * hardcodes copy.
 */

export const BRAND = {
  name: "Synk Innovations",
  /** Short form used in the lockup and page titles. */
  short: "Synk",
  tagline: "Designed for today. Engineered for what comes next."
};

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" }
] as const;

export const HERO = {
  eyebrow: "Digital engineering · Software · Innovation",
  headline: ["We build", "what comes next."],
  lede: "From ambitious ideas to scalable digital products, we design and engineer technology built for what's next.",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "Explore our work", href: "#work" },
  disciplines: ["Web", "Mobile", "SaaS", "AI", "Cloud", "Enterprise"]
};

export const COMPLEXITY = {
  first: "Every great product starts with complexity.",
  second: "Our job is to make it simple."
};

export const PHILOSOPHY = {
  eyebrow: "The problem",
  headline: [
    "Technology is rarely the problem.",
    "The way it's engineered is."
  ],
  body: [
    "Most teams don't fail because they picked the wrong framework. They fail because systems were bolted together faster than they were understood — and every new feature costs more than the last.",
    "We start by mapping the whole system. Then we rebuild it so the next decade of changes stays cheap."
  ],
  /** Rendered as the chaotic network that reorganises on scroll. */
  symptoms: [
    "Disconnected systems",
    "Legacy technology",
    "Poor user experience",
    "Scalability ceilings",
    "Slow release cycles",
    "Fragmented data",
    "Unreliable infrastructure"
  ],
  resolvedLabel: "One coherent system"
};

export const SERVICES = [
  {
    id: "web",
    number: "01",
    title: "Web Applications",
    summary:
      "Complex platforms, SaaS products, marketplaces and enterprise applications.",
    detail:
      "Interface systems that stay fast at scale — design systems, real-time data, role-based workflows and the state management that holds it together.",
    capabilities: ["Design systems", "Real-time UI", "SSR & edge", "Workflows"]
  },
  {
    id: "mobile",
    number: "02",
    title: "Mobile Applications",
    summary:
      "Native-quality iOS and Android experiences designed around real user behaviour.",
    detail:
      "Offline-first data, native module bridges, biometric auth and release pipelines that ship to both stores from a single codebase.",
    capabilities: ["React Native", "Offline sync", "Native modules", "CI/CD"]
  },
  {
    id: "saas",
    number: "03",
    title: "SaaS Platforms",
    summary:
      "Scalable multi-tenant products, dashboards, workflows and subscription systems.",
    detail:
      "Tenancy models, billing and entitlements, usage metering and admin tooling — the unglamorous layers that decide whether a product can grow.",
    capabilities: ["Multi-tenancy", "Billing", "Analytics", "Admin tooling"]
  },
  {
    id: "ai",
    number: "04",
    title: "AI & Intelligent Systems",
    summary:
      "AI-powered products, automation, intelligent workflows and data-driven systems.",
    detail:
      "Retrieval pipelines, evaluation harnesses and human-in-the-loop review. We ship AI features with measurable output quality, not demos.",
    capabilities: ["LLM pipelines", "RAG", "Evaluation", "Automation"]
  },
  {
    id: "backend",
    number: "05",
    title: "Backend & APIs",
    summary:
      "Secure APIs, databases, microservices, integrations and high-performance infrastructure.",
    detail:
      "Typed contracts, schema evolution, queueing and idempotency. Systems that behave predictably when traffic and data both multiply.",
    capabilities: ["API design", "Data modelling", "Queues", "Integrations"]
  },
  {
    id: "cloud",
    number: "06",
    title: "Cloud & DevOps",
    summary:
      "Cloud architecture, deployment pipelines, monitoring, scalability and infrastructure.",
    detail:
      "Infrastructure as code, zero-downtime deploys, observability and cost control — so shipping on Friday stops being a gamble.",
    capabilities: ["IaC", "Observability", "Autoscaling", "Cost control"]
  }
] as const;

export type Service = (typeof SERVICES)[number];

/** x/y are normalised 0–1 constellation coordinates. */
export const TECHNOLOGIES = [
  {
    name: "React",
    note: "Interface layer",
    x: 0.16,
    y: 0.3,
    group: "frontend"
  },
  {
    name: "Next.js",
    note: "App framework",
    x: 0.31,
    y: 0.14,
    group: "frontend"
  },
  {
    name: "TypeScript",
    note: "Type safety end to end",
    x: 0.3,
    y: 0.5,
    group: "frontend"
  },
  {
    name: "Three.js",
    note: "Real-time 3D",
    x: 0.13,
    y: 0.68,
    group: "frontend"
  },
  {
    name: "React Native",
    note: "Mobile runtime",
    x: 0.44,
    y: 0.78,
    group: "frontend"
  },
  {
    name: "Node.js",
    note: "Service runtime",
    x: 0.47,
    y: 0.36,
    group: "backend"
  },
  {
    name: "Python",
    note: "Data & ML services",
    x: 0.58,
    y: 0.62,
    group: "backend"
  },
  {
    name: "PostgreSQL",
    note: "Relational core",
    x: 0.63,
    y: 0.24,
    group: "data"
  },
  {
    name: "MongoDB",
    note: "Document storage",
    x: 0.74,
    y: 0.48,
    group: "data"
  },
  {
    name: "Docker",
    note: "Reproducible builds",
    x: 0.83,
    y: 0.72,
    group: "infra"
  },
  {
    name: "AWS",
    note: "Cloud infrastructure",
    x: 0.86,
    y: 0.3,
    group: "infra"
  },
  {
    name: "LLM APIs",
    note: "Applied intelligence",
    x: 0.68,
    y: 0.85,
    group: "ai"
  }
] as const;

/** Which nodes are wired to which, by index. Keeps the graph deliberate. */
export const TECH_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 5],
  [0, 4],
  [4, 5],
  [5, 6],
  [5, 7],
  [6, 8],
  [6, 11],
  [7, 8],
  [7, 10],
  [8, 9],
  [9, 10],
  [10, 5],
  [11, 6]
];

/**
 * Real work. Problem, approach and result are descriptive on purpose; there
 * are no numbers here because none have been measured. Links are the live
 * product.
 */
export const CASE_STUDIES = [
  {
    number: "01",
    sector: "Travel",
    title: "Flexi Agency",
    summary:
      "Flights, hotels, buses, cars, transfers and property across the DRC, booked from one platform on the web and in a native app.",
    problem:
      "One agency sells nine kinds of travel and property across the Congo, in French, priced in USD, CDF or EUR and mostly paid in cash. It needed one place for customers to book and one place for staff to run it.",
    solution:
      "One catalogue API behind a public site, a native iOS and Android app and a staff admin. Guests check out by phone number, prices are set and converted server-side, cash at the Gombe office is the default with online payment behind a switch, and the admin runs inventory, orders and content with role-based access.",
    result:
      "Every vertical books through the same order flow, and the team runs the whole operation from one panel.",
    stack: ["Next.js", "React Native", "Node.js", "MongoDB"],
    image: "/work/flexi-agency.webp",
    links: [
      { label: "Website", href: "https://flexiagency.net" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.flexiagency.app"
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/in/app/flexi-agency/id6807432056"
      }
    ]
  },
  {
    number: "02",
    sector: "Coaching",
    title: "Coachiatry",
    summary:
      "An accountability coaching platform for people with ADHD and executive dysfunction: from stuck to started, from doing to done.",
    problem:
      "A coaching practice built on follow-through. Every session produces tasks, and the people it serves are exactly the people who lose track of tasks spread across meetings, chat and documents.",
    solution:
      "A shared workspace for coaches and clients with real-time chat, tasks, transcripts and documents; a browser extension that captures Google Meet sessions as they happen and turns them into action items with AI; and a native app so the list is always in a pocket.",
    result:
      "A session ends with its action items already assigned, and coach and client look at the same list on the web, in the extension and on the phone.",
    stack: ["Next.js", "React Native", "Node.js", "LLM APIs"],
    image: "/work/coachiatry.webp",
    links: [
      { label: "Web app", href: "https://app.coachiatry.com" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.coachiatryapp"
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/in/app/coachiatry/id6757945564"
      }
    ]
  },
  {
    number: "03",
    sector: "Photography",
    title: "SD Photography",
    summary:
      "A wedding photography studio's portfolio and enquiry site, built to be run by the studio itself.",
    problem:
      "Couples find the studio on Instagram and compare photographers on a phone, months before the date. The work had to speak for itself, with no prices online and no developer on call for updates.",
    solution:
      "A phone-first site where the photographs lead: story albums with a full-screen viewer, every image served at three sizes with a blurred placeholder, and a plain admin where the studio publishes albums and edits every line of text. Enquiries open WhatsApp pre-filled and are saved too.",
    result:
      "New stories go live within a minute of the studio publishing them, and every photograph arrives sized for the phone it is seen on.",
    stack: ["Next.js", "Firebase", "Cloudinary"],
    image: "/work/sd-photography.webp",
    links: [{ label: "Website", href: "https://sdphotography.synkinnovations.in" }]
  },
  {
    number: "04",
    sector: "Print",
    title: "Yuvi Designs",
    summary:
      "A one-page site for a flex and digital print shop in Jind, Haryana, in business since 2018.",
    problem:
      "A local print shop with a full catalogue of flex, vinyl, canvas and paper work, and nowhere online that said what it prints, which flex to ask for, or when it is open.",
    solution:
      "One hand-built page, no framework: the services, an animated look at four-ink printing, a plain guide to flex materials, and the address, hours and a tap-to-call button.",
    result:
      "It opens on any phone with nothing to maintain, and a customer arrives knowing what to ask for.",
    stack: ["HTML", "CSS"],
    image: "/work/yuvi-designs.webp",
    links: [{ label: "Website", href: "https://yuvi-designs.vercel.app" }]
  }
] as const;

export const PROCESS = [
  {
    number: "01",
    title: "Discover",
    body: "Understand the business, the users and the constraints that actually bind.",
    output: "Systems map · Risk register"
  },
  {
    number: "02",
    title: "Define",
    body: "Turn ideas into product requirements and a technical architecture.",
    output: "Architecture · Scope"
  },
  {
    number: "03",
    title: "Design",
    body: "Create intuitive experiences and the design system underneath them.",
    output: "Prototypes · Design system"
  },
  {
    number: "04",
    title: "Engineer",
    body: "Build the frontend, backend and infrastructure as one system.",
    output: "Tested builds · CI/CD"
  },
  {
    number: "05",
    title: "Launch",
    body: "Deploy, instrument and optimise against real traffic.",
    output: "Monitoring · Runbooks"
  },
  {
    number: "06",
    title: "Scale",
    body: "Continuously improve, extend and evolve the product with you.",
    output: "Roadmap · Iteration"
  }
] as const;

export const ARCHITECTURE = {
  eyebrow: "System architecture",
  headline: [
    "Great software isn't a collection of features.",
    "It's an ecosystem that works together."
  ],
  body: "We design every layer with the ones above and below it in mind — interface, service, data, infrastructure.",
  layers: [
    { name: "Interface", note: "Web · Mobile · Design system" },
    { name: "Application", note: "Domain logic · Workflows" },
    { name: "API", note: "Typed contracts · Gateways" },
    { name: "Intelligence", note: "Models · Retrieval · Evaluation" },
    { name: "Data", note: "Relational · Document · Events" },
    { name: "Infrastructure", note: "Cloud · Pipelines · Observability" }
  ]
};

/**
 * Engineering principles, deliberately qualitative. No invented statistics —
 * add real numbers here only when they can be substantiated.
 */
export const PRINCIPLES = [
  {
    label: "Resilient",
    body: "Failure paths designed before the happy path ships. Retries, timeouts and idempotency are requirements, not patches."
  },
  {
    label: "Scalable",
    body: "Horizontal by default. The architecture that serves your first thousand users serves the next million."
  },
  {
    label: "Secure",
    body: "Least privilege, encrypted transport and storage, dependency and secret scanning wired into the pipeline."
  },
  {
    label: "Performant",
    body: "Budgets set at design time and enforced in CI — for bundle size, query cost and response latency alike."
  },
  {
    label: "Observable",
    body: "Structured logs, traces and alerts from day one. If we can't see it, we can't operate it."
  },
  {
    label: "Maintainable",
    body: "Typed end to end, documented at the boundaries, and handed over so your team can own it."
  }
] as const;

export const TRUST = {
  eyebrow: "Where we work",
  headline: "Industries we've engineered for.",
  industries: [
    "Startups",
    "Enterprise",
    "Fintech",
    "Travel",
    "Healthcare",
    "Commerce",
    "Education",
    "Logistics"
  ]
};

export const ABOUT = {
  eyebrow: "Who we are",
  headline: ["We're engineers, designers", "and problem solvers."],
  body: [
    "We work at the intersection of business, design and technology — and we don't simply execute specifications.",
    "We challenge assumptions, simplify complexity and build systems designed to evolve. The result is software your team can keep changing long after we've handed it over."
  ],
  equation: [
    { term: "Strategy", note: "Decide what's worth building" },
    { term: "Design", note: "Make it obvious to use" },
    { term: "Engineering", note: "Make it hold up" }
  ],
  outcome: { term: "Product", note: "Something people actually use" }
};

export const CONTACT = {
  eyebrow: "Let's build it",
  headline: "Have something worth building?",
  lede: "Let's turn the idea into something real.",
  primaryCta: {
    label: "Start a conversation",
    href: "mailto:anas@synkinnovations.in"
  },
  secondaryCta: { label: "View our capabilities", href: "#services" },
  responseNote: "We reply to every enquiry within two business days."
};

export const FOOTER = {
  columns: [
    {
      title: "Company",
      links: [
        { label: "Work", href: "#work" },
        { label: "Services", href: "#services" },
        { label: "Process", href: "#process" },
        { label: "About", href: "#about" }
      ]
    },
    {
      title: "Services",
      links: [
        { label: "Web applications", href: "#services" },
        { label: "Mobile applications", href: "#services" },
        { label: "SaaS platforms", href: "#services" },
        { label: "AI & intelligent systems", href: "#services" },
        { label: "Backend & APIs", href: "#services" },
        { label: "Cloud & DevOps", href: "#services" }
      ]
    },
    {
      title: "Elsewhere",
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/aannaassalam" },
        { label: "GitHub", href: "https://github.com/aannaassalam" },
        {
          label: "anas@synkinnovations.in",
          href: "mailto:anas@synkinnovations.in"
        }
      ]
    }
  ],
  location: "Remote-first · Working across UTC-5 to UTC+5:30"
};
