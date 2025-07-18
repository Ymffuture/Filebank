import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, Space } from 'antd';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';

const editorConfig = {
  namespace: 'NotifEditor',
  theme: {
    paragraph: 'my-paragraph',
  },
  // Register the node types you intend to use:
  nodes: [
    LinkNode,
  ],
  onError: (error) => {
    console.error('Lexical Error:', error);
  },
};

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <Space style={{ marginBottom: 12 }}>
      <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        Bold
      </Button>
      <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
        Italic
      </Button>
      <Button
        onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          }
        }}
      >
        Link
      </Button>
    </Space>
  );
}

export default function LexicalNotificationEditor({ onSend }) {
  const [html, setHtml] = useState('');

  return (
    <div style={{ padding: 16, border: '1px solid #DDD', borderRadius: 8 }}>
      <LexicalComposer initialConfig={editorConfig}>
        <Toolbar />

        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                minHeight: 150,
                padding: 8,
                border: '1px solid #CCC',
                borderRadius: 4,
              }}
            />
          }
          placeholder={
            <div style={{ color: '#AAA' }}>Type your notification…</div>
          }
        />
        <HistoryPlugin />
        <LinkPlugin />
        <OnChangePlugin
          onChange={(editorState) => {
            // Export HTML on every change
            const newHtml = editorState.read(() => $generateHtmlFromNodes(editorState));
            setHtml(newHtml);
          }}
        />
      </LexicalComposer>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={() => onSend(html)}
          disabled={!html.trim()}
        >
          Send Notification
        </Button>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 8,
          background: '#F7F7F7',
          borderRadius: 4,
          fontSize: 12,
          maxHeight: 200,
          overflowY: 'auto',
        }}
      >
        <strong>Generated HTML:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{html}</pre>
      </div>
    </div>
  );
}

