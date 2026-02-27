'use client';

import React, { useEffect, useState } from 'react';

interface Stats {
  questions: number;
  categories: number;
  spicyCards: number;
  spicyCardTypes: number;
}

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [questions, categories, spicyCards, spicyCardTypes] = await Promise.all([
          fetch('/api/questions?limit=0').then((r) => r.json()),
          fetch('/api/categories?limit=0').then((r) => r.json()),
          fetch('/api/spicy-cards?limit=0').then((r) => r.json()),
          fetch('/api/spicy-card-types?limit=0').then((r) => r.json()),
        ]);

        setStats({
          questions: questions.totalDocs ?? 0,
          categories: categories.totalDocs ?? 0,
          spicyCards: spicyCards.totalDocs ?? 0,
          spicyCardTypes: spicyCardTypes.totalDocs ?? 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Loading stats...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    { label: 'Questions', count: stats.questions, emoji: '❓' },
    { label: 'Categories', count: stats.categories, emoji: '📂' },
    { label: 'Spicy Cards', count: stats.spicyCards, emoji: '🌶️' },
    { label: 'Card Types', count: stats.spicyCardTypes, emoji: '🏷️' },
  ];

  return (
    <div style={{ padding: '20px 0' }}>
      <h3 style={{ marginBottom: '16px' }}>Content Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--theme-elevation-150)',
              background: 'var(--theme-elevation-50)',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.emoji}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{card.count}</div>
            <div style={{ fontSize: '14px', color: 'var(--theme-elevation-500)' }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
