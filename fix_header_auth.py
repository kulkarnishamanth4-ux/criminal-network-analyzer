import codecs
with codecs.open('frontend/src/components/Header.jsx', 'r', 'utf-8') as f:
    content = f.read()

# Update signature
content = content.replace("export default function Header({ onUploadClick, onExperimentalClick, activeCase, onCaseChange }) {", "export default function Header({ onUploadClick, onExperimentalClick, activeCase, onCaseChange, currentUser, onLogout }) {")

# Update imports
content = content.replace("import { FiUploadCloud, FiShield, FiFileText, FiCpu } from 'react-icons/fi';", "import { FiUploadCloud, FiShield, FiFileText, FiCpu, FiUser, FiLogOut } from 'react-icons/fi';")

buttons_old = """      <div className="flex items-center gap-2">
        <button 
          onClick={onExperimentalClick}
          className="flex items-center gap-2 bg-[var(--bg-primary)] border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-md transition-all text-sm font-semibold shadow-[0_0_10px_rgba(255,0,64,0.2)] hover:shadow-[0_0_15px_rgba(255,0,64,0.5)]"
        >
          <FiCpu className="animate-pulse" />
          <span className="hidden md:inline"> Experimental Labs</span>
        </button>
        <button 
          onClick={() => window.open(${API_URL}/api/report/generate?case_id=, '_blank')}
          className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-md hover:border-[var(--neon-gold)] hover:text-[var(--neon-gold)] transition-all text-sm font-semibold"
        >
          <FiFileText />
          <span className="hidden lg:inline">Report</span>
        </button>
        <SpecularButton 
          onClick={onUploadClick}
          size="md"
          radius={6}
          textColor="var(--text-accent)"
          lineColor="#00ff41"
          baseColor="#1a2f1a"
          intensity={1.5}
        >
          <FiUploadCloud />
          <span>Data Ingestion</span>
        </SpecularButton>
      </div>"""
      
buttons_new = """      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 mr-2 bg-[#05050f] rounded border border-[#1e3a5f]">
          <FiUser className={currentUser?.role === 'ADMIN' ? 'text-red-400' : 'text-[#4ecdc4]'} />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">{currentUser?.username}</span>
            <span className={	ext-[9px] uppercase tracking-widest }>{currentUser?.role}</span>
          </div>
          <button onClick={onLogout} className="ml-2 text-gray-500 hover:text-red-400" title="Sign Out">
            <FiLogOut size={14} />
          </button>
        </div>

        <button 
          onClick={onExperimentalClick}
          disabled={currentUser?.role !== 'ADMIN'}
          title={currentUser?.role !== 'ADMIN' ? "Clearance Level Too Low" : "Open Experimental Labs"}
          className={lex items-center gap-2 bg-[var(--bg-primary)] border px-3 py-1.5 rounded-md transition-all text-sm font-semibold }
        >
          <FiCpu className={currentUser?.role === 'ADMIN' ? 'animate-pulse' : ''} />
          <span className="hidden md:inline"> Experimental Labs</span>
        </button>
        
        <button 
          onClick={() => window.open(${API_URL}/api/report/generate?case_id=, '_blank')}
          className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-md hover:border-[var(--neon-gold)] hover:text-[var(--neon-gold)] transition-all text-sm font-semibold"
        >
          <FiFileText />
          <span className="hidden lg:inline">Report</span>
        </button>
        
        <div className={currentUser?.role !== 'ADMIN' ? 'opacity-50 pointer-events-none' : ''} title={currentUser?.role !== 'ADMIN' ? "Admin Access Required" : "Ingest Data"}>
          <SpecularButton 
            onClick={onUploadClick}
            size="md"
            radius={6}
            textColor="var(--text-accent)"
            lineColor="#00ff41"
            baseColor="#1a2f1a"
            intensity={1.5}
          >
            <FiUploadCloud />
            <span>Data Ingestion</span>
          </SpecularButton>
        </div>
      </div>"""

content = content.replace(buttons_old, buttons_new)

with codecs.open('frontend/src/components/Header.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("Header Auth applied.")
