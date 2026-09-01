import re

with open('index.html', 'r') as f:
    content = f.read()

head_addition = """
    <link rel="manifest" href="/manifest.json" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ROLLING WARS" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
"""

body_addition = """
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(
            (registration) => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            },
            (err) => {
              console.log('ServiceWorker registration failed: ', err);
            }
          );
        });
      }
    </script>
"""

content = content.replace("</head>", head_addition + "</head>")
content = content.replace("</body>", body_addition + "</body>")

with open('index.html', 'w') as f:
    f.write(content)
