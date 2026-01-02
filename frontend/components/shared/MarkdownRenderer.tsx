import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [webViewHeight, setWebViewHeight] = useState(500);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Colors matching global.css
  const theme = {
    background: isDark ? '0 0 0' : '250 250 250',
    content: isDark ? '250 250 250' : '24 24 27',
    primary: isDark ? '59 130 246' : '37 99 235',
    base200: isDark ? '15 15 15' : '244 244 245',
    base300: isDark ? '39 39 42' : '228 228 231',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <style>
    :root {
      --color-background: rgb(${theme.background});
      --color-content: rgb(${theme.content});
      --color-primary: rgb(${theme.primary});
      --color-base-200: rgb(${theme.base200});
      --color-base-300: rgb(${theme.base300});
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background-color: transparent;
      color: var(--color-content);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
    }
    #content {
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      color: var(--color-content);
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    h1 { font-size: 28px; border-bottom: 1px solid var(--color-base-300); padding-bottom: 8px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    h4 { font-size: 18px; }
    
    p { 
      margin-bottom: 16px;
      color: var(--color-content);
    }
    strong {
      font-weight: 700;
    }
    em {
      font-style: italic;
    }
    code {
      background-color: var(--color-base-200);
      color: var(--color-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      border: 1px solid var(--color-base-300);
    }
    pre {
      background-color: var(--color-base-200);
      color: var(--color-content);
      padding: 16px;
      border-radius: 12px;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid var(--color-base-300);
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
    }
    blockquote {
      background-color: var(--color-base-200);
      border-left: 4px solid var(--color-primary);
      padding: 12px 16px;
      margin: 16px 0;
      color: var(--color-content);
      border-radius: 4px 12px 12px 4px;
      font-style: italic;
    }
    ul, ol { 
      margin: 16px 0; 
      padding-left: 24px;
    }
    li { 
      margin-bottom: 8px;
    }
    a { 
      color: var(--color-primary); 
      text-decoration: none;
      font-weight: 600;
    }
    hr { 
      border: none;
      border-top: 1px solid var(--color-base-300);
      margin: 24px 0;
    }
    table { 
      border-collapse: collapse; 
      margin: 16px 0; 
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--color-base-300);
    }
    th, td { 
      border: 1px solid var(--color-base-300); 
      padding: 12px;
      text-align: left;
    }
    th { 
      background-color: var(--color-base-200);
      font-weight: 700;
    }
    .katex { 
      font-size: 1.15em;
    }
    .katex-display { 
      margin: 20px 0; 
      padding: 10px;
      background-color: var(--color-base-200);
      border-radius: 12px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    try {
      const content = ${JSON.stringify(content)};
      
      // Parse markdown
      const html = marked.parse(content);
      document.getElementById('content').innerHTML = html;
      
      // Render math with KaTeX
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\\\[', right: '\\\\]', display: true},
          {left: '\\\\(', right: '\\\\)', display: false}
        ],
        throwOnError: false,
        trust: true
      });
      
      // Send height to React Native
      function sendHeight() {
        const height = document.body.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
      }
      
      // Send height after rendering
      setTimeout(sendHeight, 100);
      
      // Update height on window resize
      window.addEventListener('resize', sendHeight);
    } catch (error) {
      console.error('Error rendering:', error);
    }
  </script>
</body>
</html>
  `;

  return (
    <View style={[styles.container, { height: webViewHeight }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webView}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        backgroundColor="transparent"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height) {
              setWebViewHeight(data.height + 30);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'visible',
  },
  webView: {
    backgroundColor: 'transparent',
    opacity: 0.99, // Fix for some Android rendering issues
    width: '100%',
  },
});
