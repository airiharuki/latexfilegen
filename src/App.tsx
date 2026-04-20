import React, { useState } from 'react';

export default function App() {
  const [subject, setSubject] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [extraRules, setExtraRules] = useState("");
  const [backendUrl, setBackendUrl] = useState("/api");
  const [files, setFiles] = useState<{name: string, mimeType: string, data: string}[]>([]);
  const [activeTab, setActiveTab] = useState<"code" | "pdf">("pdf");
  const [fullSyllabus, setFullSyllabus] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");

  type StateType = "empty" | "loading" | "result" | "error";
  const [appState, setAppState] = useState<StateType>("empty");
  const [errorText, setErrorText] = useState("");
  const [loadingStep, setLoadingStep] = useState(1);

  const [texSource, setTexSource] = useState("");
  const [pdfBase64, setPdfBase64] = useState("");

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = topicInput.trim().replace(/,$/, '');
      if (val && !topics.includes(val)) {
        setTopics([...topics, val]);
        setTopicInput("");
      }
    } else if (e.key === 'Backspace' && topicInput === '' && topics.length > 0) {
      setTopics(topics.slice(0, -1));
    }
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFiles(prev => [...prev, { name: file.name, mimeType: file.type, data: base64 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const generate = async () => {
    if (!subject) {
      alert("Please enter a subject.");
      return;
    }
    if (!fullSyllabus && topics.length === 0) {
      alert("Please add at least one topic, or select 'Full Grade 12 Syllabus'.");
      return;
    }

    setAppState("loading");
    setLoadingStep(1);

    // Simulate progress steps
    const timers = [
      setTimeout(() => setLoadingStep(2), 6000),
      setTimeout(() => setLoadingStep(3), 12000),
      setTimeout(() => setLoadingStep(4), 18000),
    ];

    try {
      const url = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
      const res = await fetch(`${url}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topics, extra_rules: extraRules, files, full_syllabus: fullSyllabus, model: selectedModel }),
      });

      const data = await res.json();
      
      timers.forEach(clearTimeout);

      if (!res.ok) {
        throw new Error(data.detail || "Server error");
      }

      setTexSource(data.tex_source);
      setPdfBase64(data.pdf_base64 || ""); // Might be empty if no xelatex locally
      setAppState("result");

    } catch (err: any) {
      timers.forEach(clearTimeout);
      setErrorText(err.message);
      setAppState("error");
    }
  };

  const downloadTex = () => {
    const blob = new Blob([texSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.replace(/\s+/g, '_')}_Study_Guide.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!pdfBase64) {
      alert("PDF compilation is currently unavailable in this environment. Please download the .tex file and compile via Overleaf or local TeX Live.");
      return;
    }
    const bytes = atob(pdfBase64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.replace(/\s+/g, '_')}_Study_Guide.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#000000] text-white/90 font-sans relative z-10 w-full overflow-x-hidden selection:bg-white/30">
      {/* VHS Grain Overlay */}
      <div 
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.25] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Liquid Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-blob animation-delay-4000 bg-gradient-to-r from-rose-500 to-orange-500"></div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        
        {/* State: Empty - In Your Face Glass Form */}
        {appState === "empty" && (
          <div className="w-full max-w-3xl flex flex-col gap-10 animate-fade-in py-10">
            
            <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <h1 className="text-[3rem] md:text-[4.5rem] font-black tracking-tighter leading-[0.85] text-white">
                  BAC
                  <br />
                  <span className="text-white/30 mix-blend-overlay drop-shadow-2xl">STUDYFORGE.</span>
                </h1>
              </div>
              <div className="text-white/50 font-medium tracking-tight text-base mb-1.5 max-w-sm text-balance">
                Fluid intelligent generation. Drop your subject. Get a perfect printable standard-compliant LaTeX guide.
              </div>
            </div>

            <div className="w-full bg-transparent border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-[2rem] p-5 md:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.01] pointer-events-none rounded-[2rem]" />
              
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/50 pl-1">Subject</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white text-lg md:text-xl font-medium outline-none placeholder:text-white/20 focus:border-white/40 focus:bg-black/40 transition-all shadow-inner"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Mathematics, Physics..."
                  />
                  
                  <button 
                    onClick={() => setFullSyllabus(!fullSyllabus)}
                    className={`mt-1.5 py-2.5 px-4 rounded-xl border font-medium text-xs transition-all flex items-center justify-center gap-2 ${fullSyllabus ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
                  >
                    {fullSyllabus ? '✨ FULL GRADE 12 CURRICULUM SELECTED' : 'Auto-Generate Full Grade 12 Curriculum'}
                  </button>
                </div>

                <div className={`flex flex-col gap-2.5 transition-all duration-500 ${fullSyllabus ? 'opacity-20 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
                  <label className="text-xs font-bold tracking-widest uppercase text-white/50 pl-1">Specific Topics</label>
                  <div 
                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-2.5 min-h-[64px] flex flex-wrap gap-2 cursor-text focus-within:border-white/40 focus-within:bg-black/40 transition-all shadow-inner"
                    onClick={() => document.getElementById('topic-input')?.focus()}
                  >
                    {topics.map((t, i) => (
                      <div key={i} className="bg-white/10 border border-white/30 rounded-[10px] py-1 px-2.5 text-xs text-white flex items-center gap-2">
                        {t}
                        <button onClick={(e) => { e.stopPropagation(); removeTopic(i); }} className="text-white/40 hover:text-white transition-colors text-base leading-none mt-[-1px]">×</button>
                      </div>
                    ))}
                    <input 
                      id="topic-input"
                      type="text"
                      className="bg-transparent border-none outline-none text-white text-base flex-1 min-w-[150px] p-1.5 placeholder:text-white/20"
                      placeholder={topics.length === 0 ? "Add specific chapters..." : ""}
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleTopicKeyDown}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/50 pl-1">Lecture BS You Ignored (OCR)</label>
                  <div className="relative group w-full bg-black/20 border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-black/40 rounded-2xl p-5 text-center transition-all cursor-pointer shadow-inner overflow-hidden">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="application/pdf,image/*,text/plain"
                    />
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1.5">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                       <span className="font-medium text-sm">Drop unread slides or terrible notes</span>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5">
                          <span className="text-[11px] font-medium text-white/80 truncate max-w-[120px]">{f.name}</span>
                          <button onClick={() => removeFile(i)} className="text-white/40 hover:text-white text-sm leading-none">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/50 pl-1">Engine</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white/90 text-base md:text-lg font-medium outline-none focus:border-white/40 focus:bg-black/40 transition-all shadow-inner appearance-none cursor-pointer"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Heavy Logic/HQ OCR)</option>
                      <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                      <option value="gemma-4">Gemma 4 (Local/Open)</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/50 pl-1">Custom Directives</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/20 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-sm md:text-base font-medium outline-none placeholder:text-white/20 focus:border-white/40 focus:bg-black/40 transition-all shadow-inner"
                      value={extraRules}
                      onChange={(e) => setExtraRules(e.target.value)}
                      placeholder="e.g. Include SI Unit conversions..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 relative z-10">
                 <button 
                  onClick={generate}
                  className="w-full bg-white text-black py-4 rounded-[1.25rem] font-black text-lg tracking-wide uppercase hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all transform shadow-2xl"
                >
                  Construct Guide
                </button>
              </div>

            </div>
          </div>
        )}

        {/* State: Loading */}
        {appState === "loading" && (
          <div className="flex flex-col items-center justify-center animate-fade-in relative z-10 w-full max-w-xl">
             <div className="w-32 h-32 relative flex items-center justify-center mb-10">
                <div className="absolute inset-0 border-t-2 border-white/80 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-l-2 border-white/40 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <div className="absolute inset-4 bg-white/10 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]"></div>
             </div>
             
             <div className="w-full bg-transparent border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl p-6 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.01] pointer-events-none rounded-3xl" />
                <div className="relative z-10 text-xs font-bold tracking-widest uppercase text-white/40 mb-1">System Trace</div>
                <div className={`text-base font-medium tracking-tight transition-all duration-700 ${loadingStep >= 1 ? 'text-white' : 'text-white/20'}`}>
                  {loadingStep > 1 ? '✓' : '→'} Synthesizing curriculum topology
                </div>
                <div className={`text-base font-medium tracking-tight transition-all duration-700 ${loadingStep >= 2 ? 'text-white' : 'text-white/20'}`}>
                  {loadingStep > 2 ? '✓' : loadingStep === 2 ? '→' : '·'} Writing structural LaTeX schemas
                </div>
                <div className={`text-base font-medium tracking-tight transition-all duration-700 ${loadingStep >= 3 ? 'text-white' : 'text-white/20'}`}>
                  {loadingStep > 3 ? '✓' : loadingStep === 3 ? '→' : '·'} Validating strict BAC exam formats
                </div>
                <div className={`text-base font-medium tracking-tight transition-all duration-700 ${loadingStep >= 4 ? 'text-white' : 'text-white/20'}`}>
                  {loadingStep > 4 ? '✓' : loadingStep === 4 ? '→' : '·'} Establishing PDF render pipeline
                </div>
             </div>
          </div>
        )}

        {/* State: Result (Massive Split/Centered View) */}
        {appState === "result" && (
          <div className="w-full max-w-[1400px] h-[90vh] flex flex-col gap-6 animate-fade-in relative z-10">
            
            {/* Nav Header */}
            <div className="w-full bg-transparent border border-white/20 rounded-[1.5rem] p-3 px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.01] pointer-events-none rounded-[1.5rem]" />
              <div className="flex items-center gap-5 relative z-10">
                <button onClick={() => setAppState("empty")} className="text-white/50 hover:text-white transition-colors bg-white/5 px-3 py-1.5 text-sm rounded-lg font-medium tracking-tight border border-white/5">
                  ← Back
                </button>
                <div className="w-px h-5 bg-white/10"></div>
                <h2 className="text-xl font-black tracking-tight text-white/90 uppercase">{subject} <span className="opacity-30">| GUIDE</span></h2>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                {pdfBase64 && (
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/20 shadow-inner">
                    <button 
                      onClick={() => setActiveTab("pdf")} 
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'pdf' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                    >
                      PDF
                    </button>
                    <button 
                      onClick={() => setActiveTab("code")} 
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                    >
                      TeX Code
                    </button>
                  </div>
                )}
                
                <div className="w-px h-5 bg-white/10 mx-1 hidden md:block"></div>
                
                <button 
                  onClick={downloadTex} 
                  className="px-4 py-2 rounded-lg border border-white/20 text-xs text-white/80 hover:bg-white hover:text-black font-bold transition-all shadow-sm hidden md:block"
                >
                  .tex
                </button>
                {pdfBase64 && (
                  <button 
                    onClick={downloadPdf} 
                    className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:scale-[1.03] transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                     Save PDF
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full bg-transparent border border-white/20 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.01] pointer-events-none" />
              <div className="relative z-10 w-full h-full">
                {(!pdfBase64 || activeTab === 'code') ? (
                <div className="w-full h-full overflow-y-auto p-8 custom-scrollbar">
                  <pre className="font-mono text-sm md:text-base text-white/70 leading-relaxed whitespace-pre-wrap break-words selection:bg-white/20 selection:text-white">
                    {texSource}
                  </pre>
                </div>
              ) : (
                <iframe 
                  src={`data:application/pdf;base64,${pdfBase64}#toolbar=0`} 
                  className="w-full h-full opacity-90 mix-blend-lighten filter contrast-125"
                  title="PDF Preview"
                />
              )}
              </div>
            </div>

          </div>
        )}

        {/* State: Error */}
        {appState === "error" && (
          <div className="w-full max-w-2xl bg-transparent border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.25)] rounded-[2rem] p-10 flex flex-col gap-6 animate-fade-in relative z-10 text-center items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.08] to-transparent pointer-events-none" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-3xl font-bold mb-2 border border-red-500/20">
              !
            </div>
            <h2 className="relative z-10 text-3xl font-black tracking-tight text-white">System Error</h2>
            <div className="relative z-10 w-full text-red-400/90 text-sm md:text-base font-medium whitespace-pre-wrap bg-red-950/30 p-6 rounded-2xl border border-red-900/50">
              {errorText}
            </div>
            <button 
              onClick={() => setAppState("empty")} 
              className="relative z-10 mt-4 px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-105 transition-transform"
            >
              Reset Terminal
            </button>
          </div>
        )}

      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        
        body { background: #000; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}
