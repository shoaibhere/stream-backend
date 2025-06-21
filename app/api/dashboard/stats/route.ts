import { NextResponse } from 'next/server';
import { getTeamsCount, getMatchesCount, getLiveMatches, getChannelsCount, getAdsCount } from '@/lib/data';

export async function GET() {
  try {
    const [
      teamsCount,
      matchesCount,
      liveMatches,
      channelsCount,
      adsCount
    ] = await Promise.all([
      getTeamsCount(),
      getMatchesCount(),
      getLiveMatches(),
      getChannelsCount(),
      getAdsCount()
    ]);

    return NextResponse.json({
      teamsCount,
      matchesCount,
      liveMatchesCount: liveMatches.length,
      channelsCount,
      adsCount,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}