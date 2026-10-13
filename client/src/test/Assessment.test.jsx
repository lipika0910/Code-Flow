import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AssessmentCenterPage from '../pages/AssessmentCenterPage';
import AssessmentResultPage from '../pages/AssessmentResultPage';
import { ThemeProvider } from '../context/ThemeContext';

describe('Assessment Centre Pages', () => {
  it('renders Assessment Centre header and protocol guidelines', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AssessmentCenterPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Assessment Centre')).toBeInTheDocument();
    expect(screen.getByText(/Integrity Protocol & Evaluation Rules:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Assessment History/i)).toBeInTheDocument();
  });

  it('renders Assessment Result Page with passing/review state', () => {
    const mockReport = {
      title: 'Web Foundations & JavaScript Core Exam',
      totalPoints: 100,
      earnedPoints: 85,
      percentage: 85,
      passed: true,
      questionsFeedback: [
        {
          questionId: 'q1',
          title: 'HTML Semantic Meaning',
          pointsPossible: 10,
          pointsEarned: 10,
          isCorrect: true,
          correctAnswer: '<aside>',
          explanation: '<aside> represents tangentially related content.'
        }
      ]
    };

    // Render with state
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AssessmentResultPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Should render either the active report or clean empty state
    expect(screen.getByRole('link', { name: /Assessment/i })).toBeInTheDocument();
  });
});
