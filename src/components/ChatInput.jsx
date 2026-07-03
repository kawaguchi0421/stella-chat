import React from 'react';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

// ChatInputコンポーネントを定義し、親から渡されたプロパティを受け取ります。
const ChatInput = ({ 
  inputText, 
  setInputText, 
  handleSendMessage,
  attachedFiles, 
  handleRemoveFile, 
  setPreviewImage, 
  fileInputRef, 
  folderInputRef, 
  handleFileChange, 
  handleFileIconClick, 
  handleFolderIconClick, 
  handlePaste 
}) => {
  
  // カスタムフックを呼び出して、ロジック（参照と関数）を受け取ります。
  const { textareaRef, executeSend, handleKeyDown } = useAutoResizeTextarea(inputText, handleSendMessage);

  // UI要素を返します。
  return (
    
    // 入力エリア全体のコンテナです。
    <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
      
      {/* 添付されたファイルがある場合、プレビューを表示するエリアです。 */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedFiles.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.preview} 
                  alt="preview" 
                  className="h-16 w-16 object-cover rounded border border-white/20 cursor-pointer"
                  onClick={() => setPreviewImage(file.preview)}
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-white/10 rounded border border-white/20 text-xs text-white p-1 text-center break-all">
                  {file.name}
                </div>
              )}
              <button 
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 入力フォームの背景コンテナです。 */}
      <div className="flex items-end bg-white/5 border border-white/10 rounded-3xl p-1 pl-4">
        
        {/* 隠しファイル入力欄（単一ファイル用）です。 */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
        
        {/* 隠しファイル入力欄（フォルダ用）です。 */}
        <input type="file" ref={folderInputRef} onChange={handleFileChange} className="hidden" webkitdirectory="true" directory="true" multiple />

        {/* ファイル添付ボタンです。 */}
        <button onClick={handleFileIconClick} className="text-white/50 hover:text-starlight-gold pl-4 pr-2 text-xl transition-colors pb-2" title="ファイルを添付する">
          📎
        </button>

        {/* フォルダ添付ボタンです。 */}
        <button onClick={handleFolderIconClick} className="text-white/50 hover:text-starlight-gold pr-4 pl-2 text-xl transition-colors pb-2" title="フォルダごと添付する">
          📁
        </button>

        {/* 複数行対応・自動リサイズのテキスト入力欄です。 */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="星に願いを... (Shift+Enterで改行)"
          rows={1}
          className="bg-transparent border-none outline-none text-white flex-1 px-2 placeholder:text-starlight-gold/70 text-sm resize-none max-h-32 overflow-y-auto py-3 leading-relaxed"
        />

        {/* 送信ボタンです。 */}
        <button 
          onClick={executeSend}
          className="bg-starlight-gold text-space-dark px-7 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity text-sm shadow-md mb-0.5 mr-0.5"
        >
          送信
        </button>
      </div>
    </div>
  );
};

// コンポーネントをエクスポートします。
export default ChatInput;