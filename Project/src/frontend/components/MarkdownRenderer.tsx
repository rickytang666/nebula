import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [webViewHeight, setWebViewHeight] = useState(500);

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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background-color: transparent;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
    }
    #content {
      padding: 0;
    }
    h1 { 
      font-size: 32px; 
      font-weight: bold; 
      margin: 16px 0; 
      line-height: 1.25;
      color: #FFFFFF;
    }
    h2 { 
      font-size: 24px; 
      font-weight: bold; 
      margin: 16px 0 12px; 
      line-height: 1.33;
      color: #FFFFFF;
    }
    h3 { 
      font-size: 20px; 
      font-weight: bold; 
      margin: 12px 0 8px; 
      line-height: 1.4;
      color: #FFFFFF;
    }
    h4 { 
      font-size: 18px; 
      font-weight: bold; 
      margin: 12px 0 8px;
      color: #FFFFFF;
    }
    h5 { 
      font-size: 16px; 
      font-weight: bold; 
      margin: 8px 0;
      color: #FFFFFF;
    }
    h6 { 
      font-size: 14px; 
      font-weight: bold; 
      margin: 8px 0;
      color: #FFFFFF;
    }
    p { 
      margin: 0 0 12px;
      color: #FFFFFF;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    code {
      background-color: #1F2937;
      color: #3B82F6;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    pre {
      background-color: #1F2937;
      color: #E5E7EB;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0 12px;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    blockquote {
      background-color: #1F2937;
      border-left: 4px solid #3B82F6;
      padding: 8px 12px;
      margin: 8px 0 12px;
      color: #FFFFFF;
    }
    ul, ol { 
      margin: 8px 0 12px; 
      padding-left: 24px;
      color: #FFFFFF;
    }
    li { 
      margin-bottom: 4px;
      color: #FFFFFF;
    }
    a { 
      color: #3B82F6; 
      text-decoration: underline;
    }
    hr { 
      background-color: #374151; 
      height: 1px; 
      border: none; 
      margin: 16px 0;
    }
    table { 
      border-collapse: collapse; 
      margin: 8px 0 12px; 
      width: 100%;
    }
    th, td { 
      border: 1px solid #374151; 
      padding: 8px;
      color: #FFFFFF;
    }
    th { 
      font-weight: bold;
    }
    .katex { 
      font-size: 1.1em;
      color: #FFFFFF;
    }
    .katex-display { 
      margin: 12px 0; 
      overflow-x: auto; 
      overflow-y: hidden;
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
              setWebViewHeight(data.height + 20);
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
    width: '100%',
  },
});
