import { useEffect } from 'react';
import { createChat } from 'completions';
import { encode } from 'gpt-tokenizer';
import { Message } from '../types/types';
import { getMessagesDb, updateAssistantMessageDb } from '../services/supabaseDb';
import { useDialogStore } from '../store/dialogStore';
import { useChatStore } from '../store/chatStore';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import { Chat } from '../types/types';

export async function useProcessSendMessage() {
  const currentMessages = useChatStore<Message[]>((state) => state.currentMessages);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const apiKey = useUserStore<string | null>((state) => state.apiKey);
  const model = useAppStore<string | null>((state) => state.apiModel);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const showDialog = useDialogStore((state) => state.showDialog);

  useEffect(() => {
    if (!roomState.isNewInputAdded || !apiKey || !model || roomState.userInput === '') return;

    const getAssistantMessage = async () => {
      // ユーザー入力以外のメッセージを取得
      const messages = currentMessages.slice(0, -2).map((message) => {
        return { role: message.role, content: message.text };
      });

      //会話履歴にセット
      setRoomState((prev) => ({ ...prev, conversationHistory: messages }));

      const inputTokenCount = encode(roomState.userInput as string).length; // 入力文字列のトークン数を取得

      // 過去の会話履歴と現在の入力を結合する前に、過去の会話履歴に含まれるcontent文字列のトークン数を取得
      const historyContentTokenCount = roomState.conversationHistory!.reduce(
        (prev, curr) => prev + encode(curr.content).length,
        0
      );

      setRoomState((prev) => ({
        ...prev,
        preSummarizedHistoryTokenCount: historyContentTokenCount, // 要約前のトークン数を記録
        isSummarized: false, // 要約フラグをリセット
        isDeleteHistory: false, // 履歴削除フラグをリセット
      }));

      // トークン関連のデフォルト値を設定
      const maxContentLength = 3072;

      // 履歴を逆順にして保存
      let reversedHistoryList: Chat[] = [...roomState.conversationHistory!].reverse();

      // そもそもユーザー入力が4096を超えている場合はエラー
      if (inputTokenCount > 4096) {
        await showDialog(
          `The values for input text (${inputTokenCount}) exceeds 4097 tokens. Please reduce by at least ${
            inputTokenCount - 4096
          } tokens.`,
          'Error'
        );
        return [];
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
            let summary = await GetSummaryAsync(forCompMes as string);
            summary = roomState.currentRoomName + ': ' + summary;

            let summaryLog = '';

            if (messageStart > 0) {
              summaryLog += `${messageStart} latest message(s) \n\n ${summary}`;
            } else {
              summaryLog = summary;
            }

            console.log(summaryLog);

            roomState.isSummarized = true; // 要約フラグを立てる

            // 返ってきた要約文でconversationHistoryを書き換える
            roomState.conversationHistory!.reverse();
            roomState.conversationHistory!.splice(0, roomState.conversationHistory!.length - messageStart);
            roomState.conversationHistory!.unshift({ role: 'assistant', content: summary });
          } catch (ex) {
            if (ex instanceof Error) {
              await showDialog(ex.message, 'Error');
            } else {
              await showDialog('An unknown error occurred.', 'Error');
            }
          }
        } else {
          if (roomState.conversationHistory!.length > 0) {
            roomState.conversationHistory!.length = 0;
            setRoomState((prev) => ({ ...prev, isDeleteHistory: true })); // 履歴削除フラグを立てる
          }
        }
      }

      if (!isNullOrWhiteSpace(roomState.systemMessage)) {
        //システムメッセージがあれば一旦全削除
        const itemToRemove = getSystemMessageItem(roomState.conversationHistory!);
        if (itemToRemove != null) {
          roomState.conversationHistory!.splice(roomState.conversationHistory!.indexOf(itemToRemove), 1);
        }

        // 一番先頭に再挿入
        roomState.conversationHistory!.unshift({ role: 'system', content: roomState.systemMessage! });
      }

      const chat = createChat({
        apiKey: apiKey,
        model: model,
      });

      const prompts = roomState.conversationHistory!.slice(0, -1).map((message) => {
        return message.content;
      });
      const promptTokens: number = encode(prompts.join()).length;

      for (const message of roomState.conversationHistory!) {
        chat.addMessage(message);
      }

      let updatedMessage: Message | null = null; // 更新されたメッセージを保持する変数

      try {
        await chat.sendMessage(roomState.userInput, (message) => {
          if (message.message?.choices === undefined) return;
          if (message.message?.choices[0].delta === undefined) return;

          const delta = message.message.choices[0].delta;
          if ('content' in delta) {
            const content = delta.content;
            setCurrentMessages((currentMessages) => {
              const newMessages = currentMessages.map((message: Message) => {
                if (message.id === roomState.lastAssistantMessageId) {
                  const newAssistantText = message.text + content;
                  const comletionTokens: number = encode(newAssistantText).length;
                  const newMessage = {
                    ...message,
                    text: newAssistantText,
                    usage:
                      '[tokens] prompt:' +
                      promptTokens +
                      ', completion:' +
                      comletionTokens +
                      ', total:' +
                      (promptTokens + comletionTokens) +
                      (roomState.isSummarized ??
                        `-Conversation history has been summarized. before: ${roomState.preSummarizedHistoryTokenCount}`) +
                      (roomState.isDeleteHistory ??
                        `-Conversation history has been deleted. before: ${roomState.preSummarizedHistoryTokenCount}`),
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
          } else if (message.message.choices[0].finish_reason !== 'stop') {
            throw new Error('Unexpected message');
          }
        });
      } catch (ex) {
        if (ex instanceof Error) {
          await showDialog(ex.message, 'Error');
        } else {
          await showDialog('An unknown error occurred.', 'Error');
        }
      }

      // sendMessageが完了した後にデータベースを更新
      if (updatedMessage) {
        await updateAssistantMessageDb(roomState.currentRoomId!, updatedMessage);
      }
    };
    getAssistantMessage();

    setRoomState((prevState) => ({
      ...prevState,
      isNewInputAdded: false,
      userInput: '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState.isNewInputAdded]);

  return;
}

//システムメッセージ検索メソッド
function getSystemMessageItem(conversationHistory: Chat[] | null) {
  for (let item of conversationHistory!) {
    if (item.role && item.content && item.role === 'system') {
      return item;
    }
  }
  return null;
}

//要約メソッド
async function GetSummaryAsync(text: string): Promise<string> {
  const apiKey = useUserStore<string | null>((state) => state.apiKey);
  const model = useAppStore<string | null>((state) => state.apiModel);

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

// Nullまたは空白文字の判定
function isNullOrWhiteSpace(str: string | null | undefined): boolean {
  return !str || str.trim() === '';
}
