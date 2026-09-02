import codecs

# LEFT PANEL
with codecs.open('frontend/src/components/LeftPanel.jsx', 'r', 'utf-8') as f:
    left = f.read()

import_old = "import React, { useState, useEffect } from 'react';"
import_new = "import React, { useState, useEffect } from 'react';\nimport { FiChevronLeft, FiChevronRight } from 'react-icons/fi';"

if "FiChevronLeft" not in left:
    left = left.replace(import_old, import_new)

old_return_left = "  return (\n    <aside className=\"w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0\">\n      <div className=\"p-4 space-y-6\">"

new_return_left = """  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (isCollapsed) {
    return (
      <aside className="w-[40px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full flex flex-col z-10 shadow-lg shrink-0 items-center py-4">
        <button onClick={() => setIsCollapsed(false)} className="text-[var(--text-secondary)] hover:text-white p-2" title="Expand Left Panel">
          <FiChevronRight size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative transition-all">
      <button onClick={() => setIsCollapsed(true)} className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-white p-1 bg-[var(--bg-primary)] rounded" title="Collapse Panel">
        <FiChevronLeft size={16} />
      </button>
      <div className="p-4 space-y-6 pt-10">"""

if "const [isCollapsed" not in left:
    left = left.replace(old_return_left, new_return_left)

with codecs.open('frontend/src/components/LeftPanel.jsx', 'w', 'utf-8') as f:
    f.write(left)

# RIGHT PANEL
with codecs.open('frontend/src/components/RightPanel.jsx', 'r', 'utf-8') as f:
    right = f.read()

if "FiChevronRight" not in right:
    right = right.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { FiChevronRight, FiChevronLeft } from 'react-icons/fi';")

old_return_right = "  return (\n    <aside className=\"w-[320px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0\">"

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
    <aside className="w-[320px] bg-[var(--bg-card)] border-l border-[var(--border)] h-full overflow-y-auto flex flex-col z-10 shadow-lg shrink-0 relative transition-all">
      <button onClick={() => setIsCollapsed(true)} className="absolute top-2 left-2 text-[var(--text-secondary)] hover:text-white p-1 bg-[var(--bg-primary)] rounded z-50" title="Collapse Panel">
        <FiChevronRight size={16} />
      </button>
      <div className="pt-10">"""

if "const [isCollapsed" not in right:
    # Need to be careful about where the pt-10 goes, RightPanel might not have a wrapper div
    # Let's replace the aside definition and add a padding top to it or to its immediate children
    right = right.replace(old_return_right, new_return_right)

with codecs.open('frontend/src/components/RightPanel.jsx', 'w', 'utf-8') as f:
    f.write(right)

print("Panels made collapsible.")
