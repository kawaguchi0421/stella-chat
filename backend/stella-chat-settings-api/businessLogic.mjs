import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// DynamoDBクライアントを初期化します。
const client = new DynamoDBClient({});

// 基本クライアントをドキュメントクライアントに変換します。
const dynamo = DynamoDBDocumentClient.from(client);

// 環境変数からDynamoDBのテーブル名を取得します。
const TABLE_NAME = process.env.TABLE_NAME;

// テーブル名が設定されていない場合、起動時にエラーをスローします。
if (!TABLE_NAME) {

  // 開発者に設定を促すエラーメッセージを出力します。
  throw new Error("環境変数 'TABLE_NAME' が設定されていません。");
}

// 設定情報を取得するビジネスロジック関数です。
export const getSettings = async (queryParams) => {

  // クエリパラメータからユーザーIDを取得します。
  const userId = queryParams?.userId;

  // ユーザーIDが指定されていない場合はエラーをスローします。
  if (!userId) {

    // 呼び出し元（index.mjs）に捕捉させるためのエラーを投げます。
    throw new Error("userId is required");
  }

  // DynamoDBからデータを取得する（Get）ためのコマンドを準備します。
  const command = new GetCommand({

    // 検索対象のテーブル名を指定します。
    TableName: TABLE_NAME,

    // 取得する対象のキー（userId）を指定します。
    Key: { userId: userId }
  });

  // 設定したコマンドをDynamoDBに送信し、結果を受け取ります。
  const response = await dynamo.send(command);

  // 取得したデータ（Item）を返し、データがない場合は空のオブジェクトを返します。
  return response.Item || {};
};

// 設定情報を保存・更新するビジネスロジック関数です。
export const saveSettings = async (bodyString) => {

  // リクエストボディのJSON文字列をJavaScriptのオブジェクトに変換します。
  const body = JSON.parse(bodyString || "{}");

  // ボディオブジェクトからユーザーIDを抽出します。
  const userId = body.userId;

  // ボディオブジェクトからシステムプロンプトの設定値を抽出します。
  const systemPrompt = body.systemPrompt;

  // ユーザーIDが指定されていない場合はエラーをスローします。
  if (!userId) {

    // 呼び出し元（index.mjs）に捕捉させるためのエラーを投げます。
    throw new Error("userId is required");
  }

  // DynamoDBに保存するデータの形（オブジェクト）を構築します。
  const item = {

    // 抽出したユーザーIDをセットします。
    userId: userId,

    // 抽出したシステムプロンプトをセットします。
    systemPrompt: systemPrompt,

    // 更新日時をISO形式の文字列（標準的な日時フォーマット）で記録します。
    updatedAt: new Date().toISOString()
  };

  // 作成したデータをDynamoDBのテーブルに保存（Put）するコマンドを準備します。
  const command = new PutCommand({

    // 保存先のテーブル名を指定します。
    TableName: TABLE_NAME,

    // 保存するデータ本体（作成したオブジェクト）を指定します。
    Item: item
  });

  // 準備したコマンドをDynamoDBに送信し、データの保存を実行します。
  await dynamo.send(command);

  // 保存が成功したことを示すメッセージを呼び出し元に返却します。
  return { message: "Settings saved" };
};