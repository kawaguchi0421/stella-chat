import React from 'react';
import { useSettings } from '../hooks/useSettings';

// 共通設定画面のコンポーネントです。
const Settings = ({ isSidebarOpen, toggleSidebar }) => {
  
  // カスタムフックを呼び出し、必要な状態と関数だけを受け取ります。
  const { systemPrompt, setSystemPrompt, isSaving, handleSave } = useSettings();

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-transparent p-8 overflow-y-auto">
      
      {/* ヘッダー部分 */}
      <div className="flex items-center mb-8">
        {!isSidebarOpen && (
          <button onClick={toggleSidebar} className="text-white/70 hover:text-white text-xl mr-4">
            ≡
          </button>
        )}
        <h2 className="text-2xl font-bold text-white">共通設定</h2>
      </div>

      {/* 設定フォーム部分 */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-3xl">
        <h3 className="text-lg font-bold text-starlight-gold mb-2">AIの回答ルールの設定</h3>
        <p className="text-sm text-white/70 mb-4">すべてのチャットでAIに反映させたい前提条件やルールを記述します。</p>

        {/* フックから受け取った状態（systemPrompt, setSystemPrompt）を繋ぎ込みます */}
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full h-48 bg-black/40 border border-white/10 rounded-lg p-4 text-white text-sm outline-none focus:border-starlight-gold resize-none mb-4"
          placeholder="例: 回答は日本語で回答する。プログラミング言語でコードを記述する際は..."
        />

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <button
            // フックから受け取った関数と状態（handleSave, isSaving）を繋ぎ込みます
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-starlight-gold text-space-dark font-bold py-2 px-6 rounded-lg hover:brightness-110 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;