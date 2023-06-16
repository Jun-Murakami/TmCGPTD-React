import { Typography, Box, Stack, Card, Divider, Button, Avatar } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../components/CodeBlock';
import { useDialogStore } from '../store/dialogStore';
import { SearchAppBar } from '../components/AppBar';
import { SignInOut } from './SignInOut';
import { SignOutButton } from './SignOut';
import { useUserStore } from '../store/userStore';

export const MainContainer = () => {
  const showDialog = useDialogStore((state) => state.showDialog);
  const userAvatar = useUserStore((state) => state.photoURL);


  const handleDialog = async () => {
    const result = await showDialog('WorldHello WorldHello', 'This is a test dialog', true);
  }

  const testStr = `Material-UIを使用して、ユーザーとアシスタントが交互に表示されるUIを構築するために、以下のコンポーネントと方法を提案します。

  4. メッセージのスタイリングに応じて、*Avatar* コンポーネントを使用してロールを表示することもできます。
  5. メッセージがユーザーからのものかアシスタントからのものかを判断するために、role プロパティを使用し、スタイリングを調整して表示位置を変更します。

  TypeScriptでの実装例:
  ${"```tsx"}
  import { atom } from "jotai";

  // 関数を含むオブジェクトをアトムに登録
  const functionAtom = atom({
    func: () => "Hello, World!",
  });
  ${"```"}
  `;


const makeMarkedHtml = (html: string) => {

  return (
    <ReactMarkdown
    children={html}
    components={{
      code: CodeBlock,
    }}
  />
  )
}

  return (
    <>
      <Box component="nav">
        <SearchAppBar />
      </Box>
      <Box component="main" sx={{ p: 5, backgroundColor: "#eeeeee" }} display="flex" justifyContent="center" alignItems="center">
        <Stack sx={{ p: 2 }} divider={<Divider orientation="horizontal" flexItem />} spacing={2}>
          <Card sx={{ p: 6 }}>
            <Stack direction="row">
              <Avatar alt="Remy Sharp" src={userAvatar} sx={{ width: 40, height: 40 }} />
              <Stack sx={{ pl: 2}}>
                <Box maxWidth={900} marginTop={-2.5}>
                  {makeMarkedHtml(testStr)}
                </Box>
                <Stack direction="row" spacing={2} marginTop={2} sx={{color: 'grey.500'}}>
                  <Typography  variant="caption" display="block" gutterBottom maxWidth={900}>
                    {"["}2023/06/15 14:57:39{"]"}
                  </Typography>
                  <Typography  variant="caption" display="block" gutterBottom maxWidth={900}>
                    usage={"{"}"prompt_tokens":956,"completion_tokens":1085,"total_tokens":2041{"}"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ p: 6 }}>
            <Typography variant="body1" gutterBottom display="block" maxWidth={900}>
              Hello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello World
              <Button onClick={handleDialog} variant='contained'>Test</Button>
              <SignInOut></SignInOut>
            </Typography>
          </Card>
          <Card sx={{ p: 6 }}>
            <Typography variant="body1" gutterBottom maxWidth={900}>
              Hello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello WorldHello World
            </Typography>
          </Card>
        </Stack>
      </Box>
    </>
  );

}