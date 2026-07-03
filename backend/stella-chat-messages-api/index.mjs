import { saveMessageToDB, getMessagesByProjectId } from './messageService.mjs';
import { callAiApi } from './aiService.mjs';

// 環境変数から許可するオリジンのリスト（カンマ区切りの文字列）を取得します。
const ALLOWED_ORIGINS_STR = process.env.ALLOWED_ORIGINS || "";

// 取得した文字列をカンマで分割し、許可するURLの配列を作成します。
const allowedOrigins = ALLOWED_ORIGINS_STR.split(",");

// Lambda関数のメインエントリポイントとなるハンドラー関数です。
export const handler = async (event) => {

  // デバッグ用に受信したイベント全体をログに出力します。
  console.log("受信したイベント:", JSON.stringify(event));

  // リクエストのヘッダー情報から、アクセス元のオリジン（URL）を取得します。
  const requestOrigin = event.headers?.origin;

  // 実際に許可するオリジンを格納する変数を宣言し、安全のためデフォルトを配列の先頭要素にします。
  let responseOrigin = allowedOrigins[0];

  // アクセス元のURLが、環境変数で設定した許可リストの配列に含まれているか判定します。
  if (allowedOrigins.includes(requestOrigin)) {

    // 許可リストに含まれている場合、そのアクセス元URLをそのまま返却用オリジンに設定します。
    responseOrigin = requestOrigin;
  }

  // CORS対応とデータ形式指定のための共通レスポンスヘッダーを定義します。
  const headers = {

    // 動的に判定したアクセス元URLを、許可するオリジンとして設定します。
    "Access-Control-Allow-Origin": responseOrigin,

    // レスポンスのデータ形式がJSONであることを指定します。
    "Content-Type": "application/json",

    // 許可するHTTPメソッドを指定します。
    "Access-Control-Allow-Methods": "OPTIONS, GET, POST",

    // 許可するHTTPヘッダーを指定します。
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // Function URLから渡されたHTTPメソッドを取得します。
  const method = event.requestContext?.http?.method;

  // ブラウザからの事前リクエスト（CORSプレフライト）に対する処理です。
  if (method === "OPTIONS") {

    // 正常なステータスコード200とヘッダーのみを返却して通信を許可します。
    return { statusCode: 200, headers: headers, body: "OK" };
  }

  // 予期せぬエラーを捕捉するためのtry-catchブロックを開始します。
  try {

    // HTTPメソッドが「GET」（履歴取得）である場合の処理ルートです。
    if (method === "GET") {

      // クエリパラメータからプロジェクトIDを取得します。
      const projectId = event.queryStringParameters?.projectId;

      // プロジェクトIDが未指定の場合はエラーを投げて処理を中断します。
      if (!projectId) throw new Error("プロジェクトIDが未指定です");

      // データベースからプロジェクトのメッセージ履歴を取得します。
      const messages = await getMessagesByProjectId(projectId);

      // 取得した履歴データをJSON文字列に変換し、ステータスコード200で返却します。
      return { statusCode: 200, headers: headers, body: JSON.stringify(messages) };
    }

    // HTTPメソッドが「POST」（メッセージ送信）である場合の処理ルートです。
    if (method === "POST") {

      // リクエストボディをJSONとしてパース（変換）します。
      const body = JSON.parse(event.body || "{}");

      // ボディからプロジェクトIDを抽出します。
      const projectId = body.projectId;

      // ボディからユーザーのメッセージテキストを抽出します（空の場合は代替テキストを設定）。
      const userMessage = body.message || "（画像が送信されました）";

      // プロジェクトIDが存在する場合、ユーザーのメッセージをDynamoDBに保存します。
      if (projectId) await saveMessageToDB(projectId, 'user', userMessage);

      // 分離したaiServiceを使ってBedrockから返答を取得します（※ここで時間がかかりますがタイムアウトしません）。
      const aiReplyText = await callAiApi(body);

      // プロジェクトIDが存在する場合、生成されたAIの返答をDynamoDBに保存します。
      if (projectId) await saveMessageToDB(projectId, 'assistant', aiReplyText);

      // AIの返答テキストをJSON文字列に変換し、ステータスコード200で返却します。
      return { statusCode: 200, headers: headers, body: JSON.stringify({ reply: aiReplyText }) };
    }

    // GETとPOST以外の想定外のメソッドで呼ばれた場合は、405エラーを返します。
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: "Method Not Allowed" }) };

  // エラーが発生した場合の処理ブロックです。
  } catch (error) {

    // エラー内容の詳細をコンソール（CloudWatch Logs）に出力します。
    console.error("ハンドラー実行エラー:", error);

    // クライアントに返すための安全なエラーメッセージを用意します。
    const errorMessage = error.message || "内部サーバーエラーが発生しました。";

    // エラー時のレスポンスオブジェクトを構築して、ステータスコード500で返却します。
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: errorMessage }) };
  }
};