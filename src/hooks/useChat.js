// Reactから状態管理と副作用のフックをインポートします。
import { useState, useEffect } from 'react';

// Amplifyから認証セッションを取得する関数をインポートします。
import { fetchAuthSession } from 'aws-amplify/auth';

// Amplifyからユーザー属性を取得する関数をインポートします。
import { fetchUserAttributes } from 'aws-amplify/auth';

// 画像ファイルをBase64文字列（AIに送れる形式）に変換する関数です。
const fileToBase64 = (file) => {

  // 非同期処理を扱うためのPromiseオブジェクトを返します。
  return new Promise((resolve, reject) => {

    // ファイルを読み込むためのFileReaderオブジェクトを生成します。
    const reader = new FileReader();

    // ファイルをData URL（Base64形式）として読み込みを開始します。
    reader.readAsDataURL(file);

    // 読み込みが成功した際に、プレフィックスを除いたBase64文字列を返します。
    reader.onload = () => resolve(reader.result.split(',')[1]);

    // 読み込みに失敗した際に、エラーを返します。
    reader.onerror = (error) => reject(error);

  // Promiseの定義を終了します。
  });

// 関数の定義を終了します。
};

// チャットのメッセージや通信状態を管理するカスタムフックです（第一引数にcurrentProjectを追加）。
export const useChat = (currentProject, attachedFiles = [], clearAttachments = () => {}) => {
    
  // 入力欄のテキストを管理する状態変数です。
  const [inputText, setInputText] = useState('');
  
  // チャット履歴を管理する状態変数です。
  const [messages, setMessages] = useState([]);
  
  // API通信中のローディング状態を管理する状態変数です。
  const [isLoading, setIsLoading] = useState(false);

  // プロジェクトが切り替わった際に、該当プロジェクトの過去の履歴を取得する処理です。
  useEffect(() => {

    // プロジェクトが選択されていない場合は履歴を取得せずに処理を終了します。
    if (!currentProject) return;

    // 過去のメッセージ履歴をAPIから取得する非同期関数を定義します。
    const fetchHistory = async () => {

      // データ取得中であることを画面に知らせるためローディングをオンにします。
      setIsLoading(true);

      // エラー発生時に備えてtry-catchブロックを開始します。
      try {

        // 認証セッションを取得します。
        const session = await fetchAuthSession();

        // IDトークンを取り出します。
        const token = session.tokens.idToken.toString();

        // 環境変数からAPIのエンドポイントURLを取得し、プロジェクトIDをクエリに付与します。
        const apiUrl = `${import.meta.env.VITE_MESSAGES_API_URL}/messages?projectId=${currentProject}`;

        // 履歴取得のGETリクエストをAPIに送信します。
        const response = await fetch(apiUrl, {

          // 認証トークンをヘッダーにセットしてリクエストを送信します。
          headers: { 'Authorization': `Bearer ${token}` }

        // fetchメソッドを終了します。
        });

        // レスポンスが正常でない場合はエラーを投げます。
        if (!response.ok) throw new Error('履歴の取得に失敗しました');

        // レスポンスデータをJSON形式に変換します。
        const data = await response.json();

        // DynamoDBのデータ形式から画面表示用の形式（text, sender等）に変換して状態にセットします。
        const formattedMessages = data.map(msg => ({
          
          // メッセージIDをセットします。
          id: msg.messageId,

          // メッセージ本文をセットします。
          text: msg.content,

          // 送信者のロール（userかaiか）をセットします。
          sender: msg.role === 'user' ? 'user' : 'ai'

        // mapメソッドを終了します。
        }));

        // 変換した過去のメッセージ一覧を画面に反映します。
        setMessages(formattedMessages);

      // エラーをキャッチします。
      } catch (error) {

        // エラー内容をコンソールに出力します。
        console.error('履歴取得エラー:', error);

      } finally {

        // 取得処理が終わったためローディングをオフにします。
        setIsLoading(false);

      }

    };

    // 定義した履歴取得関数を実行します。
    fetchHistory();

  // 依存配列にcurrentProjectを指定し、値が変わるたびに再実行させます。
  }, [currentProject]);

  // メッセージと画像を送信する関数です。
  const handleSendMessage = async () => {
    
    // テキストが空で、かつ画像も添付されていない場合、またはプロジェクト未選択時は処理を終了します。
    if ((!inputText.trim() && attachedFiles.length === 0) || !currentProject) return;

    // 画像の変換には数ミリ秒かかるため、ここで先にローディング状態をオンにします。
    setIsLoading(true);

    // 先に添付された画像をBase64に変換し、配列にまとめます。
    const base64Images = await Promise.all(

      // 添付ファイルの中から画像ファイルのみを抽出します。
      attachedFiles

        // 画像ファイルかどうかを判定します。
        .filter(file => file.type.startsWith('image/'))

        // 各画像ファイルをBase64データに変換する非同期処理をマッピングします。
        .map(async (file) => {

          // 画像変換関数を呼び出します。
          const base64 = await fileToBase64(file);

          // メディアタイプとBase64データを持つオブジェクトを返します。
          return {
            
            // ファイルのMIMEタイプをセットします。
            media_type: file.type,

            // 変換されたBase64文字列をセットします。
            data: base64

          };
        })
    );

    // 生成した画像データを、ユーザーのメッセージオブジェクトにも持たせます。
    const newUserMessage = {
      
      // 現在のタイムスタンプを一時的なIDとして使用します。
      id: Date.now(),

      // 入力テキスト、空なら画像送信の旨をセットします。
      text: inputText || "（画像が送信されました）",

      // 送信者をユーザーに設定します。
      sender: 'user',

      // 変換した画像データを追加します。
      images: base64Images

    // オブジェクトの定義を終了します。
    };

    // メッセージ履歴にユーザーの発言（画像含む）を追加します。
    setMessages(prev => [...prev, newUserMessage]);
    
    // 入力欄を空にします。
    setInputText('');
    
    // 添付ファイルをクリアします。
    clearAttachments();

    // APIリクエストのためのtry-catchブロックを開始します。
    try {

        // 認証セッションを取得します。
        const session = await fetchAuthSession();
        
        // IDトークンを取り出します。
        const token = session.tokens.idToken.toString();

        // APIのエンドポイントURLを設定します。
        const apiUrl = `${import.meta.env.VITE_MESSAGES_API_URL}/messages`;
        
        // Cognitoから現在ログイン中のユーザー情報を取得します。
        const attributes = await fetchUserAttributes();

        // ユーザーID（sub）を抽出します。
        const userId = attributes.sub; 

        // 現在のチャット履歴を、AIが理解できる形式（roleとcontent）に変換します。
        const chatHistory = messages

          // テキストが空やundefinedのメッセージを除外します。
          .filter((msg) => msg.text && msg.text.trim() !== "")

          // roleとcontentの形式にマッピングします。
          .map((msg) => ({
            
            // 送信者がユーザーかAIかを判定してroleをセットします。
            role: msg.sender === 'user' ? 'user' : 'assistant',

            // メッセージ本文をセットします。
            content: msg.text

          // mapメソッドを終了します。
          }));

        // APIにPOSTリクエストを送信します。
        const response = await fetch(apiUrl, {

            // HTTPメソッドをPOSTに設定します。
            method: 'POST',

            // リクエストヘッダーにJSON形式と認証トークンを指定します。
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },

            // リクエストボディに各データをJSON文字列化してセットします。
            body: JSON.stringify({
              
              // 現在のプロジェクトIDを追加します（バックエンドでの保存用）。
              projectId: currentProject,

              // ユーザーの入力メッセージをセットします。
              message: newUserMessage.text,

              // ユーザーIDをセットします。
              userId: userId,

              // 添付画像データをセットします。
              images: base64Images,

              // これまでのチャット履歴をセットします。
              history: chatHistory

            // JSON.stringifyを終了します。
            })

        // fetchメソッドを終了します。
        });

        // レスポンスデータをJSONとして取得します。
        const data = await response.json();
      
        // 返答テキスト用の変数を初期化します。
        let aiText = "";
        
        // 成功したかどうかを確認してテキストをセットします。
        if (data.reply) {

            // 返答テキストをセットします。
            aiText = data.reply;

        // エラーが含まれているか確認します。
        } else if (data.error) {

            // エラーメッセージをセットします。
            aiText = `エラー: ${data.error}`;

        // それ以外のフォーマットの場合の処理です。
        } else {

            // 文字列ならそのまま、オブジェクトならJSON文字列化してセットします。
            aiText = typeof data === 'string' ? data : JSON.stringify(data);

        // 条件分岐を終了します。
        }

        // AIのメッセージオブジェクトを作成します。
        const aiResponse = {

            // タイムスタンプを使って一時的なIDを付与します。
            id: Date.now() + 1,

            // 決定したAIの返答テキストをセットします。
            text: aiText,

            // 送信者をAIに設定します。
            sender: 'ai'

        // オブジェクトの定義を終了します。
        };

        // チャット履歴にAIの返答を追加します。
        setMessages(prev => [...prev, aiResponse]);

    // エラーをキャッチします。
    } catch (error) {

        // 通信エラーをコンソールに出力します。
        console.error('💥 API通信エラー:', error);
        
        // エラーメッセージをチャット画面に表示します。
        setMessages(prev => [...prev, {

            // タイムスタンプを使って一時的なIDを付与します。
            id: Date.now() + 1,

            // エラー時の定型文をセットします。
            text: "申し訳ありません。通信エラーが発生しました。",

            // 送信者をAIに設定します。
            sender: 'ai'

        // 状態更新関数を終了します。
        }]);

    // 成功失敗に関わらず実行するブロックです。
    } finally {

        // 処理が全て終わったらローディング状態を解除します。
        setIsLoading(false);

    // try-catchブロックを終了します。
    }

  // 送信関数の定義を終了します。
  };

  // 必要な状態と関数を返却します。
  return {

    // 入力中のテキストです。
    inputText,

    // テキスト更新関数です。
    setInputText,

    // メッセージ履歴の配列です。
    messages,

    // ローディング状態です。
    isLoading,

    // 送信処理関数です。
    handleSendMessage

  // 返却オブジェクトを終了します。
  };

// フックの定義を終了します。
};