import { useState, useEffect } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

// 設定画面のロジックを管理するカスタムフックです。
export const useSettings = () => {
    
  // 入力されたAIの回答ルールを保持する状態変数です。
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // 保存処理中かどうかを判定する状態変数です。
  const [isSaving, setIsSaving] = useState(false);
  
  // 環境変数からAPIのエンドポイントURLを取得します。
  const apiUrl = import.meta.env.VITE_SETTINGS_API_URL;

  // フックが呼び出された（コンポーネントがマウントされた）時に設定を取得します。
  useEffect(() => {
    fetchSettings();
  }, []);

  // APIから設定データを取得する非同期関数です。
  const fetchSettings = async () => {
    
    try {
        
      // 現在のユーザー情報を取得します。
      const attributes = await fetchUserAttributes();
      const userId = attributes.sub;
      if (!userId) throw new Error('ユーザーIDが取得できません');

      // GETリクエストを送信します。
      const response = await fetch(`${apiUrl}/settings?userId=${userId}`);
      
      if (response.ok) {
        
        const data = await response.json();
        
        // 取得したルールをStateに反映します。
        if (data && data.systemPrompt) {
          setSystemPrompt(data.systemPrompt);
        }
      }
      
    } catch (error) {
      console.error("設定の取得に失敗しました:", error);
    }
  };

  // 入力された設定をAPI経由で保存する非同期関数です。
  const handleSave = async () => {
    
    setIsSaving(true);
    
    try {
      // 現在のユーザー情報を取得します。
      const attributes = await fetchUserAttributes();
      const userId = attributes.sub;
      if (!userId) throw new Error('ユーザーIDが取得できません');

      // POSTリクエストを送信します。
      const response = await fetch(`${apiUrl}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, systemPrompt })
      });

      // レスポンスのステータスコードを確認します。
      if (response.ok) {
        
        // 保存成功時にユーザーへ完了メッセージを表示します。
        alert("設定を保存しました！");
        
      } else {
        
        // 保存失敗時にユーザーへエラーメッセージを表示します。
        alert("保存に失敗しました。");
      }
      
      
    } catch (error) {
      console.error("設定の保存に失敗しました:", error);
      alert("通信エラーが発生しました。");
      
      // 成功・失敗に関わらず、保存中フラグを解除します。
    } finally {
      setIsSaving(false);
    }
  };

  // UIコンポーネントで必要な状態と関数を返却します。
  return { systemPrompt, setSystemPrompt, isSaving, handleSave };
};