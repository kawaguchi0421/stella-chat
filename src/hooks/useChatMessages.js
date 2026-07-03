import { useState, useEffect } from 'react';

// APIのベースURLを環境変数から取得する
const API_BASE_URL = import.meta.env.VITE_MESSAGES_API_URL;

// 特定のプロジェクトのメッセージ履歴を管理するためのカスタムフックを定義する
export function useChatMessages(projectId) {

    // メッセージ一覧を保持するための状態（ステート）を定義する（初期値は空配列）
    const [messages, setMessages] = useState([]);

    // データ取得中かどうかを示すローディング状態を定義する（初期値はfalse）
    const [isLoading, setIsLoading] = useState(false);

    // プロジェクトIDが変更されるたびにメッセージ履歴を取得する副作用を定義する
    useEffect(() => {

        // プロジェクトIDが設定されていない場合は処理を中断する
        if (!projectId) return;

        // 非同期でAPIからメッセージを取得する内部関数を定義する
        const fetchMessages = async () => {

            // データ取得を開始するため、ローディング状態をtrueにする
            setIsLoading(true);

            // APIリクエストでエラーが発生した場合に備えてtry-catchブロックを開始する
            try {

                // 指定されたプロジェクトIDをクエリパラメータに含めてGETリクエストを送信する
                const response = await fetch(`${API_BASE_URL}/messages?projectId=${projectId}`);

                // レスポンスが正常（ステータス200番台）でない場合はエラーを投げる
                if (!response.ok) throw new Error('Failed to fetch messages');

                // レスポンスの本文（JSON）をJavaScriptの配列に変換する
                const data = await response.json();

                // 取得したメッセージ配列をステートにセットし、画面を更新させる
                setMessages(data);

            // エラーが発生した場合の処理を記述する
            } catch (error) {

                // エラー内容をコンソールに出力して開発者が確認できるようにする
                console.error("Error fetching messages:", error);

            // 成功・失敗に関わらず最後に必ず実行する処理を記述する
            } finally {

                // データ取得が完了したため、ローディング状態をfalseに戻す
                setIsLoading(false);

            // try-catch-finallyブロックを終了する
            }

        // 内部関数の定義を終了する
        };

        // 定義したメッセージ取得関数を実行する
        fetchMessages();

    // 依存配列にprojectIdを指定し、プロジェクトが切り替わるたびに再実行させる
    }, [projectId]);

    // 新しいメッセージをAPIに送信し、データベースに保存する非同期関数を定義する
    const sendMessage = async (role, content) => {

        // プロジェクトIDがない場合は送信できないため、警告を出して処理を中断する
        if (!projectId) {
            console.warn("Project ID is missing. Cannot send message.");
            return;
        }

        // 保存リクエストでエラーが発生した場合に備えてtry-catchブロックを開始する
        try {

            // 保存するメッセージデータをバックエンドのAPIにPOSTリクエストで送信する
            const response = await fetch(`${API_BASE_URL}/messages`, {

                // リクエストのメソッドをPOST（新規作成）に指定する
                method: 'POST',

                // リクエストボディのデータ形式がJSONであることをヘッダーで宣言する
                headers: { 'Content-Type': 'application/json' },

                // 送信するデータ（プロジェクトID、役割、内容）をJSON文字列に変換してボディに設定する
                body: JSON.stringify({ projectId, role, content })

            // fetchのオプション指定を終了する
            });

            // レスポンスが正常でない場合はエラーを投げる
            if (!response.ok) throw new Error('Failed to save message');

            // 保存が成功したメッセージデータ（IDや日時が付与されたもの）をJSONとして受け取る
            const savedMessage = await response.json();

            // 新しく保存されたメッセージを現在のメッセージ一覧の末尾に追加してステートを更新する
            setMessages((prevMessages) => [...prevMessages, savedMessage]);

            // 保存成功の証として、保存されたメッセージオブジェクトを返す
            return savedMessage;

        // エラーが発生した場合の処理を記述する
        } catch (error) {

            // エラー内容をコンソールに出力する
            console.error("Error saving message:", error);

            // 呼び出し元にもエラーを伝播させるために再度エラーを投げる
            throw error;

        // try-catchブロックを終了する
        }

    // 送信関数の定義を終了する
    };

    // 画面側（コンポーネント）で利用できるように、必要なデータと関数をオブジェクトにして返す
    return { messages, isLoading, sendMessage };

// カスタムフックの定義を終了する
}