import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """    } catch (e: any) {
      showToast(e.message || 'Erro ao criar zona.');
    }""",
    """    } catch (e: any) {
      showToast(e.message || 'Erro ao criar zona.');
      throw e;
    }"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
