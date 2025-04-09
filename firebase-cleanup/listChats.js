const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const readline = require('readline');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// readlineインターフェースの設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 全チャットセッションを一覧出力する関数
async function listChatSessions() {
  const snapshot = await db.collection("chatSessions").get();
  let sessions = [];
  snapshot.forEach(doc => {
    sessions.push({ id: doc.id, data: doc.data() });
  });
  sessions.forEach(session => {
    console.log(`ID: ${session.id}`, session.data);
  });
  return sessions;
}

// 指定したIDのチャットセッションを削除する関数
async function deleteChatSession(id) {
  try {
    await db.collection("chatSessions").doc(id).delete();
    console.log(`Deleted chat session with ID: ${id}`);
  } catch (error) {
    console.error(`Error deleting session ${id}:`, error);
  }
}

// ユーザーに削除対象を入力させるプロンプト
async function promptForDeletion() {
  // 一覧出力してからプロンプトを表示
  await listChatSessions();
  rl.question("削除したいチャットのIDを入力してください（終了するには 'exit' と入力）：", async (answer) => {
    if (answer.toLowerCase() === 'exit') {
      rl.close();
      process.exit(0);
    } else {
      await deleteChatSession(answer);
      // 削除後、再度プロンプトを表示
      promptForDeletion();
    }
  });
}

promptForDeletion();
