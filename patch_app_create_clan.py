import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    """    } catch (e: any) {
      showToast(e.message || 'Erro ao criar clã.');
    } finally {
      setIsProcessingOperation(false);
    }""",
    """    } catch (e: any) {
      showToast(e.message || 'Erro ao criar clã.');
      throw e;
    } finally {
      setIsProcessingOperation(false);
    }"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
