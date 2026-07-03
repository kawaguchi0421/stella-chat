import React, { useState } from 'react';

// プロジェクト作成モーダルコンポーネントを定義し、必要なPropsを受け取ります。
const ProjectModal = ({ isOpen, onClose, onAddProject }) => {
  
  // 入力されたプロジェクト名を管理する状態変数です。
  const [projectName, setProjectName] = useState('');

  // isOpenがfalse（非表示状態）の場合は、何も描画せずに終了します。
  if (!isOpen) return null;

  // フォームが送信（作成ボタン押下またはEnterキー）された時の処理です。
  const handleSubmit = (e) => {
    
    // 画面がリロードされるブラウザの標準挙動を防ぎます。
    e.preventDefault();
    
    // 入力値の前後にある空白を削除し、空文字でないか確認します。
    if (projectName.trim()) {
      
      // 親コンポーネント（App.jsxなど）に追加処理を依頼します。
      onAddProject(projectName.trim());
      
      // 次回開いた時のために、入力欄を空にリセットします。
      setProjectName('');
      
      // モーダルを閉じる処理を呼び出します。
      onClose();
    }
  };

  // UI要素を返します。
  return (
    // 画面全体を覆う半透明の暗い背景（オーバーレイ）です。
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      
      <div className="bg-space-dark border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">        
        <h3 className="text-xl font-bold text-white mb-4">新規プロジェクト作成</h3>
        
        {/* プロジェクト名を入力するフォームです。 */}
        <form onSubmit={handleSubmit}>
          
          <div className="mb-6">
            <label className="block text-white/70 text-sm font-bold mb-2">
              プロジェクト名
            </label>
            
            {/* テキスト入力欄です。 */}
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="例: TalentSphere 開発"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-starlight-gold transition-colors"
              autoFocus
            />
            
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-white/70 hover:bg-white/10 transition-colors text-sm font-bold"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!projectName.trim()}
              className="px-5 py-2 rounded-full bg-starlight-gold text-space-dark hover:opacity-90 transition-opacity text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              作成する
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
};

// コンポーネントをエクスポートします。
export default ProjectModal;