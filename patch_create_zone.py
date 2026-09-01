import re

with open('src/components/CreateZoneModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'onCreateZone: (newZone: Zone) => void;',
    'onCreateZone: (newZone: Zone) => Promise<void> | void;'
)

content = content.replace(
    '  const [submitted, setSubmitted] = useState(false);',
    '  const [submitted, setSubmitted] = useState(false);\n  const [isProcessing, setIsProcessing] = useState(false);'
)

replace_submit = """
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setSubmitted(true);

    const isValid = validateForm();
    if (!isValid) {
      return;
    }
    
    setIsProcessing(true);
"""
content = re.sub(r'  const handleSubmit = \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    setSubmitted\(true\);.*?const isValid = validateForm\(\);\n    if \(!isValid\) \{\n      return;\n    \}', replace_submit.strip(), content, flags=re.DOTALL)

replace_create = """
    try {
      await onCreateZone(newZone);
      onClose();
    } catch (e) {
      // Error handled by parent
    } finally {
      setIsProcessing(false);
    }
"""
content = content.replace(
    '    onCreateZone(newZone);\n    onClose();\n  };',
    replace_create.strip() + '\n  };'
)

content = content.replace(
    'disabled={isProcessing}',
    ''
)
content = content.replace(
    '<button\n              type="submit"\n              className="w-full',
    '<button\n              type="submit"\n              disabled={isProcessing}\n              className="w-full disabled:opacity-50 disabled:cursor-not-allowed '
)

content = content.replace(
    'CRIAR E REGISTRAR ZONA NO MAPA\n            </button>',
    '{isProcessing ? "PROCESSANDO..." : "CRIAR E REGISTRAR ZONA NO MAPA"}\n            </button>'
)

with open('src/components/CreateZoneModal.tsx', 'w') as f:
    f.write(content)
