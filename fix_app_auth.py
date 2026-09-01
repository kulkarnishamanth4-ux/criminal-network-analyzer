import codecs
with codecs.open('frontend/src/App.jsx', 'r', 'utf-8') as f:
    content = f.read()

# Add import
content = content.replace("import ChatBot from './components/ChatBot';", "import ChatBot from './components/ChatBot';\nimport LoginScreen from './components/LoginScreen';")

# Add state
state_injection = """  const [activeCase, setActiveCase] = useState('dawood');
  const [currentUser, setCurrentUser] = useState(null);"""
content = content.replace("  const [activeCase, setActiveCase] = useState('dawood');", state_injection)

# Return interception
render_injection = """  if (!showApp) {
    return <LandingPage onEnter={() => setShowApp(true)} />;
  }

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen bg-[#05050f] text-gray-200 overflow-hidden font-sans relative">"""
content = content.replace("""  if (!showApp) {
    return <LandingPage onEnter={() => setShowApp(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#05050f] text-gray-200 overflow-hidden font-sans relative">""", render_injection)

# Update Header props to pass currentUser
header_prop = """      <div className="flex flex-col flex-1 h-full relative">
        <Header 
          onUploadClick={() => setShowUploadModal(true)} 
          onExperimentalClick={() => setShowExperimentalModal(true)}
          activeCase={activeCase}
          onCaseChange={setActiveCase}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
        />"""
content = content.replace("""      <div className="flex flex-col flex-1 h-full relative">
        <Header 
          onUploadClick={() => setShowUploadModal(true)} 
          onExperimentalClick={() => setShowExperimentalModal(true)}
          activeCase={activeCase}
          onCaseChange={setActiveCase}
        />""", header_prop)
        
with codecs.open('frontend/src/App.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("App updated with LoginScreen.")
