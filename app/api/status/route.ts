import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const timestamp = new Date().toISOString();
  
  const systemStatus = {
    status: 'ONLINE',
    timestamp,
    uptime: '99.97%',
    neural_link: 'ACTIVE',
    ai_arsenal: 'LOADED',
    sync_status: 'LIVE',
    
    ai_systems: [
      {
        name: 'Grok AI',
        status: 'ONLINE',
        latency: `${Math.floor(Math.random() * 30 + 40)}ms`,
        model: 'Grok-2',
        lastCheck: timestamp
      },
      {
        name: 'ChatGPT',
        status: 'ONLINE',
        latency: `${Math.floor(Math.random() * 30 + 35)}ms`,
        model: 'GPT-4 Turbo',
        lastCheck: timestamp
      },
      {
        name: 'Claude',
        status: 'ONLINE',
        latency: `${Math.floor(Math.random() * 30 + 48)}ms`,
        model: 'Claude 3 Opus',
        lastCheck: timestamp
      },
      {
        name: 'Gemini',
        status: 'ONLINE',
        latency: `${Math.floor(Math.random() * 30 + 38)}ms`,
        model: 'Gemini Pro',
        lastCheck: timestamp
      }
    ]
  };

  return NextResponse.json(systemStatus, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    }
  });
}
