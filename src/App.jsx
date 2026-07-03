import React, { useState, useEffect } from 'react';
import SideMenu from './components/SideMenu';
import MainChat from './components/MainChat';
import Login from './components/Login';
import Settings from './components/Settings';
import ProjectModal from './components/ProjectModal';
import Dashboard from './components/Dashboard';
import { useProjects } from './hooks/useProjects';
import { useAuth } from './hooks/useAuth';

function App() {
  
  // 認証フックを呼び出し、ログイン状態とログアウト関数を受け取ります。
  const { isLoggedIn, setIsLoggedIn, logout } = useAuth();
  
  // 現在ユーザーが選択して開いているプロジェクト名を管理する状態変数です。
  const [currentProject, setCurrentProject] = useState('プロジェクトA');
  
  // メインエリアに表示する画面（ダッシュボード、チャット等）を切り替えるための状態変数です。
  const [currentView, setCurrentView] = useState('dashboard');
  
  // サイドメニューの開閉状態（開いている時はtrue）を管理する状態変数です。
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // プロジェクト追加モーダルの表示・非表示（表示中はtrue）を管理する状態変数です。
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // カスタムフックを呼び出し、データ操作に加えて削除関数も受け取ります。
  const { projects, handleAddProject, handleDeleteProject } = useProjects(isLoggedIn);

  // 現在選択されているプロジェクトIDを管理します。
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  // UI用のログアウト処理（ログアウト＋画面遷移）を定義します。
  const handleLogout = async () => {
    
    // 認証フックのログアウト処理を実行します。
    await logout();
    
    // 次回のログイン時に備えて、表示画面をダッシュボード（初期画面）にリセットします。
    setCurrentView('dashboard');
  };
  
  // ユーザーの誤操作を防ぎ、削除と画面遷移を連携させるためのラッパー関数です。
  const onDeleteProjectWrapper = async (projectId, projectName) => {
    
    // ブラウザの標準機能を使って、ユーザーに削除の最終確認を求めます。
    const isConfirmed = window.confirm(`プロジェクト「${projectName}」を削除しますか？\n※関連するチャット履歴もすべて削除されます。`);
    
    // ユーザーが「キャンセル」を押した場合は、ここで処理を中断します。
    if (!isConfirmed) return;

    // ビジネスロジック（カスタムフック）に定義された実際の削除処理を呼び出します。
    await handleDeleteProject(projectId);

    // もし削除したプロジェクトが、現在チャット画面で開いているプロジェクトだった場合の分岐です。
    if (currentProject === projectId) {
      
      // 存在しないプロジェクトの画面を閉じ、ダッシュボード画面へ強制的に切り替えます。
      setCurrentView('dashboard');
      
      // 選択中のプロジェクト情報をリセット（空に）します。
      setCurrentProject(null);
    }
  };

  // アプリ全体の背景として表示する、星空の高画質な画像URLを設定します
  const bgImageUrl = 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=2560&auto=format&fit=crop';
  
  // 現在選択されているプロジェクトIDと一致するデータを配列の中から探します。
  const activeProject = projects.find(p => p.projectId === currentProject);
  
  // 選択中のプロジェクト名を取得します（見つからない場合は空文字にします）。
  const activeProjectName = activeProject ? activeProject.projectName : "";

  return (
    <div className="flex h-screen text-white font-sans" style={{ backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      
      {/* ログインしていない（isLoggedInがfalse）場合は、ログイン画面を表示します。 */}
      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        
        // ログイン済みの場合は、メニューや各種画面を配置するメインのレイアウトコンテナを表示します。
        <div className="flex h-full w-full relative">
          {isSidebarOpen && (
            <SideMenu projects={projects} setCurrentProject={setCurrentProject} setCurrentView={setCurrentView} onLogout={handleLogout} toggleSidebar={() => setIsSidebarOpen(false)} openProjectModal={() => setIsProjectModalOpen(true)} onDeleteProject={onDeleteProjectWrapper} />
          )}
          
          {/* currentViewが'settings'と一致する場合、共通設定画面のコンポーネントを描画します */}
          {currentView === 'settings' && (
            <Settings isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(true)} />
          )}
          
          {/* currentViewが'dashboard'と一致する場合、ダッシュボード画面を描画します。 */}
          {currentView === 'dashboard' && (
            <Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(true)} />
          )}

          {/* currentViewが'chat'と一致する場合、AIと対話するチャット画面のコンポーネントを描画します。 */}          
          {currentView === 'chat' && (
            
            <MainChat 
              currentProject={currentProject}
              currentProjectName={activeProjectName}
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
          )}

          {/* プロジェクトを追加するためのモーダルコンポーネントです（isProjectModalOpenがtrueの時のみ表示されます）。 */}
          <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onAddProject={handleAddProject} />
        </div>
      )}
    </div>
  );
}

// このファイルで定義したAppコンポーネントを、外部ファイルからインポートできるようにエクスポートします。
export default App;