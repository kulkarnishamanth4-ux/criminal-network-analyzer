import codecs

with codecs.open('frontend/src/components/RightPanel.jsx', 'r', 'utf-8') as f:
    right = f.read()

right = right.replace("import React from 'react';", "import React, { useState } from 'react';")
if "import React, { useState }" not in right and "import React" not in right:
    # If React is not explicitly imported
    right = "import React, { useState } from 'react';\n" + right

with codecs.open('frontend/src/components/RightPanel.jsx', 'w', 'utf-8') as f:
    f.write(right)
print("Import fixed.")
