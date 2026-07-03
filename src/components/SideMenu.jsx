import React from 'react';

import { useUserInfo } from '../hooks/useUserInfo';

// SideMenuコンポーネントを定義します。
const SideMenu = ({ projects, setCurrentProject, setCurrentView, onLogout, toggleSidebar, openProjectModal, onDeleteProject }) => {
  
  // カスタムフックから会社名を取り出します。
  const { companyName } = useUserInfo();
  
  // 画面に描画するためのJSX要素を返却します。
  return (
    
    // サイドメニュー全体のコンテナとなるdiv要素です。
    <div className="w-64 bg-black/40 p-6 flex flex-col border-r border-white/10 backdrop-blur-sm z-10">
      
      {/* アプリタイトルと閉じるボタンを横並びにするヘッダーコンテナです。 */}
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-starlight-gold tracking-tight">Stella Chat</h1>
        <button onClick={toggleSidebar} className="text-white/50 hover:text-white transition-colors" title="メニューを閉じる">
          ◀
        </button>
      </div>

      {/* メニューの中央部分（リストエリア）をスクロール可能にするコンテナです。 */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="mb-10">
          
          {/* クリック時にダッシュボード画面へ遷移させる見出し要素です。 */}
          <h2 onClick={() => setCurrentView('dashboard')} className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3 cursor-pointer hover:text-starlight-gold transition-colors inline-block" title="ダッシュボードへ戻る">
            | ダッシュボード
          </h2>
        </div>

        {/* プロジェクト一覧をまとめるためのグループコンテナです。 */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              | プロジェクト
            </h2>

            {/* 新規プロジェクト作成のモーダルを開くボタンです。 */}
            <button onClick={openProjectModal} className="text-white/50 hover:text-starlight-gold text-lg leading-none p-1 font-bold" title="新規プロジェクト追加">
              ＋
            </button>
          </div>

          <ul className="space-y-3">
            
          {/* 親から受け取ったプロジェクト配列をループしてリストを生成します。 */}
          {projects.map((project) => (

            // プロジェクト1件分のli要素です。
            <li key={project.projectId} className="flex justify-between items-center group py-1">

              <div 
                // クリック時にこのプロジェクトを選択状態にし、チャット画面へ切り替えます。
                onClick={() => { setCurrentProject(project.projectId); setCurrentView('chat'); }} 
                className="cursor-pointer text-white hover:text-starlight-gold transition-colors text-sm flex-1 truncate"
              >
                ✦ {project.projectName}
              </div>

              {/* プロジェクトを削除するためのボタン要素です。 */}
              <button 
              
                // クリック時に親の選択イベントの誤発火を防ぎ（stopPropagation）、削除処理を呼び出します。
                onClick={(e) => { e.stopPropagation(); onDeleteProject(project.projectId, project.projectName); }} 
                
                className="text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs px-2"
                title="削除"
              >
                ❌
              </button>
            </li>

          // ループ処理を終了します。
          ))}
          </ul>
        </div>
      </div>

      {/* 下部に固定するフッターエリア（設定・ログアウト）のコンテナです。 */}
      <div className="mt-auto pt-6 border-t border-white/10 space-y-4">

        {/* 共通設定画面へ遷移するためのクリック可能なコンテナです。 */}
        <div onClick={() => setCurrentView('settings')} className="flex items-center space-x-2 cursor-pointer text-white/70 hover:text-white transition-colors">
          <span>⚙️</span>
          <span className="text-sm font-medium">共通設定</span>
        </div>

        {/* ログアウト処理を実行するためのクリック可能なコンテナです。 */}
        <div onClick={onLogout} className="flex items-center space-x-2 cursor-pointer text-white/70 hover:text-red-400 transition-colors">
          <span>🚪</span>
          <span className="text-sm font-medium">ログアウト</span>
        </div>
      </div>
    </div>
  );
};
export default SideMenu;