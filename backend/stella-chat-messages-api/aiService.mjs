import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// 環境変数のリージョンを使用してBedrockクライアントを初期化します。
const client = new BedrockRuntimeClient({ region: "ap-northeast-1" });

// DynamoDBクライアントを初期化します。
const dynamoClient = new DynamoDBClient({});

// より扱いやすいドキュメントクライアントを生成します。
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

// 環境変数から設定テーブル名を取得します。
const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME;

// AIを呼び出して返答テキストを取得する非同期関数を定義してエクスポートします。
export const callAiApi = async (body) => {

    // 送信されたボディから、メッセージ、ユーザーID、会話履歴、画像を取り出します。
    const { message, userId, history = [], images = [] } = body;

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

    // 過去の履歴から、正しくテキスト(content)が入っているものだけを抽出・整形します。
    const bedrockMessages = history
      .filter(msg => msg.content && typeof msg.content === 'string' && msg.content.trim() !== "") 
      .map(msg => ({ role: msg.role, content: msg.content }));

    // 環境変数からモデルIDを取得します。
    const modelId = process.env.MODEL_ID;

    // モデルIDが設定されていない場合は、エラーを投げて処理を中断します。
    if (!modelId) {

        // システム管理者に連絡するよう促すエラーメッセージを投げます。
        throw new Error("環境変数 'MODEL_ID' が設定されていません。システム管理者に連絡してください。");
    }

    // 環境変数から最大トークン数を取得し、数値に変換します（未設定時は1000）。
    const maxTokens = parseInt(process.env.MAX_TOKENS || "1000", 10);

    // Claudeに送るための「今回のメッセージ（content）」の配列を準備します。
    const content = [];

    // 画像データが存在する場合、Claudeが読める形式に変換して追加します。
    if (images && images.length > 0) {

        // 画像配列をループ処理して1つずつフォーマットします。
        images.forEach(img => {

            // base64形式の画像データオブジェクトを配列に追加します。
            content.push({

                // データの種類を画像に指定します。
                type: "image",

                // 画像のソース情報を指定します。
                source: {

                    // ソースの形式がbase64であることを指定します。
                    type: "base64",

                    // 画像のMIMEタイプを指定します。
                    media_type: img.media_type,

                    // 実際のbase64文字列データを指定します。
                    data: img.data
                }
            });
        });
    }

    // テキストメッセージを配列の最後に追加します。
    content.push({ type: "text", text: message });

    // これまでの履歴配列の「一番最後」に、今回の新しいメッセージを追加します。
    bedrockMessages.push({

        // 今回のメッセージの送信者をユーザーに指定します。
        role: "user",

        // 画像とテキストをまとめたコンテンツをセットします。
        content: content
    });

    // Claude に送るためのプロンプトのペイロード（JSON）を組み立てます。
    const payload = {

        // AIに守らせる大前提のルール（システムプロンプト）を指定します。
        system: systemPrompt,

        // AnthropicのAPIバージョンを指定します（Bedrockの必須値）。
        anthropic_version: "bedrock-2023-05-31",

        // 生成される返答の最大トークン数を指定します。
        max_tokens: maxTokens,

        // 会話履歴と今回のメッセージをまとめた配列をセットします。
        messages: bedrockMessages,

        // AIの回答のランダム性を設定します。
        temperature: 0.5
    };

    // Bedrockを呼び出すためのコマンドオブジェクトを作成します。
    const command = new InvokeModelCommand({

        // 実行対象のAIモデルのIDをセットします。
        modelId: modelId,

        // リクエストのデータ形式がJSONであることを指定します。
        contentType: "application/json",

        // レスポンスのデータ形式がJSONであることを指定します。
        accept: "application/json",

        // 組み立てたペイロードを文字列化してセットします。
        body: JSON.stringify(payload),
    });

    // Bedrockクライアントを使ってコマンドを実行し、非同期で待ちます。
    const response = await client.send(command);

    // 返ってきたバイナリデータをテキストデコーダーでJSON文字列に変換し、パースします。
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // JSONの階層構造から、Claudeの返答テキスト部分だけを抽出します。
    const aiText = responseBody.content[0].text;

    // 抽出したAIの返答テキストを呼び出し元（index.mjs）に返します。
    return aiText;
};