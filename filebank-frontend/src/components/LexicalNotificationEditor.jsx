import React, { useState } from 'react';
import {
  LexicalComposer,
  OnChangePlugin,
} from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from 'antd';

const editorConfig = {
  namespace: 'NotifEditor',
  theme: {
    paragraph: 'my-paragraph', // Optional custom classes
  },
  onError: console.error,
};

function HtmlExporter({ onExport }) {
  const [editor] = useLexicalComposerContext();

  return (
    <Button
      onClick={() => {
        editor.update(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          onExport(htmlString);
        });
      }}
    >
      Export to HTML
    </Button>
  );
}

export default function LexicalNotificationEditor({ onSend }) {
  const [html, setHtml] = useState('');

  return (
    <div className="p-4 border rounded shadow-md">
      <LexicalComposer initialConfig={editorConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="p-2 border rounded min-h-[150px]" />}
          placeholder={<div className="text-gray-400">Type your notification...</div>}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={() => {}} />
        <HtmlExporter onExport={setHtml} />
      </LexicalComposer>

      <div className="mt-4">
        <Button
          type="primary"
          onClick={() => onSend(html)}
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
