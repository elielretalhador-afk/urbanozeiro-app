import subprocess

try:
    subprocess.run(["firebase", "deploy", "--only", "firestore:rules"], check=True)
except Exception as e:
    print(e)
