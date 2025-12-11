// api/notificar.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  // Configuração de Segurança (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { token, titulo, corpo, link } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token de destino faltando' });
    }

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

    const response = await admin.messaging().send(message);
    console.log('Sucesso:', response);
    return res.status(200).json({ success: true, id: response });

  } catch (error) {
    console.error('Erro no envio:', error);
    
    // --- CÓDIGO DE ERRO PARA O APP RECONHECER ---
    const errorCode = error.code || error.errorInfo?.code || 'unknown';
    
    return res.status(500).json({ 
        error: {
            message: error.message,
            code: errorCode 
        }
    });
  }
};
