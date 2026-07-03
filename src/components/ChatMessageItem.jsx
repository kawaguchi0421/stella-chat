import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 1件のメッセージ（ユーザーまたはAI）を表示するコンポーネントです。
const ChatMessageItem = ({ message }) => {
  
  // ユーザーのメッセージかどうかを判定します。
  const isUser = message.sender === 'user';

  // UI要素を返します。
  return (
    // メッセージ全体のコンテナです。送信者によって左右の配置（justify-end / justify-start）を変えます。
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {/* ユーザーは透過ホワイト、AIは透過ブラックの「すりガラス風」でスタイリングします。 */}
      <div className={`max-w-[80%] px-6 py-4 shadow-lg backdrop-blur-md ${
        isUser 
          ? 'bg-white/15 border border-white/20 text-white rounded-2xl rounded-br-sm' 
          : 'bg-black/60 border border-white/10 text-white/90 rounded-2xl rounded-bl-sm'
      }`}>
        
        {/* テキストの表示分けです */}
        {isUser ? (
          
          // ユーザーのメッセージはそのまま表示します（改行だけ反映）。
          <div className="whitespace-pre-wrap leading-relaxed text-sm">
            {message.text}
          </div>
        ) : (
          // AIのメッセージはReactMarkdownを使って綺麗にレンダリングします
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-sm" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-starlight-gold" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 border-b border-white/20 pb-1" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2 mt-3 text-white/90" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-starlight-gold bg-starlight-gold/10 px-1 rounded" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 ml-2 text-sm" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-2 text-sm" {...props} />,
              table: ({node, ...props}) => (
                <div className="overflow-x-auto mb-4 mt-2">
                  <table className="min-w-full text-sm border-collapse border border-white/20" {...props} />
                </div>
              ),
              th: ({node, ...props}) => <th className="border border-white/20 bg-white/10 px-4 py-2 text-left font-bold text-starlight-gold" {...props} />,
              td: ({node, ...props}) => <td className="border border-white/20 px-4 py-2" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}

        {/* 送信された画像がある場合、テキストの下に並べて表示します。 */}
        {message.images && message.images.length > 0 && (
          // 複数の画像が横に並び、入り切らない場合は折り返すコンテナです。
          <div className="flex flex-wrap gap-2 mt-3">
            
            {/* 画像の配列をループ処理して表示します。 */}
            {message.images.map((img, index) => (
              <img 
                // ループ要素に一意のキーを設定します。
                key={index} 
                
                // Base64データを画像ソースとして直接設定します（data:image/png;base64,...の形式）。
                src={`data:${img.media_type};base64,${img.data}`} 
                
                // 代替テキストを設定します。
                alt="uploaded" 
                
                // 画像の枠線も、白の半透明にして馴染ませます。
                className="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-white/20 shadow-sm"
              />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

// コンポーネントをエクスポートします。
export default ChatMessageItem;