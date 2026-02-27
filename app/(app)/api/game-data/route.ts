import { NextResponse } from 'next/server';
import { getAllCategoriesWithQuestions, getAllSpicyCards } from '@/lib/api';

export const revalidate = 300; // 5 minutes ISR cache

export async function GET() {
  try {
    const [sections, spicyCards] = await Promise.all([
      getAllCategoriesWithQuestions(),
      getAllSpicyCards(),
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
