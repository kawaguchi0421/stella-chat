import React from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ImageModal from './ImageModal';
import { useAttachments } from '../hooks/useAttachments';
import { useChat } from '../hooks/useChat';

// MainChatコンポーネントを定義し、プロジェクト名やサイドバー開閉関数を受け取ります。
const MainChat = ({ currentProject, currentProjectName, isSidebarOpen, toggleSidebar }) => {
  
  // カスタムフックからファイル添付に関する状態と関数を取り出します。
  const {
    
    // 添付されたファイルの配列です。
    attachedFiles,
    
    // プレビュー表示する画像のURLです。
    previewImage,
    
    // プレビュー画像をセットする関数です。
    setPreviewImage,
    
    // ファイル入力欄の参照です。
    fileInputRef,
    
    // フォルダ入力欄の参照です。
    folderInputRef,
    
    // ファイルアイコンクリック時の処理です。
    handleFileIconClick,
    
    // フォルダアイコンクリック時の処理です。
    handleFolderIconClick,
    
    // ファイルが選択された時の処理です。
    handleFileChange,
    
    // コピペで画像が貼り付けられた時の処理です。
    handlePaste,
    
    // 添付ファイルを削除する処理です。
    handleRemoveFile,
    
    // 添付ファイルを全てクリアする処理です。
    clearAttachments
    
  } = useAttachments();

  // カスタムフックからチャットに関する状態と関数を取り出します。
  const {
    
    // 入力中のテキストです。
    inputText,
    
    // テキストを更新する関数です。
    setInputText,
    
    // メッセージを送信する処理です。
    handleSendMessage,
    
    // チャット履歴の配列です。
    messages,
    
    // AIの返答待ち状態（ローディング）です。
    isLoading
    
  } = useChat(currentProject, attachedFiles, clearAttachments);

  // ヘッダーに表示するタイトルとして、プロジェクト名をセットします。
  const chatTitle = currentProjectName;

  // UI要素を返します。
  return (
    
    // 画面全体を占有し、縦方向に要素を並べるフレックスコンテナです。
    <div className="flex-1 flex flex-col relative bg-black/20 h-screen overflow-hidden">
      
      {/* ヘッダー部分のコンテナです。 */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-4 bg-black/30 backdrop-blur-sm z-10 flex-shrink-0">
        
        {/* サイドバーが閉じている場合のみ、開くためのハンバーガーボタンを表示します。 */}
        {!isSidebarOpen && (
          <button 
          
            // クリック時にサイドバーの開閉を切り替えます。
            onClick={toggleSidebar} 
            
            // ボタンのスタイルとホバー時の色変化を設定します。
            className="text-white/70 hover:text-white text-xl" 
            
            // マウスオーバー時に表示されるツールチップです。
            title="メニューを開く"
          >
            ☰
          </button>
        )}
        
        {/* 動的に設定したチャット画面のタイトルを表示します。 */}
        <h2 className="text-lg font-bold text-white">{chatTitle}</h2>
      </div>

      {/* チャット履歴を表示するコンポーネントです。 */}
      <ChatMessages 
        // 履歴データの配列を渡します。
        messages={messages} 
        
        // ローディング状態を渡します。
        isLoading={isLoading} 
      />

      {/* チャット入力欄のコンポーネントです。 */}
      <ChatInput
      
        // 入力中のテキストを渡します。
        inputText={inputText}
        
        // テキスト更新関数を渡します。
        setInputText={setInputText}
        
        // 送信処理を渡します。
        handleSendMessage={handleSendMessage}
        
        // 添付ファイルの配列を渡します。
        attachedFiles={attachedFiles}
        
        // ファイル削除処理を渡します。
        handleRemoveFile={handleRemoveFile}
        
        // プレビュー画像セット関数を渡します。
        setPreviewImage={setPreviewImage}
        
        // ファイル入力の参照を渡します。
        fileInputRef={fileInputRef}
        
        // フォルダ入力の参照を渡します。
        folderInputRef={folderInputRef}
        
        // ファイル選択処理を渡します。
        handleFileChange={handleFileChange}
        
        // ファイルアイコンクリック処理を渡します。
        handleFileIconClick={handleFileIconClick}
        
        // フォルダアイコンクリック処理を渡します。
        handleFolderIconClick={handleFolderIconClick}
        
        // ペースト処理を渡します。
        handlePaste={handlePaste}
      />

      {/* 画像を拡大表示するためのモーダルコンポーネントです。 */}
      <ImageModal 
      
        // 表示する画像のURLを渡します（nullなら非表示になります）。
        previewImage={previewImage} 
        
        // モーダルを閉じる処理（画像をnullにする）を渡します。
        onClose={() => setPreviewImage(null)} 
      />

    </div>
  );
};

// コンポーネントをエクスポートします。
export default MainChat;