export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
            Trust is the foundation of commerce.
          </h1>
          <p className="text-xl text-zinc-500 leading-relaxed">
            VyapaarSetu was built to solve the hardest problem in B2B transactions: proving who you are.
          </p>
        </div>

        {/* Mission */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-orange-500 tracking-wider uppercase">Our Mission</h2>
          <h3 className="text-2xl font-bold text-black">Make business identity universally verifiable and reusable.</h3>
          <p className="text-zinc-600 text-lg leading-relaxed">
            Every year, businesses waste millions of hours filling out repetitive onboarding forms and submitting the same compliance documents to different vendors, banks, and marketplaces. Our mission is to reduce that friction to zero.
          </p>
        </div>

        <div className="w-full h-px bg-zinc-200"></div>

        {/* Story */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-orange-500 tracking-wider uppercase">Our Story</h2>
          <p className="text-zinc-600 text-lg leading-relaxed">
            We started with a simple observation: consumer identity is solved (OAuth, Google Login, Apple ID), but business identity is completely broken. When a business tries to interact with another business, they start from zero every single time.
          </p>
          <p className="text-zinc-600 text-lg leading-relaxed">
            We built VyapaarSetu to be the single source of truth for business identity in India, connected directly to government databases (GST, MCA, PAN) for absolute assurance.
          </p>
        </div>

        <div className="w-full h-px bg-zinc-200"></div>

        {/* Vision & Roadmap */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-orange-500 tracking-wider uppercase">The Roadmap</h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-8">
            We are aggressively expanding our verification integrations and enterprise API capabilities.
          </p>
          
          <div className="space-y-6 pl-4 border-l-2 border-zinc-100">
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-black rounded-full border-2 border-white shadow-sm"></div>
              <h4 className="font-bold text-black">Q1 2026: Core Identity</h4>
              <p className="text-zinc-500 text-sm mt-1">Launch of the verified Business Identity card and unified dashboard.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
              <h4 className="font-bold text-black">Q2 2026: Enterprise APIs</h4>
              <p className="text-zinc-500 text-sm mt-1">Marketplaces and banks can verify vendors via API in milliseconds.</p>
            </div>
            <div className="relative opacity-50">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-zinc-300 rounded-full border-2 border-white shadow-sm"></div>
              <h4 className="font-bold text-zinc-600">Q3 2026: Automated Compliance</h4>
              <p className="text-zinc-500 text-sm mt-1">Continuous monitoring of compliance health scores across all connected networks.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
