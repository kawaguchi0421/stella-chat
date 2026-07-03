import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import * as crypto from "crypto";

// 環境変数のリージョンを使用してDynamoDBクライアントを初期化します。
const client = new DynamoDBClient({});

// より扱いやすいドキュメントクライアントを生成します。
const docClient = DynamoDBDocumentClient.from(client);

// 環境変数からメッセージ保存用のテーブル名を取得します。
const TABLE_NAME = process.env.DYNAMODB_MESSAGES_TABLE_NAME;

// メッセージをDynamoDBに保存する非同期関数をエクスポートします。
export const saveMessageToDB = async (projectId, role, content) => {

    // 現在の日時をISO8601形式の文字列として取得します。
    const createdAt = new Date().toISOString();

    // ランダムで一意なUUIDをメッセージIDとして生成します。
    const messageId = crypto.randomUUID();

    // データベースに保存するためのアイテムオブジェクトを作成します。
    const item = {

        // プロジェクトIDをパーティションキーとして設定します。
        projectId: projectId,

        // 作成日時をソートキーとして設定します。
        createdAt: createdAt,

        // メッセージ固有のIDを設定します。
        messageId: messageId,

        // 送信者のロール（user または assistant）を設定します。
        role: role,

        // メッセージのテキスト内容を設定します。
        content: content
    };

    // DynamoDBへ書き込むためのパラメータを設定します。
    const params = {

        // 保存先のテーブル名を指定します。
        TableName: TABLE_NAME,

        // 保存するデータ本体を指定します。
        Item: item

    };

    // PutCommandをインスタンス化して保存コマンドを作成します。
    const command = new PutCommand(params);

    // DynamoDBに対してデータ保存のコマンドを実行します。
    await docClient.send(command);

    // 保存したアイテムデータを呼び出し元に返します。
    return item;

};

// 特定のプロジェクトのメッセージ履歴を取得する非同期関数をエクスポートします。
export const getMessagesByProjectId = async (projectId) => {

    // DynamoDBからデータを検索（クエリ）するためのパラメータを定義します。
    const params = {

        // 検索対象となるテーブルの名前を指定します。
        TableName: TABLE_NAME,

        // パーティションキー（projectId）が一致するものを探す条件式を指定します。
        KeyConditionExpression: "projectId = :projectId",

        // プレースホルダー（:projectId）に代入する実際の値を指定します。
        ExpressionAttributeValues: {

            // 検索対象のプロジェクトIDの値をセットします。
            ":projectId": projectId

        }
    };

    // QueryCommandをインスタンス化して検索コマンドを作成します。
    const command = new QueryCommand(params);

    // DynamoDBに対してデータ検索のコマンドを実行します。
    const response = await docClient.send(command);

    // 取得したアイテムの配列を返し、データがない場合は空配列を返します。
    return response.Items || [];

};