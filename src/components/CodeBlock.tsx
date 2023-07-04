import { CodeComponent } from 'react-markdown/lib/ast-to-react';
import Highlight from 'react-highlight';
import { Box } from '@mui/material';

export const CodeBlock: CodeComponent = ({ inline, className, children }) => {
  if (inline) {
    return <code className={className}>{children}</code>;
  }
  const match = /language-(\w+)/.exec(className || '');
  const lang = match && match[1] ? match[1] : '';
  const borderRadiusClass = lang ? 'border-bottom' : 'border-all';
  return (
    <>
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
      <Highlight className={`${lang} ${borderRadiusClass}`}>{String(children).replace(/\n$/, '')}</Highlight>
    </>
  );
};
