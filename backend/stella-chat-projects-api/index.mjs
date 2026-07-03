import { getProjects, createProject, deleteProject } from './businessLogic.mjs';

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
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",

    // 許可するHTTPヘッダーを指定します。
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
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

      // クエリパラメータをビジネスロジックに渡してプロジェクト一覧を取得します。
      const result = await getProjects(event.queryStringParameters);

      // 処理結果をJSON文字列に変換し、ステータスコード200で返却します。
      return { statusCode: 200, headers: headers, body: JSON.stringify(result) };
    }

    // HTTPメソッドが「POST」である場合の処理ルートです。
    if (method === "POST") {

      // リクエストボディをビジネスロジックに渡してプロジェクトを作成します。
      const result = await createProject(event.body);

      // 作成成功のステータスコード201で、結果を返却します。
      return { statusCode: 201, headers: headers, body: JSON.stringify(result) };
    }

    // HTTPメソッドが「DELETE」である場合の処理ルートです。
    if (method === "DELETE") {

      // クエリパラメータをビジネスロジックに渡してプロジェクトと関連ログを削除します。
      const result = await deleteProject(event.queryStringParameters);

      // 削除成功を示すステータスコード200で、結果をJSONにして返却します。
      return { statusCode: 200, headers: headers, body: JSON.stringify(result) };
    }

    // 想定外のメソッドで呼ばれた場合はエラーを返します。
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: "許可されていないメソッドです" }) };

  } catch (error) {
    // エラーの発生をコンソール（CloudWatch Logs）に出力します。
    console.error("システムエラー発生:", error);

    // プロジェクト名が未入力だった場合のカスタムエラーを判定します。
    if (error.message === "プロジェクト名が必要です") {

      // ユーザーの入力ミスとしてステータスコード400で返却します。
      return { statusCode: 400, headers: headers, body: JSON.stringify({ error: error.message }) };
    }

    // 環境変数（テーブル名）の設定漏れによるエラーかどうかを判定します。
    if (error.message && error.message.includes("TABLE_NAME")) {
        
      // テーブル名設定エラーの詳細をステータスコード500で返却します。
      return { statusCode: 500, headers: headers, body: JSON.stringify({ message: "サーバー設定エラー", error: error.message }) };
    }

    // 予期せぬサーバー内部エラーをステータスコード500で返却します。
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "サーバー内部でエラーが発生しました" }) };
  }
};