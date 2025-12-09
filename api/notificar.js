// api/notificar.js
const admin = require("firebase-admin");

// Inicia o Firebase apenas uma vez
if (!admin.apps.length) {
  // A chave virá do segredo guardado na Vercel
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  // Configuração de Segurança (CORS) para aceitar pedidos do seu site
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde rápido para testes de conexão do navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Só aceita envio de dados (POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { token, titulo, corpo, link } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Faltou o token de destino' });
    }

    // O Pacote que vai pro Google
    const message = {
      token: token,
      notification: {
        title: titulo,
        body: corpo
      },
      webpush: {
        fcm_options: {
          link: link || 'https://jbr284.github.io/Chat-Family-Rosa/'
        }
      }
    };

    // Envia!
    const response = await admin.messaging().send(message);
    console.log('Sucesso:', response);
    return res.status(200).json({ success: true, id: response });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: error.message });
  }
};