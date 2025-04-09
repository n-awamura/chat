// Gemini API エンドポイント URL（Cloudflare Worker 経由のものを利用）
const GEMINI_API_URL = "https://gemini-model-switcher.fudaoxiang-gym.workers.dev";

// 送信ボタンのクリックイベントを設定
document.getElementById("submitBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("promptInput").value;
  const responseOutput = document.getElementById("responseOutput");
  responseOutput.innerText = "処理中...";

  try {
    // リクエストペイロードの組み立て
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      model: "gemini-2.0-flash-exp",  // streamlit 例と同様に、拡張モデルを利用
      config: {
        // グラウンディングとして、Google検索ツールを利用する設定
        tools: [
          {
            googleSearchRetrieval: {
              dynamicRetrievalConfig: {
                mode: "MODE_DYNAMIC",
                dynamicThreshold: 0.7
              }
            }
          }
        ],
        temperature: 0.0
      }
    };

    // Gemini API エンドポイントへ POST リクエスト
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      responseOutput.innerText = "エラー: " + response.statusText;
      return;
    }
    
    const resJson = await response.json();

    // レスポンスから回答とグラウンディング情報を抽出・整形
    if (resJson && resJson.candidates && resJson.candidates.length > 0) {
      const candidate = resJson.candidates[0];
      const answer = candidate.content.parts[0].text;
      const groundingMetadata = candidate.groundingMetadata;
      
      let formattedResponse = answer + "\n【参考URL】\n";
      
      if (groundingMetadata && groundingMetadata.groundingChunks) {
        groundingMetadata.groundingChunks.forEach(chunk => {
          if (chunk.web && chunk.web.uri && chunk.web.title) {
            formattedResponse += `${chunk.web.title}：${chunk.web.uri}\n`;
          }
        });
      }
      
      responseOutput.innerText = formattedResponse;
    } else {
      responseOutput.innerText = "回答が得られませんでした。";
    }
  } catch (error) {
    console.error("Error:", error);
    responseOutput.innerText = "エラーが発生しました: " + error.message;
  }
});
