import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Bedrockクライアントを初期化します。
const client = new BedrockRuntimeClient({ region: "ap-northeast-1" });

// DynamoDBクライアントを初期化します。
const dynamoClient = new DynamoDBClient({});

// ドキュメントクライアントを生成します。
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

// 環境変数から設定テーブル名を取得します。　
const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME;

// Lambda関数のメイン処理（ハンドラー）を定義してエクスポートします。
export const handler = async (event) => {
  
  // デバッグ用に、API Gatewayから受信したイベントの内容をコンソールに出力します。
  console.log("受信したイベント:", JSON.stringify(event));

  // 予期せぬエラーでLambdaがクラッシュするのを防ぐため、try-catchブロックで囲みます。
  try {
    
    // API Gateway から送られてきたHTTPのボディ（文字列）をJSONオブジェクトに変換します。
    const body = JSON.parse(event.body || "{}");

    // 送信されたメッセージとユーザーIDと会話履歴を変数に取り出します。
    const { message, userId, history = [] } = body;

    // デフォルトのシステムプロンプト（ルール）を設定しておきます。
    let systemPrompt = "あなたは優秀なアシスタントです。丁寧に回答してください。";

    // ユーザーIDが送られてきているか確認します。
    if (userId) {

      // DynamoDBからユーザーの設定を取得するコマンドを準備します。
      const getSettingsCommand = new GetCommand({

        // 検索対象のテーブル名を指定します。
        TableName: SETTINGS_TABLE,

        // 検索キーとしてユーザーIDを指定します。
        Key: { userId: userId }
      });

      // DynamoDBに対してデータ取得を実行します。
      const settingsResponse = await dynamo.send(getSettingsCommand);

      // データが存在し、かつシステムプロンプトが設定されているか確認します。
      if (settingsResponse.Item && settingsResponse.Item.systemPrompt) {

        // ユーザーが設定したルールでデフォルトのプロンプトを上書きします。
        systemPrompt = settingsResponse.Item.systemPrompt;
      }
    }

    // 過去の履歴から、正しくテキスト(content)が入っているものだけを抽出します。
    const bedrockMessages = history
      .filter(msg => msg.content && typeof msg.content === 'string' && msg.content.trim() !== "") 
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // フロントエンドから送られてきた画像の配列を取得します（無ければ空配列）。
    const images = body.images || [];
    
    // 環境変数からモデルIDを取得します。
    const modelId = process.env.MODEL_ID;
    
    // モデルIDが設定されていない場合は、エラーを投げて処理を中断します（フェイルセーフ）。
    if (!modelId) {
      throw new Error("環境変数 'MODEL_ID' が設定されていません。システム管理者に連絡してください。");
    }
    
    // 環境変数から最大トークン数を取得し、文字列から数値（10進数）に変換します（未設定時は1000）。
    const maxTokens = parseInt(process.env.MAX_TOKENS || "1000", 10);

    // Claudeに送るための「メッセージの中身（content）」の配列を準備します。
    const content = [];

    // 画像データが存在する場合、Claudeが読める形式に変換して追加します。
    if (images && images.length > 0) {
      images.forEach(img => {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.media_type,
            data: img.data
          }
        });
      });
    }

    // テキストメッセージを最後に追加します。
    content.push({ type: "text", text: message });

    // これまでの履歴配列の「一番最後」に、今回の新しいメッセージを追加します。
    bedrockMessages.push({
      role: "user",
      content: content
    });

    // Claude に送るための「プロンプト（設定とメッセージ）」のペイロードを組み立てます。
    const payload = {
      
      // AIに守らせる大前提のルール（システムプロンプト）を指定します。
      system: systemPrompt,
      
      // AnthropicのAPIバージョンを指定します（BedrockでClaudeを使う際の必須・固定値です）。
      anthropic_version: "bedrock-2023-05-31",
      
      // 生成される返答の最大文字数（トークン数）を環境変数から取得した値で指定します。
      max_tokens: maxTokens,
      
      // これまでの会話履歴と今回のメッセージをまとめた配列をセットします。
      messages: bedrockMessages,

      // AIの回答のランダム性を設定します（0に近づくほど一貫した回答になります）。
      temperature: 0.5
    };

    // Bedrockを呼び出すためのコマンドオブジェクトを作成します。
    const command = new InvokeModelCommand({
      
      // 環境変数から取得した（チェック済みの）AIモデルのIDをセットします。
      modelId: modelId,
      
      // リクエストのデータ形式がJSONであることを指定します。
      contentType: "application/json",
      
      // レスポンスのデータ形式がJSONであることを指定します。
      accept: "application/json",
      
      // 組み立てたペイロードを文字列化してHTTPボディにセットします。
      body: JSON.stringify(payload),
    });

    // Bedrockクライアントを使ってコマンドを実行し、AIからの返答を非同期で待ちます。
    const response = await client.send(command);
    
    // 返ってきたバイナリデータ（Buffer）を、文字化けしないようにテキストデコーダーでJSON文字列に変換します。
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // JSONの階層構造から、Claudeの返答テキスト部分だけをピンポイントで抽出します。
    const aiText = responseBody.content[0].text;

    // API Gateway経由でReact（フロントエンド）に正常終了（200）として結果を返却します。
    return {
      
      // HTTPステータスコード200（成功）をセットします。
      statusCode: 200,
      
      // データ形式を示すヘッダーをセットします。
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      
      // React側で扱いやすいように、返答テキストをJSON文字列にしてボディにセットします。
      body: JSON.stringify({ reply: aiText }),
    };

  } catch (error) {
    
    // エラーが発生した場合は、内容をコンソールに赤色で出力してCloudWatch Logsに記録します。
    console.error("Bedrock呼び出しエラー:", error);
    
    // クライアントに返すエラーメッセージを用意します（throwされたエラーならそのメッセージを使用）。
    const errorMessage = error.message || "AIの呼び出しに失敗しました。";
    
    // アプリがクラッシュしないよう、エラー時もフロントエンドにエラーメッセージを返却します。
    return {
      
      // HTTPステータスコード500（サーバー内部エラー）をセットします。
      statusCode: 500,
      
      // データ形式を示すヘッダーをセットします。
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      
      // ユーザー（または開発者）に分かりやすいエラーメッセージをJSON文字列でセットします。
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};