import { SignJWT, importPKCS8 } from 'jose';

export default {
  async fetch(request, env) {
    try {
      // シークレット内のリテラル "\n" を実際の改行文字に変換する
      const privateKeyPEM = env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");
      const clientEmail = env.SERVICE_ACCOUNT_CLIENT_EMAIL;

      // 現在のUNIXタイムスタンプ（秒単位）
      const now = Math.floor(Date.now() / 1000);

      // JWT ペイロードの作成
      const payload = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/webmasters',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600, // 有効期限1時間
      };

      // 秘密鍵から CryptoKey を生成（RS256形式）
      const privateKey = await importPKCS8(privateKeyPEM, 'RS256');

      // JWT の生成と署名
      const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .sign(privateKey);

      // トークンリクエスト用パラメータの作成
      const params = new URLSearchParams();
      params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      params.append('assertion', jwt);

      // Google の OAuth2 トークンエンドポイントに POST リクエスト
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (!tokenResponse.ok) {
        return new Response(`Token retrieval error: ${tokenResponse.statusText}`, {
          status: tokenResponse.status,
        });
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 取得したアクセストークンを JSON 形式で返す
      return new Response(JSON.stringify({ accessToken }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(`Internal error: ${error.message}`, { status: 500 });
    }
  },
};
