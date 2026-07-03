import React, { useState } from 'react';
import { signIn, confirmSignIn } from 'aws-amplify/auth';

// Loginコンポーネントを定義し、propsとしてonLogin関数を受け取ります。
const Login = ({ onLogin }) => {
  
  // 入力されたメールアドレスを管理する状態変数です。
  const [email, setEmail] = useState('');
  
  // 入力されたパスワードを管理する状態変数です。
  const [password, setPassword] = useState('');
  
  // 新しく設定するパスワードを管理する状態変数です。
  const [newPassword, setNewPassword] = useState('');
  
  // エラーメッセージを画面に表示するための状態変数です。
  const [errorMsg, setErrorMsg] = useState('');
  
  // 初回ログイン時のパスワード再設定画面に切り替えるためのフラグです。
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  
  // 通常のパスワードの伏せ字（••••）を表示/非表示にするフラグです。
  const [showPassword, setShowPassword] = useState(false);
  
  // 新しいパスワードの伏せ字（••••）を表示/非表示にするフラグです
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ログインまたはパスワード変更ボタンが押された時の処理です。
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // エラーを捕捉するため、try-catch文でAPI通信を囲みます。
    try {
      if (isNewPasswordRequired) {
        
        // 新しいパスワードを送信します。
        const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
        
        // パスワード変更とログインが成功した場合、親コンポーネントに通知します。
        if (isSignedIn) onLogin();
      } else {
        
        // メールアドレスと仮パスワードを送信します。
        const { isSignedIn, nextStep } = await signIn({ username: email, password });
        
        // 通常のログインが成功した場合、親コンポーネントに通知します。
        if (isSignedIn) {
          onLogin();
          
          // Cognitoから「初回ログインなのでパスワード変更が必要」と返ってきた場合の判定です。
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          
          // パスワード再設定画面を表示するようにフラグを切り替えます。
          setIsNewPasswordRequired(true);
        }
      }
    } catch (error) {
      console.error('認証エラー:', error);
      
      // 既に別のセッションが残っている場合のエラーハンドリングです。
    if (error.name === 'UserAlreadyAuthenticatedException') {
        
        setErrorMsg('既に別のセッションが有効です。一度ページを更新するか、ログアウトしてください。');
        
        // パスワードの複雑さ要件（大文字・小文字・数字・記号）を満たしていない場合のエラーです。
      } else if (error.name === 'InvalidPasswordException') {
        setErrorMsg('パスワードの条件を満たしていません（大文字・小文字・数字・特殊文字を含めてください）。');
        
        // メールアドレスやパスワードの入力間違いによる認証失敗エラーです。
      } else if (error.name === 'NotAuthorizedException') {
        setErrorMsg('メールアドレスまたはパスワードが間違っています。');
        
        // 存在しないメールアドレスが入力された場合のエラーです。
      } else if (error.name === 'UserNotFoundException') {
        setErrorMsg('このメールアドレスは登録されていません。');
        
        // 上記以外の予期せぬエラーが発生した場合の汎用的なエラーメッセージです。
      } else {
        setErrorMsg('処理に失敗しました。入力内容をご確認ください。');
      }
    }
};

  // UI要素を返します。
  return (
    
    // 画面全体を覆い、コンテンツを中央に配置する背景コンテナです。
    <div className="flex items-center justify-center h-full w-full relative z-10">
      <div className="bg-black/40 p-10 rounded-2xl border border-white/20 backdrop-blur-md w-96 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-starlight-gold tracking-tight mb-2">Stella Chat</h1>
          <p className="text-white/70 text-sm">星空のナレッジベースへようこそ</p>
        </div>

        {/* エラーメッセージが存在する場合のみ、赤枠のアラート領域を表示します。 */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* ログイン情報を送信するためのフォーム要素です。送信時にhandleSubmitが発火します。 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 初回ログイン（パスワード変更必須）かどうかで、表示する入力欄を切り替えます。 */}
          {isNewPasswordRequired ? (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">新しいパスワードを設定</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワード"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-starlight-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-starlight-gold transition-colors"
                  title={showNewPassword ? 'パスワードを隠す' : 'パスワードを表示する'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    {showNewPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <p className="text-white/50 text-xs mt-2 leading-relaxed">
                ※8文字以上で、大文字・小文字・数字・特殊記号（!@#$%^&*など）をすべて含めてください。
              </p>
            </div>
          ) : (
            <>
              {/* メールアドレスを入力するフィールドのコンテナです。 */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">メールアドレス</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-starlight-gold"
                />
              </div>

              {/* パスワードを入力するフィールドのコンテナです（表示切り替えの目アイコン付き）。 */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">パスワード</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-starlight-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-starlight-gold transition-colors"
                    title={showPassword ? 'パスワードを隠す' : 'パスワードを表示する'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 状態に応じてテキストが変わる、フォームの送信ボタンです。 */}
          <button
            type="submit"
            className="w-full bg-starlight-gold text-space-dark font-bold text-lg py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg mt-4"
          >
            {isNewPasswordRequired ? 'パスワードを設定してログイン' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;