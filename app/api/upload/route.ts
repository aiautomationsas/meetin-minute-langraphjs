import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json() as HandleUploadBody;

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

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: 'Error handling upload' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';