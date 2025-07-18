import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from 'antd';

const editorConfig = {
  namespace: 'NotifEditor',
  theme: {
    paragraph: 'my-paragraph', // optional
  },
  onError: (error) => {
    console.error('Lexical Error:', error);
  },
};

function HtmlExporter({ onExport }) {
  const [editor] = useLexicalComposerContext();

  const handleExport = () => {
    const htmlString = editor.getEditorState().read(() => {
      return $generateHtmlFromNodes(editor);
    });
    onExport(htmlString);
  };

  return (
    <Button onClick={handleExport} className="mt-2">
      Export to HTML
    </Button>
  );
}

export default function LexicalNotificationEditor({ onSend }) {
  const [html, setHtml] = useState('');

  const handleSend = () => {
    onSend(html);
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <LexicalComposer initialConfig={editorConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="p-2 border rounded min-h-[150px]" />
          }
          placeholder={<div className="text-gray-400">Type your notification...</div>}
        />
        <HistoryPlugin />
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

      <div className="mt-4">
        <Button
          type="primary"
          onClick={handleSend}
          disabled={!html.trim()}
        >
          Send Notification
        </Button>
      </div>

      <div className="mt-4 p-2 bg-gray-50 rounded border text-xs overflow-auto max-h-[200px]">
        <strong>Generated HTML:</strong>
        <pre>{html}</pre>
      </div>
    </div>
  );
}

