import { useUserStore } from '../store/userStore';
import { useDialogStore } from '../store/dialogStore';
import { Typography, Box, Stack, Card, Divider, Button, Avatar } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../components/CodeBlock';
import { AiIcon } from '../components/AiIcon';

export function ChatRoomMock() {
  const userAvatar = useUserStore((state) => state.photoURL);
  const showDialog = useDialogStore((state) => state.showDialog);

  const handleDialog = async () => {
    await showDialog('WorldHello WorldHello', 'This is a test dialog');
  };

  const testStr = `Material-UIを使用して、ユーザーとアシスタントが交互に表示されるUIを構築するために、以下のコンポーネントと方法を提案します。

4. メッセージのスタイリングに応じて、*Avatar* コンポーネントを使用してロールを表示することもできます。
5. メッセージがユーザーからのものかアシスタントからのものかを判断するために、role プロパティを使用し、スタイリングを調整して表示位置を変更します。

TypeScriptでの実装例:
${'```tsx'}
import { atom } from "jotai";

// 関数を含むオブジェクトをアトムに登録
const functionAtom = atom({
  func: () => "Hello, World!",
});
${'```'}
`;

  const makeMarkedHtml = (html: string) => {
    return (
      <ReactMarkdown
        children={html}
        className='markdownBody'
        components={{
          code: CodeBlock,
        }}
      />
    );
  };
  return (
    <Stack
      sx={{ p: 1, paddingBottom: 10 }}
      divider={<Divider orientation='horizontal' flexItem />}
      spacing={2}
      maxWidth={900}
      minWidth={260}
    >
      <Box sx={{ p: 1.5, width: '100%', alignItems: 'left' }}>
        <Stack direction='row' alignItems='left'>
          <PsychologyIcon sx={{ fontSize: 30, marginTop: 0 }} color='primary' />
          <Box sx={{ pl: 1.5 }} marginTop={0} whiteSpace={'pre-wrap'}>
            {`あなたはTypeScriptとReactのスペシャリストです。
これから話すユーザーはC#の経験とES6以前までのJavaScriptの知識を持っていますが、
モダンなフロントエンド開発は初心者ですので分かりやすい回答を心がけてください。

# コード例を挙げるときはJavaScriptではなく、できるだけTypeScriptで回答してください。
# ユーザーはMaterial-UIライブラリとZustandライブラリを使用しています。
# アプリのデプロイとデータベースにはFirebaseを利用しています。`}
          </Box>
        </Stack>
      </Box>

      <Card sx={{ p: 1.5 }}>
        <Stack direction='row'>
          <Avatar alt='Avator' src={userAvatar} sx={{ marginTop: 1, width: 30, height: 30 }} />
          <Stack sx={{ pl: 1.5 }} marginTop={-1.5}>
            <Box lineHeight={1.6} marginTop={1.5} whiteSpace={'pre-wrap'}>
              {testStr}
            </Box>
            <Stack marginBottom={1.5} sx={{ color: 'grey.500' }}>
              <Typography variant='caption' textAlign='right'>
                {'['}2023/06/15 14:57:39{']'}
              </Typography>
              <Typography variant='caption' sx={{ lineBreak: 'anywhere' }} textAlign='right'>
                usage={'{'}"prompt_tokens":956,"completion_tokens":1085,"total_tokens":2041{'}'}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ backgroundColor: 'grey.100', p: 1.5 }}>
        <Stack direction='row'>
          <AiIcon sx={{ fontSize: 30, marginTop: 1 }} color='primary' />
          <Stack sx={{ pl: 1.5 }} marginTop={-1.5}>
            {makeMarkedHtml(testStr)}
            <Stack marginBottom={1.5} sx={{ color: 'grey.500' }}>
              <Typography variant='caption' textAlign='right'>
                {'['}2023/06/15 14:57:39{']'}
              </Typography>
              <Typography variant='caption' sx={{ lineBreak: 'anywhere' }} textAlign='right'>
                usage={'{'}"prompt_tokens":956,"completion_tokens":1085,"total_tokens":2041{'}'}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 6 }}>
        <Typography variant='body1' display='block'>
          Hello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello World
          <Button onClick={handleDialog} variant='contained'>
            Test
          </Button>
        </Typography>
      </Card>
      <Card sx={{ p: 6 }}>
        <Typography variant='body1'>
          Hello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello
          WorldHello WorldHello WorldHello WorldHello WorldHello World
        </Typography>
      </Card>
    </Stack>
  );
}
