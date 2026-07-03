import { useState, useEffect } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

// プロジェクト一覧を管理するカスタムフックを定義します。
export const useProjects = (isLoggedIn) => {
  
  // プロジェクトの配列を管理する状態変数です。
  const [projects, setProjects] = useState([]);
  
  // 環境変数からAPIのエンドポイントURLを取得します。
  const apiUrl = import.meta.env.VITE_PROJECTS_API_URL;

  // プロジェクト一覧をAPIから取得する非同期関数です。
  const fetchProjects = async () => {
    try {
        
      // Cognitoから現在ログイン中のユーザー情報を取得します。
      const attributes = await fetchUserAttributes();
      
      // ユーザーの固有ID（sub）を取得します。
      const userId = attributes.sub;
      
      // ユーザーIDが取得できなかった場合は、エラーを投げて処理を中断します。
      if (!userId) {
        throw new Error('ユーザーIDが取得できませんでした。');
      }

      // 取得したuserIdを使って、APIへGETリクエストを送信します。
      const response = await fetch(`${apiUrl}/projects?userId=${userId}`);

      // レスポンスが正常か確認します。
      if (response.ok) {
        
        // JSONデータを解析します。
        const data = await response.json();
        
        // 取得したプロジェクト一覧を状態にセットします。
        setProjects(data);
      }
    } catch (error) {
        
      // エラー時はコンソールに出力します。
      console.error("API通信エラー:", error);
    }
  };

  // 新しいプロジェクトを追加する非同期関数です。
  const handleAddProject = async (newProjectName) => {
    
    try {
      // Cognitoから現在ログイン中のユーザー情報を取得します。
      const attributes = await fetchUserAttributes();
      
      // ユーザーの固有ID（sub）を取得します。
      const userId = attributes.sub;
      
      // ユーザーIDが取得できなかった場合は、エラーを投げて処理を中断します。
      if (!userId) {
        throw new Error('ユーザーIDが取得できませんでした。');
      }

      // APIに対してPOSTリクエストを送信します。
      const response = await fetch(`${apiUrl}/projects`, {
        
        // メソッドをPOSTに指定します。
        method: 'POST',
        
        // JSON形式であることをヘッダーで伝えます。
        headers: { 'Content-Type': 'application/json' },
        
        // 動的なuserIdとプロジェクト名をJSON文字列にして送信します。
        body: JSON.stringify({ userId: userId, projectName: newProjectName })
      });

      // 正常に保存されたか確認します。
      if (response.ok) {
        
        // 作成されたデータを受け取ります。
        const newProject = await response.json();
        
        // 画面のリストの末尾に、作成したプロジェクトを追加します。
        setProjects(prev => [...prev, newProject]);
      }
    } catch (error) {
        
      // エラー時はコンソールに出力します。
      console.error("API通信エラー:", error);
    }
  };
  
  // プロジェクトを削除するためのビジネスロジック関数です。
  const handleDeleteProject = async (projectId) => {
    try {

      // Cognitoから現在ログイン中のユーザー情報を取得します。
      const attributes = await fetchUserAttributes();

      // ユーザーの固有ID（sub）を取得します。
      const userId = attributes.sub;

      // 削除用のAPIエンドポイントに対して、DELETEメソッドでリクエストを送信します。
      const response = await fetch(`${apiUrl}/projects?projectId=${projectId}&userId=${userId}`, {
        
        // HTTPメソッドを「DELETE」に指定します。
        method: "DELETE",
        
        // リクエストヘッダーにJSON形式で通信することを明記します。
        headers: {
          "Content-Type": "application/json"
        }
      });

      // レスポンスが正常（ステータス200番台）ではない場合のエラーハンドリングです。
      if (!response.ok) {
        
        // 例外を発生させてcatchブロックに処理を移します。
        throw new Error("プロジェクトの削除に失敗しました");
      }

      // 画面に表示されているプロジェクト一覧（状態）から、削除したプロジェクトを除外して更新します。
      setProjects((prevProjects) => prevProjects.filter(p => p.projectId !== projectId));

    } catch (error) {
      
      // ユーザーに向けて削除エラーが発生したことをアラートで通知します。
      alert(error.message);
    }
  };

  // ログイン状態（isLoggedIn）が変化した時に実行するフックです。
  useEffect(() => {
    
    // ログイン済みと判定された場合のみ、データ取得を実行します。
    if (isLoggedIn) {
      fetchProjects();
    }
    
  // 依存配列にisLoggedInを指定します。
  }, [isLoggedIn]);

  // App.jsxで使えるように、状態とすべての関数を一つにまとめて返却します。
  return { projects, handleAddProject, handleDeleteProject };
};