import { NextResponse } from 'next/server';
import { getAllCategoriesWithQuestions, getAllSpicyCards } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes ISR cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'lt';
    const audience = searchParams.get('audience') || 'romantic';

    const [sections, spicyCards] = await Promise.all([
      getAllCategoriesWithQuestions(locale, audience),
      getAllSpicyCards(locale, audience),
    ]);

    const totalQuestions = sections.reduce(
      (sum, s) => sum + s.questions.length,
      0
    );

    return NextResponse.json({
      title: `${totalQuestions} gilių klausimų`,
      total_questions: totalQuestions,
      sections,
      spicyCards,
    });
  } catch (error) {
    console.error('Failed to fetch game data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}
