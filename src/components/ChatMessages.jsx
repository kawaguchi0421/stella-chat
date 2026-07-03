import React from 'react';
import ChatMessageItem from './ChatMessageItem';

// メッセージ一覧エリアのコンポーネントを定義し、履歴配列とローディング状態を受け取ります。
const ChatMessages = ({ messages = [], isLoading }) => {
  
  // UI要素を返します。
  return (
    
    // スクロール可能なチャット履歴のメインエリアです。
    <div className="flex-1 p-8 overflow-y-auto">
      
      {/* 履歴データがない場合は、初期メッセージを表示して処理を終わります。 */}
      {messages.length === 0 ? (
        
        // 画面中央に配置するコンテナです。
        <div className="flex items-center justify-center h-full text-white/50 text-sm">
          
          {/* 初期メッセージを表示します。 */}
          ここに星々との対話記録が表示されます...
        </div>
      ) : (
        
        // 履歴データがある場合は、メッセージを表示するためのコンテナを展開します。
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
          
          {/* messages配列をループ処理し、1件ずつ ChatMessageItem コンポーネントとして描画します。 */}
          {messages.map((msg) => (
            
            // コンポーネントに一意のキーとメッセージデータを渡します。
            <ChatMessageItem key={msg.id} message={msg} />
          ))}

          {/* AIからの返答を待っている（ローディング中）の場合のみ、インジケーターを表示します。 */}
          {isLoading && (
            
            // ローディングアイコンを左寄せに配置するコンテナです。
            <div className="flex w-full mb-6 justify-start">
              
              {/* AIの吹き出しと同じデザインの背景を設定します（少し横幅を広げています）。 */}
              <div className="bg-black/60 border border-white/10 text-white/90 backdrop-blur-md px-6 py-4 rounded-2xl rounded-bl-sm shadow-lg flex items-center space-x-3">
                
                {/* 3つの星が順番にまたたく、世界観に合わせたローディングアニメーションです。 */}
                
                {/* 1つ目の星です。 */}
                <div className="text-starlight-gold animate-pulse text-lg" style={{ animationDelay: '0ms' }}>✦</div>
                
                {/* 2つ目の星です。少し遅れてアニメーションを開始します。 */}
                <div className="text-starlight-gold animate-pulse text-lg" style={{ animationDelay: '300ms' }}>✦</div>
                
                {/* 3つ目の星です。さらに遅れてアニメーションを開始します。 */}
                <div className="text-starlight-gold animate-pulse text-lg" style={{ animationDelay: '600ms' }}>✦</div>
                
              </div>
            </div>
          )}
          
        {/* メッセージコンテナを閉じます。 */}
        </div>
      )}
      
    </div>
  );
};

// コンポーネントをエクスポートします。
export default ChatMessages;