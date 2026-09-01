import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const handleCreateClan = async (data: any) => {", "  const handleCreateClan = async (data: any) => {\n    if (isProcessingOperation) return;\n    setIsProcessingOperation(true);")
content = content.replace("      showToast(e.message || 'Erro ao criar clã.');\n    }\n  };", "      showToast(e.message || 'Erro ao criar clã.');\n    } finally {\n      setIsProcessingOperation(false);\n    }\n  };")

with open('src/App.tsx', 'w') as f:
    f.write(content)
