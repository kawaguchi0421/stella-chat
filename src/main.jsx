import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Amplify } from 'aws-amplify';

// Amplifyの初期設定を行います。
Amplify.configure({
  
  // 認証関連の設定ブロックを開始します。
  Auth: {
    
    // Cognitoプロバイダーの設定ブロックを開始します。
    Cognito: {
      
      // 環境変数からユーザープールIDを設定します。
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      
      // 環境変数からクライアントIDを設定します。
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

// Reactのルート要素を取得し、レンダリングを開始します。
ReactDOM.createRoot(document.getElementById('root')).render(
  
  // ストリクトモードを有効にして安全性を高めます。
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)