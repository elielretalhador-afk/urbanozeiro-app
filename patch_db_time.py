with open('src/services/db.ts', 'r') as f:
    c = f.read()

old = """        }
        updatedData.lastConquered = new Date(operation.createdAt).toISOString();
      }

      // Merge manually, respecting rules"""

new = """        }
        updatedData.lastConquered = new Date(operation.createdAt).toISOString();
        updatedData.conqueredAtUnix = operation.createdAt;
      }

      // Merge manually, respecting rules"""

c = c.replace(old, new)

with open('src/services/db.ts', 'w') as f:
    f.write(c)
