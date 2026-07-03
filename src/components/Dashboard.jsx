import React from 'react';
import { useUserInfo } from '../hooks/useUserInfo';

// Dashboardコンポーネントを定義し、サイドバー開閉の状態と関数を受け取ります。
const Dashboard = ({ isSidebarOpen, toggleSidebar }) => {
  
  // カスタムフックを呼び出して、会社名とニックネームを取り出します。
  const { nickname, companyName } = useUserInfo();
  
  // GitHubのURLを環境変数から取得します。
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
  
  // マネジメントコンソールのURLを環境変数から取得します。
  const managementConsoleUrl = import.meta.env.VITE_MANAGEMENT_CONSOLE_URL;

  // 指定したURLを新しいタブで安全に開くための関数です。
  const handleOpenLink = (url) => {
    
    // URLが設定されている場合のみ、別タブで開きます。
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // UI要素を返します。
  return (
    // 画面全体のコンテナです。チャット入力欄が消えるため、高さを画面いっぱいに使います。
    <div className="flex-1 flex flex-col relative bg-black/20 h-screen overflow-hidden">
      
      {/* ヘッダー部分です。 */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-4 bg-black/30 backdrop-blur-sm z-10 flex-shrink-0">
        {/* メニュー開閉ボタンの条件分岐です。サイドバーが閉じている時だけ表示します。 */}
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar} 
            className="text-white/70 hover:text-white text-xl" 
            title="メニューを開く"
          >
            ☰
          </button>
        )}
        {/* 画面のタイトルです。 */}
        <h2 className="text-lg font-bold text-white">ダッシュボード</h2>
      </div>

      {/* メインのコンテンツエリアです。チャットがなくなったので、カードを中央に配置しやすくします。 */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto mt-8">
          
          {/* ウェルカムメッセージと案内文を囲むコンテナです。 */}
          <div className="bg-black/40 p-8 rounded-xl border border-white/10 backdrop-blur-sm mb-8">
            <h3 className="text-2xl font-bold text-starlight-gold mb-4">{nickname}さん、お疲れ様です。</h3>
            <p className="text-white/80 leading-relaxed">
              ここはダッシュボード画面です。<br />
              生成AIを活用した各種プロジェクトの管理や、開発ツールへのアクセスはこちらから行えます。<br />
            </p>
          </div>

          {/* 各種手続きへのリンクカードを並べるグリッドコンテナです。 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* GitHubのカードです。 */}
            <div 
              onClick={() => handleOpenLink(githubUrl)}
              className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-starlight-gold/50 transition-all cursor-pointer group shadow-lg"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🐙</div>
              <h4 className="text-white font-bold text-lg mb-2 group-hover:text-starlight-gold transition-colors">GitHub</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                リポジトリの確認やプルリクエストの管理など、ソースコード管理を行います。
              </p>
            </div>

            {/* マネジメントコンソールのカードです。 */}
            <div 
              onClick={() => handleOpenLink(managementConsoleUrl)}
              className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-starlight-gold/50 transition-all cursor-pointer group shadow-lg"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">☁️</div>
              <h4 className="text-white font-bold text-lg mb-2 group-hover:text-starlight-gold transition-colors">マネジメントコンソール</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                AWSマネジメントコンソールを開き、クラウドリソースの管理・確認を行います。
              </p>
            </div>

            {/* （未定）のカード（将来の拡張用として残しておきます） */}
            <div 
              // まだリンク先がない場合はアラートを出すなどの仮処理を入れておきます。
              onClick={() => alert("準備中です。将来的にSlack連携の申請画面が開きます。")}
              className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-starlight-gold/50 transition-all cursor-pointer group shadow-lg"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🔧</div>
              <h4 className="text-white font-bold text-lg mb-2 group-hover:text-starlight-gold transition-colors">（未定）</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                現在準備中です。今後、追加のツールやサービスへのリンクを設置予定です。
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

// コンポーネントをエクスポートします。
export default Dashboard;