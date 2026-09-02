import codecs

with codecs.open('frontend/src/App.jsx', 'r', 'utf-8') as f:
    content = f.read()

old_header = '''      <Header 
        onUploadClick={() => setShowUploadModal(true)} 
        onExperimentalClick={() => setShowExperimentalModal(true)}
        activeCase={activeCase}
        onCaseChange={handleCaseChange}
      />'''

new_header = '''      <Header 
        onUploadClick={() => setShowUploadModal(true)} 
        onExperimentalClick={() => setShowExperimentalModal(true)}
        activeCase={activeCase}
        onCaseChange={handleCaseChange}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />'''

content = content.replace(old_header, new_header)

with codecs.open('frontend/src/App.jsx', 'w', 'utf-8') as f:
    f.write(content)
print("Header props fixed.")
