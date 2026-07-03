import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

// 認証関連のロジックをまとめたカスタムフックを定義します。
export const useAuth = () => {
  
  // ユーザーのログイン状態（true/false）を保持・更新するための状態変数です。
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // アプリ起動時にログイン状態をチェックする「オートログイン」機能です。
  useEffect(() => {
    
    // ユーザーのセッションが有効か確認する関数を呼び出します。
    checkUser();
    
  // 依存配列を空にして初回起動時のみ実行させます。
  }, []);

  // ユーザーのセッションが有効か確認する非同期関数です。
  const checkUser = async () => {
    
    try {
        
      // 現在のログインユーザーを取得できれば、ログイン済みとみなします。
      await getCurrentUser();
      
      // ユーザー情報の取得に成功した場合、ログイン状態を有効（true）に設定します。
      setIsLoggedIn(true);
      
    } catch (error) {
        
      // セッションがない、または切れている場合はログイン状態を無効にします。
      setIsLoggedIn(false);
    }
  };

  // ログアウト時に、AWS上のセッションも完全に破棄する関数です。
  const logout = async () => {
    
    try {
        
      // AmplifyのsignOutを呼び出し、ブラウザの証明書を削除します。
      await signOut();
      
      // ログアウト処理が完了したため、ログイン状態を無効（false）に戻します。
      setIsLoggedIn(false);
      
    } catch (error) {
        
      // エラー発生時はコンソールに出力します。
      console.error('ログアウトエラー:', error);
      
    }
  };

  // App.jsxで使えるように、状態と関数を返却します。
  return { isLoggedIn, setIsLoggedIn, logout };
};