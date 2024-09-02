import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Opcional: verifica la autenticación del usuario aquí
        return {
          allowedContentTypes: ['audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/m4a', 'audio/aac'],
          tokenPayload: JSON.stringify({
            // Opcional: incluye metadatos adicionales en el token
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Opcional: haz algo con el blob después de que se haya subido
        console.log('Upload completed', blob, tokenPayload);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return response.status(500).json({ error: 'Error handling upload' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};