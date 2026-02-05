import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-3xl font-black text-indigo-600 tracking-tighter">SpyLancer</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Sign in</Link>
              <Link href="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-900 transition-all hover:scale-105 shadow-lg shadow-indigo-200">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-32 lg:pt-52 lg:pb-48 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 opacity-20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Version 0.1.0 Released</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
              Spot Winners. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Scale Faster.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
              The ultimate Meta Ads Library tracker. Monitor competitors, detect duplicate scaling, and find your next winning product in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200">
                Start Tracking Free
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-200 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
                Welcome Back
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-white py-32 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Competitor Tracking</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Save any ad from the Meta Library and watch how long it runs. Long-running ads = High profits.</p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Winner Detection</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Our engine automatically flags potential winners based on duplicate scale and ad duration.</p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">SaaS Performance</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Lightning fast dashboard with real-time updates and advanced filtering for pro marketers.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mb-4">SpyLancer © 2024</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm font-semibold">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm font-semibold">Terms</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm font-semibold">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
