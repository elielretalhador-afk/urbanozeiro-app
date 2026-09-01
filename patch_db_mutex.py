import re
with open('src/services/db.ts', 'r') as f:
    content = f.read()

mutex_code = """
class AsyncMutex {
  private promise: Promise<void> = Promise.resolve();
  async acquire(): Promise<() => void> {
    let release: () => void = () => {};
    const next = new Promise<void>(resolve => release = resolve);
    const wait = this.promise;
    this.promise = wait.then(() => next);
    await wait;
    return release;
  }
}
const idbMutex = new AsyncMutex();
"""

# Insert after all imports
content = re.sub(r'(import .*?;[\r\n]+)(?!import)', r'\1' + mutex_code + '\n', content, count=1)

with open('src/services/db.ts', 'w') as f:
    f.write(content)
