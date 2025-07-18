
import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, Space } from 'antd';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

const editorConfig = {
  namespace: 'NotifEditor',
  theme: {
    paragraph: 'my-paragraph', // Optional: add Tailwind or custom class here if needed
  },
  nodes: [LinkNode], // Register link support
  onError: (error) => {
    console.error('Lexical Error:', error);
  },
};

// Toolbar for Bold, Italic, and Link
function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  return (
    <Space style={{ marginBottom: 12 }}>
      <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>Bold</Button>
      <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>Italic</Button>
      <Button onClick={insertLink}>Link</Button>
    </Space>
  );
}

// Export HTML with Lexical Context
function HtmlExporter({ onExport }) {
  const [editor] = useLexicalComposerContext();

  const handleExport = () => {
    const htmlString = editor.getEditorState().read(() => {
      return $generateHtmlFromNodes(editor, null);
    });
    onExport(htmlString);
  };

  return (
    <Button onClick={handleExport} style={{ marginTop: 8 }}>
      Export to HTML
    </Button>
  );
}

export default function LexicalNotificationEditor({ onSend }) {
  const [html, setHtml] = useState('');

  return (
    <div style={{
      padding: 16,
      border: '1px solid #DDD',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      maxWidth: 600,
      margin: 'auto',
      background: '#fff'
    }}>
      <LexicalComposer initialConfig={editorConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                minHeight: 150,
                padding: 12,
                border: '1px solid #CCC',
                borderRadius: 6,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            />
          }
          placeholder={<div style={{ color: '#AAA' }}>Type your notification...</div>}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <OnChangePlugin
          onChange={(editorState) => {
            const newHtml = editorState.read(() => {
              return $generateHtmlFromNodes(editorState);
            });
            setHtml(newHtml);
          }}
        />
        <HtmlExporter onExport={setHtml} />
      </LexicalComposer>

      <div style={{ marginTop: 20 }}>
        <Button
          type="primary"
          onClick={() => onSend(html)}
          disabled={!html.trim()}
          block
        >
          Send Notification
        </Button>
      </div>

      <div style={{
        marginTop: 20,
        padding: 12,
        background: '#F9F9F9',
        borderRadius: 8,
        fontSize: 12,
        maxHeight: 250,
        overflowY: 'auto',
      }}>
        <strong>Generated HTML:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{html}</pre>
      </div>
    </div>
  );
}
