with open('src/services/db.ts', 'r') as f:
    lines = f.readlines()

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

for i, line in enumerate(lines):
    if "export const DatabaseService =" in line:
        lines.insert(i, mutex_code)
        break

with open('src/services/db.ts', 'w') as f:
    f.writelines(lines)
