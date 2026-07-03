import { useState, useRef, useEffect } from 'react';

// ファイル添付や画像プレビューに関する状態と処理（ロジック）をまとめたカスタムフックです。
export const useAttachments = () => {
  
  // 添付ファイルを管理する状態変数です。
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  // プレビュー画像のURLを管理する状態変数です。
  const [previewImage, setPreviewImage] = useState(null);
  
  // ファイル入力用の参照です。
  const fileInputRef = useRef(null);
  
  // フォルダ入力用の参照です。
  const folderInputRef = useRef(null);

  // コンポーネントが破棄される時に、メモリリークを防ぐため画像URLを解放します。
  useEffect(() => {
    return () => {
      attachedFiles.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [attachedFiles]);

  // ファイルアイコンクリック時の処理です。
  const handleFileIconClick = () => fileInputRef.current?.click();
  
  // フォルダアイコンクリック時の処理です。
  const handleFolderIconClick = () => folderInputRef.current?.click();

  // 画像ファイルにプレビュー用のURLを付与するヘルパー関数です。
  const addPreviewToFile = (file) => {
    
    // 画像タイプの場合のみ、ブラウザで表示できる一時的なURLを生成します。
    if (file.type.startsWith('image/')) {
      return Object.assign(file, { preview: URL.createObjectURL(file) });
    }
    
    // 画像以外はそのまま返します。
    return file;
  };

  // ファイル変更時のクリア処理
  const handleFileChange = (e) => {
    
    // 選択されたファイルを取得します。
    const files = e.target.files;
    
    // ファイルが選択されていない場合は処理を中断します。
    if (!files || files.length === 0) return;

    // 選択されたファイルを配列化し、それぞれにプレビューURLを付与します。
    const newFiles = Array.from(files).map(addPreviewToFile);

    // 既存の配列に新しいファイルを追加します。
    setAttachedFiles((prev) => [...prev, ...newFiles]);

    // 次回も同じファイルを選択できるように、参照を使って入力をリセットします。
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // ペースト時の処理です。
  const handlePaste = (e) => {
    
    // クリップボードのデータからアイテムのリストを取得します。
    const items = e.clipboardData?.items;
    
    // アイテムが存在しない場合は処理を中断します。
    if (!items) return;

    // ペーストされたファイルを一時格納する配列を準備します。
    const pastedFiles = [];
    
    // アイテムリストを順番に確認します。
    for (let i = 0; i < items.length; i++) {
      
      // 種類が「ファイル」であるか判定します。
      if (items[i].kind === 'file') {
        
        // 実ファイルとして取り出します。
        const file = items[i].getAsFile();
        
        // 取り出せた場合、プレビューURLを付与して配列に追加します。
        if (file) pastedFiles.push(addPreviewToFile(file));
      }
    }

    // ファイルがペーストされたか確認します。
    if (pastedFiles.length > 0) {
      
      // デフォルトのペースト動作をキャンセルします。
      e.preventDefault();
      
      // 既存の配列に新しいファイルを追加して更新します。
      setAttachedFiles((prev) => [...prev, ...pastedFiles]);
    }
  };

  // ファイル削除時の処理です。
  const handleRemoveFile = (indexToRemove) => {
    setAttachedFiles((prev) => {
      
      // 削除する画像のURLをメモリから解放します。
      const fileToRemove = prev[indexToRemove];
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      
      // 削除対象以外のファイルで新しい配列を作ります。
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  // 送信後にすべての添付ファイルをクリアする関数を追加します。
  const clearAttachments = () => {
    
    // すべての画像のURLをメモリから解放します。
    attachedFiles.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    
    // 状態を空の配列に戻します。
    setAttachedFiles([]);
  };

  // コンポーネント側で使えるように返却します。
  return {
    attachedFiles,
    previewImage,
    setPreviewImage,
    fileInputRef,
    folderInputRef,
    handleFileIconClick,
    handleFolderIconClick,
    handleFileChange,
    handlePaste,
    handleRemoveFile,
    clearAttachments, 
  };
};