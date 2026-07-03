import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

// DynamoDBクライアントを初期化します。
const client = new DynamoDBClient({});

// 基本クライアントをドキュメントクライアントに変換します。
const docClient = DynamoDBDocumentClient.from(client);

// 環境変数からDynamoDBのテーブル名を取得します。
const TABLE_NAME = process.env.TABLE_NAME;

// テーブル名が設定されていない場合、起動時に直ちにエラーをスローします。
if (!TABLE_NAME) {

  // 開発者に設定を促すエラーメッセージを出力します。
  throw new Error("環境変数 'TABLE_NAME' が設定されていません。");
}

// 環境変数からメッセージログ用テーブルの名前を取得します。
const MESSAGES_TABLE_NAME = process.env.MESSAGES_TABLE_NAME;

// メッセージ用テーブル名が設定されていない場合、起動時に直ちにエラーをスローします。
if (!MESSAGES_TABLE_NAME) {

  // 開発者に設定を促すエラーメッセージを出力します。
  throw new Error("環境変数 'MESSAGES_TABLE_NAME' が設定されていません。");
}

// プロジェクト一覧を取得するビジネスロジック関数です。
export const getProjects = async (queryParams) => {

  // クエリパラメータからユーザーIDを取得します。
  const userId = queryParams?.userId;

  // DynamoDBからデータを検索（Query）するための条件オブジェクトを作成します。
  const params = {

    // 検索対象のテーブル名を指定します。
    TableName: TABLE_NAME,

    // パーティションキー（userId）が一致するものを探す条件式を定義します。
    KeyConditionExpression: "userId = :uid",

    // 条件式の中の変数を実際の値に置き換える設定を行います。
    ExpressionAttributeValues: {

      // 変数 :uid に 取得したuserId の値をセットします。
      ":uid": userId
    }
  };

  // 設定した条件でDynamoDBに検索コマンドを送信し、結果を受け取ります。
  const data = await docClient.send(new QueryCommand(params));

  // 取得したデータ配列（Items）のみを呼び出し元（index.js）に返却します。
  return data.Items;
};


// 新しいプロジェクトを作成するビジネスロジック関数です。
export const createProject = async (bodyString) => {

  // リクエストボディのJSON文字列をJavaScriptのオブジェクトに変換します。
  const body = JSON.parse(bodyString || "{}");

  // ボディオブジェクトからユーザーIDを抽出します。
  const userId = body.userId;

  // ボディオブジェクトからプロジェクト名を抽出します。
  const projectName = body.projectName;

  // プロジェクト名が空（未入力）の場合はエラーをスローして処理を中断します。
  if (!projectName) {

    // 呼び出し元（index.js）に捕捉させるためのエラーを投げます。
    throw new Error("プロジェクト名が必要です");
  }

  // 現在の時刻（ミリ秒）を使って、他と被らない一意のプロジェクトIDを生成します。
  const projectId = `proj-${Date.now()}`;

  // DynamoDBに保存するデータの形（オブジェクト）を構築します。
  const item = {

    // 抽出したユーザーIDをセットします。
    userId: userId,

    // 生成したプロジェクトIDをセットします。
    projectId: projectId,

    // 抽出したプロジェクト名をセットします。
    projectName: projectName,

    // 作成日時をISO形式の文字列（標準的な日時フォーマット）で記録します。
    createdAt: new Date().toISOString()
  };

  // 作成したデータをDynamoDBのテーブルに保存（Put）するコマンドを準備します。
  const putCommand = new PutCommand({

    // 保存先のテーブル名を指定します。
    TableName: TABLE_NAME,
    
    // 保存するデータ本体（作成したオブジェクト）を指定します。
    Item: item
  });

  // 準備したコマンドをDynamoDBに送信し、データの保存を実行します。
  await docClient.send(putCommand);

  // 保存が完了した新しいプロジェクトのデータを呼び出し元に返却します。
  return item;
};

// プロジェクトとそれに紐づくメッセージログをまとめて削除するビジネスロジック関数です。
export const deleteProject = async (queryParams) => {

  // クエリパラメータから削除対象のプロジェクトIDを取得します。
  const projectId = queryParams?.projectId;

  // クエリパラメータから削除対象のユーザーIDを取得します。
  const userId = queryParams?.userId;

  // プロジェクトIDが指定されていない場合のエラーハンドリングです。
  if (!projectId) {

    // 呼び出し元に通知するためのエラーをスローします。
    throw new Error("プロジェクトIDが必要です");
  }

  // ユーザーIDが指定されていない場合のエラーハンドリングです。
  if (!userId) {

    // 呼び出し元に通知するためのエラーをスローします。
    throw new Error("ユーザーIDが必要です");
  }

  // 対象プロジェクトに紐づくメッセージを取得するための条件を設定します。
  const queryParamsForMessages = {

    // 検索対象のメッセージテーブル名を指定します。
    TableName: MESSAGES_TABLE_NAME,

    // パーティションキーが一致するデータを検索する条件式を定義します。
    KeyConditionExpression: "projectId = :pid",

    // 条件式の中の変数に実際のプロジェクトIDをマッピングします。
    ExpressionAttributeValues: {

      // 変数 :pid に取得したプロジェクトIDをセットします。
      ":pid": projectId
    }
  };

  // メッセージテーブルから該当するメッセージ一覧を検索します。
  const queryResult = await docClient.send(new QueryCommand(queryParamsForMessages));

  // 検索結果からメッセージデータの配列を取得します（存在しない場合は空配列）。
  const messages = queryResult.Items || [];

  // 削除すべきメッセージが1件以上存在するかどうかを判定します。
  if (messages.length > 0) {

    // 一括削除リクエストを入れるための配列を用意します。
    const deleteRequests = [];

    // 取得したメッセージの配列をループ処理します。
    for (const message of messages) {

      // 各メッセージの削除リクエストオブジェクトを作成して配列に追加します。
      deleteRequests.push({

        // 削除操作を行うリクエストであることを指定します。
        DeleteRequest: {

          // 削除するレコードを特定するプライマリキーを指定します。
          Key: {

            // パーティションキーであるプロジェクトIDを設定します。
            projectId: message.projectId,

            // ソートキーである作成日時を設定します。
            createdAt: message.createdAt
          }
        }
      });
    }

    // DynamoDBの仕様に合わせて25件ずつ分割して削除処理を実行します。
    for (let i = 0; i < deleteRequests.length; i += 25) {

      // 全体のリクエスト配列から最大25件分のデータを切り出します。
      const chunk = deleteRequests.slice(i, i + 25);

      // 切り出したデータをもとに一括書き込み（削除）のパラメータを構築します。
      const batchWriteParams = {

        // 操作対象のテーブルとリクエスト内容を指定します。
        RequestItems: {

          // メッセージテーブルに対して切り出した削除リクエストを割り当てます。
          [MESSAGES_TABLE_NAME]: chunk
        }
      };

      // 準備した一括削除コマンドをDynamoDBに送信します。
      await docClient.send(new BatchWriteCommand(batchWriteParams));
    }
  }

  // メッセージの削除完了後、プロジェクト自体を削除するためのパラメータを設定します。
  const deleteProjectParams = {

    // 削除対象のプロジェクトテーブル名を指定します。
    TableName: TABLE_NAME,

    // 削除するプロジェクトレコードを特定するプライマリキーを指定します。
    Key: {

      // パーティションキーであるユーザーIDを設定します。
      userId: userId,

      // ソートキーであるプロジェクトIDを設定します。
      projectId: projectId
    }
  };

  // プロジェクト本体の削除コマンドをDynamoDBに送信します。
  await docClient.send(new DeleteCommand(deleteProjectParams));

  // 削除処理がすべて正常に完了したことを示す結果を返却します。
  return { message: "プロジェクトと関連ログの削除が完了しました" };
};