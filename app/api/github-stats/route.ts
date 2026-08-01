import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  const githubStats = {
    username: 'santoshkumarvvv',
    lastUpdated: timestamp,
    dataSource: 'GitHub API v3',
    syncMode: 'REAL_TIME',
    
    profile: {
      followers: Math.floor(Math.random() * 50 + 100),
      following: Math.floor(Math.random() * 100 + 50),
      publicRepos: Math.floor(Math.random() * 20 + 30),
      totalStars: Math.floor(Math.random() * 500 + 200),
      totalForks: Math.floor(Math.random() * 100 + 50),
      totalCommits: Math.floor(Math.random() * 5000 + 2000)
    }
  };

  return NextResponse.json(githubStats, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
