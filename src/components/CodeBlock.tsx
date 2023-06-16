import { CodeComponent } from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box } from '@mui/material';

export const CodeBlock: CodeComponent = ({ inline, className, children }) => {
  if (inline) {
    return <code className={className}>{children}</code>;
  }
  const match = /language-(\w+)/.exec(className || '');
  const lang = match && match[1] ? match[1] : '';
  return (
    <Box>
      {lang && (
        <Box
          sx={{
            fontSize: 14,
            fontWeight: 'bold',
            lineHeight: 1,
            bgcolor: 'grey.300',
            p: 1,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          {lang}
        </Box>
      )}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        customStyle={{
          fontFamily: '"Courier New", "Courier", "Monaco", "Menlo", monospace',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderRadius: lang ? 0 : 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          padding: 15,
          margin: 0,
        }}
        children={String(children).replace(/\n$/, '')}
      />
    </Box>
  );
};
