import { useRef, useEffect } from 'react';

// textareaの自動リサイズと送信時のキーボード制御を行うカスタムフックです。
export const useAutoResizeTextarea = (inputText, handleSendMessage) => {
  
  // textareaのDOM要素を操作するための参照を作成します。
  const textareaRef = useRef(null);

  // inputText（入力文字）が変化するたびに、入力欄の高さを自動調整します。
  useEffect(() => {
    
    // textareaの要素が画面に存在するかどうかを確認します。
    if (textareaRef.current) {
      
      // 一旦高さを'auto'にリセットし、文字が減った時に縮小できるようにします。
      textareaRef.current.style.height = 'auto';
      
      // 中身の文字の高さ（scrollHeight）に合わせて、実際の高さをpx単位で再設定します。
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    
  // useEffectの依存配列にinputTextを指定し、文字が変わるたびに発火させます。
  }, [inputText]);

  // 送信処理と、送信後の入力欄リセットをまとめた関数です。
  const executeSend = () => {
    
    // 親コンポーネントから渡された送信処理を実行します。
    handleSendMessage();
    
    // 送信後、textareaの要素が存在すれば高さを初期状態に戻します。
    if (textareaRef.current) {
      
      // 高さを'auto'に戻して1行分のサイズにします。
      textareaRef.current.style.height = 'auto';
    }
  };

  // キーボードのキーが押された時のイベントハンドラーです。
  const handleKeyDown = (e) => {
    
    // 日本語入力の変換中（Enterで確定する時など）は、送信処理をスキップします。
    if (e.nativeEvent.isComposing) return;

    // Enterキーが押され、かつShiftキーが押されていない場合を「送信」と判定します。
    if (e.key === 'Enter' && !e.shiftKey) {
      
      // デフォルトのEnterキーの動作（改行）を無効化します。
      e.preventDefault();
      
      // 送信とリセットをまとめた関数を実行します。
      executeSend();
    }
  };

  // コンポーネント側で使えるように、必要な参照と関数を返却します。
  return {
    textareaRef,
    executeSend,
    handleKeyDown
  };
};