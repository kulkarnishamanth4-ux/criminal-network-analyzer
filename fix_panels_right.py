import codecs

with codecs.open('frontend/src/components/RightPanel.jsx', 'r', 'utf-8') as f:
    right = f.read()

if "FiChevronRight" not in right:
    right = right.replace("import { FiX } from 'react-icons/fi';", "import { FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';")

old_return_right = "  return (\n    <aside className=\"w-[320px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 transition-all duration-300\">"

new_return_right = """  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (isCollapsed) {
    return (
      <aside className="w-[40px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full flex flex-col z-10 shadow-lg shrink-0 items-center py-4">
        <button onClick={() => setIsCollapsed(false)} className="text-[var(--text-secondary)] hover:text-white p-2" title="Expand Right Panel">
          <FiChevronLeft size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[320px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative transition-all duration-300">
      <button onClick={() => setIsCollapsed(true)} className="absolute top-4 left-4 text-[var(--text-secondary)] hover:text-white p-1 bg-[var(--bg-primary)] rounded z-50 border border-[var(--border)]" title="Collapse Panel">
        <FiChevronRight size={16} />
      </button>"""

if "const [isCollapsed" not in right:
    right = right.replace(old_return_right, new_return_right)

with codecs.open('frontend/src/components/RightPanel.jsx', 'w', 'utf-8') as f:
    f.write(right)

print("Right panel fixed.")
