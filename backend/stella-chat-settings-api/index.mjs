import { getSettings, saveSettings } from './businessLogic.mjs';

// 環境変数から許可するオリジンのリスト（カンマ区切りの文字列）を取得します。
const ALLOWED_ORIGINS_STR = process.env.ALLOWED_ORIGINS || "";

// 取得した文字列をカンマで分割し、許可するURLの配列を作成します。
const allowedOrigins = ALLOWED_ORIGINS_STR.split(",");

// Lambda関数のメインエントリポイントとなるハンドラー関数です。
export const handler = async (event) => {

  // リクエストのヘッダー情報から、アクセス元のオリジン（URL）を取得します。
  const requestOrigin = event.headers?.origin;

  // 実際に許可するオリジンを格納する変数を宣言し、安全のためデフォルトを配列の先頭要素にします。
  let responseOrigin = allowedOrigins[0];

  // アクセス元のURLが、環境変数で設定した許可リストの配列に含まれているか判定します。
  if (allowedOrigins.includes(requestOrigin)) {

    // 許可リストに含まれている場合、そのアクセス元URLをそのまま返却用オリジンに設定します。
    responseOrigin = requestOrigin;
  }

  // CORS対応のための共通レスポンスヘッダーを定義します。
  const headers = {

    // 動的に判定したアクセス元URLを、許可するオリジンとして設定します。
    "Access-Control-Allow-Origin": responseOrigin,

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

  try {
    // HTTPメソッドが「GET」である場合の処理ルートです。
    if (method === "GET") {

      // クエリパラメータをビジネスロジックに渡して設定情報を取得します。
      const result = await getSettings(event.queryStringParameters);

      // 処理結果をJSON文字列に変換し、ステータスコード200で返却します。
      return { statusCode: 200, headers: headers, body: JSON.stringify(result) };
    }

    // HTTPメソッドが「POST」である場合の処理ルートです。
    if (method === "POST") {

      // リクエストボディをビジネスロジックに渡して設定情報を保存します。
      const result = await saveSettings(event.body);

      // 処理結果をJSON文字列に変換し、ステータスコード200で返却します。
      return { statusCode: 200, headers: headers, body: JSON.stringify(result) };
    }

    // GETとPOST以外の想定外のメソッドで呼ばれた場合はエラーを返します。
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: "許可されていないメソッドです" }) };

  } catch (error) {
    // エラーの発生をコンソール（CloudWatch Logs）に出力します。
    console.error("システムエラー発生:", error);

    // ユーザーIDが未入力だった場合のカスタムエラーを判定します。
    if (error.message === "userId is required") {

      // ユーザーの入力ミスとしてステータスコード400で返却します。
      return { statusCode: 400, headers: headers, body: JSON.stringify({ error: error.message }) };
    }

    // 予期せぬサーバー内部エラーをステータスコード500で返却します。
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "サーバー内部でエラーが発生しました" }) };
  }
};