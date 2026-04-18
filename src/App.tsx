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
        body: JSON.stringify({ subject, topics, extra_rules: extraRules, files, full_syllabus: fullSyllabus }),
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
    <div className="flex flex-col min-h-[100dvh] bg-[#0D1B2A] text-[#E8EDF2] font-outfit relative z-10 w-full overflow-hidden">
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(46,134,193,0.12) 1px, transparent 1px)', 
          backgroundSize: '28px 28px'
        }}
      />
      <div 
        className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(23,165,137,0.06) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <header className="relative z-10 px-10 py-8 pb-6 border-b border-[#2E86C1]/20 flex items-center gap-4 shrink-0">
        <div className="w-[38px] h-[38px] rounded-lg tracking-[-2px] flex items-center justify-center font-serif text-[1.2rem] text-white shrink-0 shadow-[0_0_20px_rgba(23,165,137,0.3)] bg-gradient-to-br from-[#2E86C1] to-[#17A589]">
          ∫
        </div>
        <div>
          <h1 className="font-serif text-[1.4rem] text-white tracking-tight leading-[1] mt-0 -mt-[1px]">StudyForge</h1>
          <p className="text-[0.75rem] text-[#BDC3C7] font-light mt-0.5">BAC Study Guide Generator — Powered by Gemini</p>
        </div>
      </header>

      <main className="relative z-10 flex-1 grid md:grid-cols-[420px_1fr] flex-col overflow-hidden max-h-[calc(100vh-95px)]">
        {/* Left Panel */}
        <div className="p-8 border-r border-[#2E86C1]/20 overflow-y-auto flex flex-col gap-6 custom-scrollbar max-h-[40vh] md:max-h-none shrink-0 bg-[#0D1B2A]/50 backdrop-blur-sm">
          
          <div className="flex flex-col gap-2">
            <label className="text-[0.72rem] font-semibold tracking-wider uppercase text-[#BDC3C7]">Backend URL</label>
            <input 
              type="text" 
              className="bg-[#162230] border border-[#2E86C1]/20 rounded-lg py-2.5 px-3.5 text-[#E8EDF2] text-[0.9rem] outline-none focus:border-[#17A589] focus:ring-[3px] focus:ring-[#17A589]/10 transition-all w-full"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="/api"
            />
          </div>

          <div className="h-px bg-[#2E86C1]/20 shrink-0"></div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.72rem] font-semibold tracking-wider uppercase text-[#BDC3C7]">Subject</label>
            <input 
              type="text" 
              className="bg-[#162230] border border-[#2E86C1]/20 rounded-lg py-2.5 px-3.5 text-[#E8EDF2] text-[0.9rem] outline-none focus:border-[#17A589] focus:ring-[3px] focus:ring-[#17A589]/10 transition-all w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics, Chemistry, Mathematics"
            />
            <button 
              onClick={() => setFullSyllabus(!fullSyllabus)}
              className={`mt-1 flex items-center justify-center gap-2 text-[0.75rem] font-medium px-3 py-2 rounded-lg border transition-all w-full ${fullSyllabus ? 'bg-[#17A589]/20 border-[#17A589]/50 text-[#17A589] shadow-[0_0_15px_rgba(23,165,137,0.15)]' : 'bg-[#162230] border-[#2E86C1]/20 text-[#BDC3C7]/70 hover:border-[#2E86C1]/50 hover:text-[#BDC3C7]'}`}
            >
              {fullSyllabus ? '✓ Covering Full Grade 12 Curriculum' : '◯ Auto-generate Full Grade 12 Curriculum'}
            </button>
          </div>

          <div className={`flex flex-col gap-2 transition-opacity duration-300 ${fullSyllabus ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="text-[0.72rem] font-semibold tracking-wider uppercase text-[#BDC3C7]">
              Topics <span className="text-[0.72rem] opacity-70 normal-case tracking-normal">— press Enter to add</span>
            </label>
            <div 
              className="bg-[#162230] border border-[#2E86C1]/20 rounded-lg p-2 min-h-[48px] flex flex-wrap gap-1.5 cursor-text focus-within:border-[#17A589] focus-within:ring-[3px] focus-within:ring-[#17A589]/10 transition-all"
              onClick={() => document.getElementById('topic-input')?.focus()}
            >
                {topics.map((t, i) => (
                  <div 
                    key={i} 
                    className="bg-[#17A589]/15 border border-[#17A589]/30 rounded-[5px] py-1 px-2.5 text-[0.8rem] text-[#17A589] flex items-center gap-1.5"
                  >
                    {t}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeTopic(i); }}
                      className="text-[#17A589] opacity-60 hover:opacity-100 transition-opacity p-0"
                    >×</button>
                  </div>
                ))}
              <input 
                id="topic-input"
                type="text"
                className="bg-transparent border-none outline-none text-[#E8EDF2] text-[0.9rem] flex-1 min-w-[120px] p-1"
                placeholder={topics.length === 0 ? "Add a topic..." : ""}
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.72rem] font-semibold tracking-wider uppercase text-[#BDC3C7]">
              Extra Rules <span className="text-[0.72rem] opacity-70 normal-case tracking-normal">— optional</span>
            </label>
            <textarea 
              className="bg-[#162230] border border-[#2E86C1]/20 rounded-lg py-2.5 px-3.5 text-[#E8EDF2] text-[0.9rem] outline-none focus:border-[#17A589] focus:ring-[3px] focus:ring-[#17A589]/10 transition-all w-full resize-y min-h-[80px]"
              value={extraRules}
              onChange={(e) => setExtraRules(e.target.value)}
              placeholder="e.g. Use g = 10 m/s², include SI units table..."
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.72rem] font-semibold tracking-wider uppercase text-[#BDC3C7]">
              Square 1 File Upload <span className="text-[0.72rem] opacity-70 normal-case tracking-normal">— optional OCR</span>
            </label>
            <div className="bg-[#162230] border border-[#2E86C1]/20 rounded-lg p-3 text-center border-dashed relative">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="application/pdf,image/*,text/plain"
              />
              <p className="text-[0.8rem] text-[#BDC3C7]/70">Drag & drop or click to upload slides, textbooks</p>
            </div>
            {files.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#17A589]/10 border border-[#17A589]/20 rounded px-2.5 py-1.5">
                    <span className="text-[0.8rem] text-[#17A589] truncate max-w-[200px]">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-[#17A589]/70 hover:text-[#17A589] ml-2 text-[0.9rem] font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-[#2E86C1]/20 shrink-0"></div>

          <button 
            disabled={appState === "loading"}
            onClick={generate}
            className="w-full bg-gradient-to-br from-[#2E86C1] to-[#17A589] text-white py-3.5 rounded-xl font-semibold text-[0.95rem] shadow-[0_4px_20px_rgba(23,165,137,0.25)] hover:shadow-[0_6px_28px_rgba(23,165,137,0.35)] hover:-translate-y-[1px] disabled:opacity-45 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2 shrink-0"
          >
            ✦ Generate Study Guide
          </button>

          <div className="pt-2 text-center text-[#BDC3C7]/40 text-[0.75rem]">
            Gemini generates LaTeX → Ready for XeLaTeX
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col overflow-hidden relative bg-[#091018]/50">
          
            {appState === "empty" && (
              <div 
                key="empty"
                className="flex-1 flex flex-col items-center justify-center p-12 text-center transition-opacity"
              >
                <div className="text-[3.5rem] opacity-30 mb-4">📄</div>
                <h2 className="font-serif text-[1.5rem] text-[#BDC3C7] mb-2">Nothing yet</h2>
                <p className="text-[#BDC3C7]/60 text-[0.85rem] max-w-[300px]">Fill in a subject and topics, then hit Generate. Your LaTeX code will appear here.</p>
              </div>
            )}

            {appState === "loading" && (
              <div 
                key="loading"
                className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0D1B2A]/80 backdrop-blur-sm transition-opacity"
              >
                <div className="flex flex-col items-center gap-8">
                  <div className="relative w-16 h-16 shadow-[0_0_30px_rgba(23,165,137,0.2)] rounded-full">
                    <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#17A589] animate-spin"></span>
                    <span className="absolute inset-[8px] rounded-full border-2 border-transparent border-t-[#2E86C1] animate-[spin_1s_linear_infinite_reverse]"></span>
                    <span className="absolute inset-[16px] rounded-full border-2 border-transparent border-t-[#D4AC0D] animate-[spin_0.7s_linear_infinite]"></span>
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <div className={`flex items-center gap-2 text-[0.85rem] transition-colors duration-500 ${loadingStep === 1 ? 'text-[#17A589]' : loadingStep > 1 ? 'text-[#BDC3C7]/60' : 'text-[#BDC3C7]/30'}`}>
                      {loadingStep > 1 ? '✓' : loadingStep === 1 ? '→' : '○'} Calling Gemini to generate LaTeX
                    </div>
                    <div className={`flex items-center gap-2 text-[0.85rem] transition-colors duration-500 ${loadingStep === 2 ? 'text-[#17A589]' : loadingStep > 2 ? 'text-[#BDC3C7]/60' : 'text-[#BDC3C7]/30'}`}>
                      {loadingStep > 2 ? '✓' : loadingStep === 2 ? '→' : '○'} Writing complex schemas...
                    </div>
                    <div className={`flex items-center gap-2 text-[0.85rem] transition-colors duration-500 ${loadingStep === 3 ? 'text-[#17A589]' : loadingStep > 3 ? 'text-[#BDC3C7]/60' : 'text-[#BDC3C7]/30'}`}>
                      {loadingStep > 3 ? '✓' : loadingStep === 3 ? '→' : '○'} Validating formatting...
                    </div>
                    <div className={`flex items-center gap-2 text-[0.85rem] transition-colors duration-500 ${loadingStep === 4 ? 'text-[#17A589]' : loadingStep > 4 ? 'text-[#BDC3C7]/60' : 'text-[#BDC3C7]/30'}`}>
                      {loadingStep > 4 ? '✓' : loadingStep === 4 ? '→' : '○'} Delivering payload
                    </div>
                  </div>
                </div>
              </div>
            )}

            {appState === "result" && (
              <div 
                key="result"
                className="flex-1 flex flex-col items-stretch justify-start overflow-hidden h-full transition-opacity"
              >
                <div className="py-5 px-8 border-b border-[#2E86C1]/20 flex items-center justify-between bg-[#162230] shrink-0">
                  <div>
                    <h3 className="font-serif text-[1.2rem] text-white tracking-tight">{subject} Study Guide</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-[#17A589]/10 border border-[#17A589]/25 text-[#17A589]">
                        ✓ Generated via Gemini API
                      </p>
                      {pdfBase64 && (
                        <div className="flex bg-[#0D1B2A] rounded-md overflow-hidden border border-[#2E86C1]/30">
                          <button onClick={() => setActiveTab("pdf")} className={`px-3 py-1 text-[0.75rem] font-medium transition-colors ${activeTab === 'pdf' ? 'bg-[#2E86C1]/20 text-[#2E86C1]' : 'text-[#BDC3C7]/70 hover:bg-[#2E86C1]/10'}`}>PDF View</button>
                          <button onClick={() => setActiveTab("code")} className={`px-3 py-1 text-[0.75rem] font-medium transition-colors ${activeTab === 'code' ? 'bg-[#2E86C1]/20 text-[#2E86C1]' : 'text-[#BDC3C7]/70 hover:bg-[#2E86C1]/10'}`}>Code</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={downloadTex} className="px-4 py-2 rounded-lg font-semibold text-[0.82rem] transition-all border border-[#2E86C1]/20 text-[#BDC3C7] hover:border-[#2E86C1] hover:text-[#2E86C1] hover:bg-[#2E86C1]/5 shadow-sm">
                      ⬇ Download .tex
                    </button>
                    {pdfBase64 && (
                      <button onClick={downloadPdf} className="px-4 py-2 rounded-lg font-semibold text-[0.82rem] transition-all bg-gradient-to-br from-[#2E86C1] to-[#17A589] text-white shadow-[0_2px_12px_rgba(23,165,137,0.2)] hover:opacity-90 hover:-translate-y-px">
                        ⬇ PDF
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#091018] relative">
                  {!pdfBase64 || activeTab === 'code' ? (
                    <pre className="font-mono text-[0.78rem] text-[#8BB8D4] leading-relaxed whitespace-pre-wrap break-words selection:bg-[#2E86C1]/30 selection:text-white">
                      {texSource}
                    </pre>
                  ) : (
                    <iframe 
                      src={`data:application/pdf;base64,${pdfBase64}`} 
                      className="w-full h-full rounded border border-[#2E86C1]/20"
                      title="PDF Preview"
                    />
                  )}
                </div>
              </div>
            )}

            {appState === "error" && (
              <div 
                key="error"
                className="flex-1 flex flex-col items-center justify-center p-12 text-center transition-opacity"
              >
                <div className="bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-xl p-6 md:p-8 text-left max-w-lg w-full shadow-[0_0_30px_rgba(192,57,43,0.1)]">
                  <h3 className="text-[#C0392B] text-[1.1rem] font-semibold mb-2 flex items-center gap-2">⚠ Generation Failed</h3>
                  <p className="text-[#BDC3C7] text-[0.85rem] mb-4 opacity-80">The server encountered an error parsing your request.</p>
                  <pre className="font-mono text-[0.72rem] text-[#BDC3C7]/90 whitespace-pre-wrap bg-black/30 p-4 rounded-lg border border-black/50 overflow-x-auto">
                    {errorText}
                  </pre>
                  <button onClick={() => setAppState("empty")} className="mt-6 px-5 py-2.5 bg-transparent border border-[#C0392B]/50 text-[#C0392B] rounded-lg text-[0.85rem] font-medium hover:bg-[#C0392B]/10 hover:border-[#C0392B] transition-colors shadow-sm">
                    ← Try Again
                  </button>
                </div>
              </div>
            )}

        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'DM Serif Display', serif; }
        .font-mono { font-family: 'DM Mono', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(46,134,193,0.25); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(46,134,193,0.4); }
      `}} />
    </div>
  );
}
