import sys
import re

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

# Update state type
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'extrato' | 'catalogo' | 'regras'>('extrato');",
    "const [activeTab, setActiveTab] = useState<'extrato' | 'loja' | 'inventario' | 'cofres'>('extrato');"
)

# Update onClick from 'catalogo' to 'loja'
content = content.replace("setActiveTab('catalogo')", "setActiveTab('loja')")
content = content.replace("activeTab === 'catalogo'", "activeTab === 'loja'")

# Remove regras tab button
regras_btn = r'            <button\s+type="button"\s+id="tab-wallet-regras".*?<span>REGRAS</span>\s*</button>'
content = re.sub(regras_btn, '', content, flags=re.DOTALL)
# Remove regras tab button empty extra
content = content.replace("            <button\n              type=\"button\"\n\n", "")


# Inject new tabs (Inventário and Cofres)
new_tabs = """
            <button
              type="button"
              id="tab-wallet-inventario"
              onClick={() => setActiveTab('inventario')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 font-mono-stat cursor-pointer ${
                activeTab === 'inventario'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>INVENTÁRIO</span>
            </button>

            <button
              type="button"
              id="tab-wallet-cofres"
              onClick={() => setActiveTab('cofres')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 font-mono-stat cursor-pointer ${
                activeTab === 'cofres'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>COFRES</span>
            </button>
"""

content = content.replace("              <span>CATÁLOGO</span>\n            </button>", "              <span>LOJA</span>\n            </button>\n" + new_tabs)


with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)
