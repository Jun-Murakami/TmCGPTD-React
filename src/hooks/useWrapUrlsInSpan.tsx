import { useState, useEffect, ReactNode } from 'react';

// URLを検出するための正規表現
const urlPattern = /(https?:\/\/[^\s]+|localhost:[^\s]*)/g;

export function useWrapUrlsInSpan(text: string): ReactNode[] | null {
  const [processedText, setProcessedText] = useState<ReactNode[] | null>(null);

  useEffect(() => {
    const parts = text.split(urlPattern).map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <span key={index} style={{ wordBreak: 'break-all' }}>
            {part}
          </span>
        );
      } else {
        return part;
      }
    });

    setProcessedText(parts);
  }, [text]);

  return processedText;
}
