import { useState, useEffect } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

// ログイン中のユーザー情報を取得・管理するカスタムフックです。
export const useUserInfo = () => {
  
  // ユーザー情報を保持する状態変数を定義します（初期値は空文字です）。
  const [userInfo, setUserInfo] = useState({ nickname: '', companyName: '' });

  // コンポーネントの初回マウント時に一度だけ実行します。
  useEffect(() => {
    
    // 非同期でユーザー情報を取得する関数を定義します。
    const getUserInfo = async () => {
      try {
        
        // Cognitoから現在ログイン中のユーザーの全属性を取得します。
        const attributes = await fetchUserAttributes();
        
        // 取得した属性の中から、表示名と会社名を状態にセットします。
        setUserInfo({
            
          // nicknameが存在しない場合は「ゲスト」とします。
          nickname: attributes.nickname || 'ゲスト'
        });
        
      } catch (error) {
        
        // エラー時はコンソールに出力します。
        console.error('ユーザー情報の取得に失敗しました:', error);
      }
    };

    // 定義した取得関数を実行します。
    getUserInfo();
    
  }, []);

  // 取得したユーザー情報を返します。
  return userInfo;
};