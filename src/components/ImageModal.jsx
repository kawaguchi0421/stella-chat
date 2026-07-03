import React from 'react';

// ImageModalコンポーネントを定義し、propsを受け取ります。
const ImageModal = ({ previewImage, onClose }) => {
    
  // プレビュー画像がない場合は何も表示しません。
  if (!previewImage) return null;

  // モーダルのUI要素を返します。
  return (
    
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      
      // クリックでプレビューを閉じます。
      onClick={onClose}
    >
      {/* 画像とボタンのコンテナです。 */}
      <div 
        className="relative max-w-5xl max-h-screen p-4" 
        
        // イベント伝播を止めます。
        onClick={e => e.stopPropagation()}
      >
        {/* 閉じるボタンです。 */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 text-white/70 hover:text-starlight-gold text-4xl transition-colors font-bold"
        >
          ×
        </button>
        <img 
          src={previewImage} 
          alt="Expanded Preview" 
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border border-white/20" 
        />
      </div>
    </div>
  );
};

// エクスポートします。
export default ImageModal;