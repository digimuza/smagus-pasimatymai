import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const question = searchParams.get('q') || 'Santykių Klausimai';
  const audience = searchParams.get('a') || 'romantic';

  const audienceConfig: Record<string, { icon: string; gradient: string }> = {
    romantic: { icon: '💜', gradient: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 50%, #A855F7 100%)' },
    family: { icon: '👨‍👩‍👧‍👦', gradient: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)' },
    kids: { icon: '🌈', gradient: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)' },
    friends: { icon: '🍻', gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)' },
  };

  const config = audienceConfig[audience] || audienceConfig.romantic;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: config.gradient,
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '32px',
            padding: '48px 56px',
            maxWidth: '90%',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 24, display: 'flex' }}>{config.icon}</div>
          <div
            style={{
              fontSize: question.length > 80 ? 32 : 40,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.4,
              fontWeight: 300,
              maxWidth: '800px',
              display: 'flex',
            }}
          >
            {question}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', display: 'flex' }}>
            Santykių Klausimai
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
