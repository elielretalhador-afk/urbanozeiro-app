awk '
/npx cap sync android/ {
    print "          # Ensure a completely fresh Capacitor environment"
    print "          rm -rf android"
    print "          npm install"
    print "          npm run build"
    print "          npx cap add android || true"
    print $0
    next
}
1
' /app/applet/.github/workflows/main.yml > /tmp/main.yml.tmp
mv /tmp/main.yml.tmp /app/applet/.github/workflows/main.yml
