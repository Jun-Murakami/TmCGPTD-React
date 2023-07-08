// useProcessSendMessage.ts (custom hook)
import { useEffect } from 'react';
import { createChat } from 'completions';
import { encode } from 'gpt-tokenizer';
import { Message } from '../types/types';
import { updateAssistantMessageDb, updateChatRoomNameDb, getChatRoomsDb } from '../services/supabaseDb';
import { useDialogStore } from '../store/dialogStore';
import { useChatStore } from '../store/chatStore';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import { Chat } from '../types/types';

export function useProcessSendMessage() {
  const currentMessages = useChatStore<Message[]>((state) => state.currentMessages);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const apiKey = useUserStore<string | null>((state) => state.apiKey);
  const model = useAppStore<string | null>((state) => state.apiModel);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const showDialog = useDialogStore((state) => state.showDialog);

  useEffect(() => {
    if (!roomState.isNewInputAdded || !apiKey || !model || roomState.userInput === '') return;

    let messages: Chat[] = []; // メッセージを格納する配列
    let isSummarized: boolean = false; // 要約フラグをリセット
    let isDeleteHistory: boolean = false; // 履歴削除フラグをリセット
    let processedMessages: Chat[] = []; // 処理済みのメッセージを格納する配列
    let updatedMessage: Message | null = null; // 更新されたメッセージを保持する変数

    const getAssistantMessage = async () => {
      // jsonがある場合はjsonを取得
      if (roomState.json?.length) {
        messages = roomState.json;
      } else {
        // jsonが無い場合はユーザー入力以外のメッセージを取得
        messages = currentMessages.slice(0, -2).map((message) => {
          return { role: message.role, content: message.content };
        });
      }

      const inputTokenCount = encode(roomState.userInput as string).length; // 入力文字列のトークン数を取得

      // 過去の会話履歴と現在の入力を結合する前に、過去の会話履歴に含まれるcontent文字列のトークン数を取得
      const historyContentTokenCount = messages.reduce((prev, curr) => prev + encode(curr.content).length, 0);

      let preSummarizedHistoryTokenCount = historyContentTokenCount; // 要約前のトークン数を記録

      // 履歴のトークン制限デフォルト値を設定
      const maxContentLength = 3072;

      // 履歴を逆順にして保存
      let reversedHistoryList: Chat[] = messages.slice().reverse();

      // そもそもユーザー入力が4096を超えている場合はエラー
      if (inputTokenCount > 4096) {
        new Error(
          `The values for input text (${inputTokenCount}) exceeds 4097 tokens. Please reduce by at least ${
            inputTokenCount - 4096
          } tokens.`
        );
      }

      // 過去の履歴＋ユーザーの新規入力がmaxContentLengthを超えた場合の要約処理
      if (historyContentTokenCount + inputTokenCount > maxContentLength && historyContentTokenCount > 0) {
        let historyTokenCount = 0;
        let messagesToSelect = 0; // 会話履歴のどのインデックスまで選択するか
        let messageStart = 0; // 会話履歴のどのインデックスから選択するか
        let forCompMes = '';

        // 会話履歴の最新のものからトークン数を数えて一時変数「historyTokenCount」に足していく
        for (let i = 0; i < reversedHistoryList.length; i++) {
          const messageTokenCount = encode(reversedHistoryList[i].content).length;
          historyTokenCount += messageTokenCount;

          //直近の会話が短ければそのまま生かす
          if (i <= 4 && historyTokenCount < maxContentLength / 5) {
            messageStart += 1;
          }

          // トークン数が制限文字数を超えたらブレイク
          if (historyTokenCount > maxContentLength) {
            messagesToSelect = i + 1; // 最後に処理した次のインデックスを記録
            break;
          }
        }

        // 会話履歴から適切な数だけをセレクトする
        const rangeLength = Math.min(messagesToSelect - messageStart, reversedHistoryList.length - messageStart);

        if (rangeLength > 0) {
          forCompMes = reversedHistoryList
            .slice(messageStart, rangeLength)
            .map((message) => message.content)
            .reduce((a, b) => a + b);
        } else if (messagesToSelect === 0) {
          if (reversedHistoryList.length > 0) {
            forCompMes = reversedHistoryList[0].content;
          } else {
            await showDialog(`Can't find conversation history to summarize.`, 'Error');
          }
        }

        if (messagesToSelect > 0) {
          // 抽出したテキストを要約APIリクエストに送信
          try {
            let summary = await getSummaryAsync(forCompMes as string, apiKey, 'gpt-3.5-turbo');
            summary = roomState.currentRoomName + ': ' + summary;

            let summaryLog = '';

            if (messageStart > 0) {
              summaryLog += `${messageStart} latest message(s) +\n\n ${summary}`;
            } else {
              summaryLog = summary;
            }

            console.log(summaryLog);

            isSummarized = true; // 要約フラグを立てる

            // 返ってきた要約文でconversationHistoryを書き換える
            let reversedMessages = messages!.slice().reverse();
            reversedMessages!.splice(0, reversedMessages!.length - messageStart);
            processedMessages = reversedMessages!.slice().reverse();
            processedMessages!.unshift({ role: 'assistant', content: summary });
          } catch (ex) {
            if (ex instanceof Error) {
              //await showDialog(ex.message, 'Error');
              throw ex;
            } else {
              await showDialog('An unknown error occurred.', 'Error');
            }
          }
        } else {
          if (messages!.length > 0) {
            processedMessages = [];
            isDeleteHistory = true; // 履歴削除フラグを立てる
          }
        }
      } else {
        processedMessages = messages!.slice();
      }

      if (!isNullOrWhiteSpace(roomState.systemMessage)) {
        //システムメッセージがあれば一旦全削除
        const itemToRemove = await getSystemMessageItem(processedMessages);
        if (itemToRemove != null) {
          processedMessages!.splice(processedMessages!.indexOf(itemToRemove), 1);
        }

        // 一番先頭に再挿入
        processedMessages!.unshift({ role: 'system', content: roomState.systemMessage! });
      }

      const chat = createChat({
        apiKey: apiKey,
        model: model,
      });

      //最終的なプロンプトトークン数をカウント
      const prompts = processedMessages!.map((message) => {
        return message.content;
      });
      const promptTokens: number = encode(prompts.join()).length;

      //会話履歴を入力
      for (const message of processedMessages!) {
        chat.addMessage(message);
      }

      try {
        // ユーザー入力を送信
        await chat.sendMessage(roomState.userInput, (response) => {
          if (response.message?.choices === undefined) return;
          if (response.message?.choices[0].delta === undefined) return;

          const delta = response.message.choices[0].delta;
          if ('content' in delta) {
            const content = delta.content;
            setCurrentMessages((currentMessages) => {
              const newMessages = currentMessages.map((message: Message) => {
                if (message.id === roomState.lastAssistantMessageId) {
                  const newAssistantText = message.content + content;
                  const comletionTokens: number = encode(newAssistantText).length;
                  const newMessage = {
                    ...message,
                    content: newAssistantText,
                    usage:
                      '[tokens] prompt:' +
                      promptTokens +
                      ', completion:' +
                      comletionTokens +
                      ', total:' +
                      (promptTokens + comletionTokens) +
                      (isSummarized
                        ? `\n-Conversation history has been summarized. before: ${preSummarizedHistoryTokenCount}`
                        : ``) +
                      (isDeleteHistory
                        ? `\n-Conversation history has been deleted. before: ${preSummarizedHistoryTokenCount}`
                        : ``),
                    date: new Date(),
                  };
                  updatedMessage = newMessage; // 更新されたメッセージを保持
                  return newMessage;
                } else {
                  return message;
                }
              });
              return newMessages;
            });
          } else if ('role' in delta) {
            //do nothing
          } else if (response.message.choices[0].finish_reason === 'stop') {
            if (updatedMessage) {
              const postedConversation: Chat[] = [
                ...processedMessages,
                { role: 'user', content: roomState.userInput! },
                { role: 'assistant', content: updatedMessage.content },
              ];
              setRoomState((prev) => ({
                ...prev,
                lastAssistantMessage: updatedMessage!,
                isAssistantMessageRecievedDone: true,
                json: postedConversation,
                jsonPrev: processedMessages,
              }));
            } else {
              throw new Error('Unexpected message');
            }
          } else if (response.message.choices[0].finish_reason !== 'stop') {
            throw new Error('Unexpected message');
          }
        });
      } catch (ex) {
        if (ex instanceof Error) {
          await showDialog(ex.message + ex.stack, 'Error');
        } else {
          await showDialog('An unknown error occurred.', 'Error');
        }
      }
    };
    getAssistantMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState.isNewInputAdded]);

  //受信完了処理とデータベース更新
  useEffect(() => {
    if (!roomState.isAssistantMessageRecievedDone) {
      return;
    }

    const setAssistantMessage = async () => {
      // sendMessageが完了した後にデータベースを更新
      try {
        if (isNullOrWhiteSpace(roomState.currentRoomName)) {
          //roomState.jsonを反復
          let forNamingString = '';
          for (const message of roomState.json!) {
            if (message.role === 'user' || message.role === 'assistant') {
              forNamingString += message.content + '\n';
            }
          }
          const roomName: string = await getRoomNameAsync(forNamingString, apiKey!, model!);
          await updateChatRoomNameDb(roomState.currentRoomId!, roomName);
          const rooms = await getChatRoomsDb();
          setRoomState((prev) => ({ ...prev, currentRoomName: roomName, chatRooms: rooms }));
        }
        await updateAssistantMessageDb(
          roomState.currentRoomId!,
          roomState.lastAssistantMessageId!,
          roomState.lastAssistantMessage!,
          roomState.json!,
          roomState.jsonPrev!,
          roomState.userInput
        );
      } catch (ex) {
        if (ex instanceof Error) {
          await showDialog(ex.message + ex.stack, 'Error');
        } else {
          await showDialog('An unknown error occurred.', 'Error');
        }
      }
    };
    setAssistantMessage();

    setRoomState((prevState) => ({
      ...prevState,
      isNewInputAdded: false,
      userInput: '',
      isAssistantMessageRecievedDone: false,
    }));

    console.log(roomState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState.isAssistantMessageRecievedDone]);
}

//システムメッセージ検索関数
async function getSystemMessageItem(conversationHistory: Chat[] | null) {
  for (let item of conversationHistory!) {
    if (item.role && item.content && item.role === 'system') {
      return item;
    }
  }
  return null;
}

//要約関数
async function getSummaryAsync(text: string, apiKey: string, model: string): Promise<string> {
  const chat = createChat({
    apiKey: apiKey!,
    model: model!,
  });

  chat.addMessage({
    role: 'system',
    content:
      'You are a professional editor. Please summarize the following chat log in about 300 tokens using the language in which the text is written. For a text that includes multiple conversations, the conversation set that appears at the beginning is the most important.',
  });

  const response = await chat.sendMessage(text);

  return response.content;
}

//タイトル命名関数
async function getRoomNameAsync(text: string, apiKey: string, model: string): Promise<string> {
  const chat = createChat({
    apiKey: apiKey!,
    model: model!,
  });

  chat.addMessage({
    role: 'system',
    content:
      'あなたはプロの編集者です。これから送るチャットログにチャットタイトルをつけてそれだけを回答してください。\n' +
      '- チャットの会話で使われている言語でタイトルを考えてください。\n' +
      '- ログは冒頭に行くほど重要な情報です。\n' +
      '# 制約条件\n' +
      '- 「」や"\'などの記号を使わないこと。\n' +
      '- 句読点を使わないこと。\n' +
      '- 短くシンプルに、UNICODEの全角文字に換算して最大でも16文字を絶対に超えないように。これは重要な条件です。\n' +
      '# 例\n' +
      '宣言型モデルとフロントエンド\n' +
      '日英翻訳',
  });

  const response = await chat.sendMessage(text);

  return response.content;
}

// Nullまたは空白文字の判定関数
function isNullOrWhiteSpace(str: string | null | undefined): boolean {
  return !str || str.trim() === '';
}
