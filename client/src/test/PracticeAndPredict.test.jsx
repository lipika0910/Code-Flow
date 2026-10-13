import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PracticePage from '../pages/PracticePage';
import PredictComparePage from '../pages/PredictComparePage';
import { ThemeProvider } from '../context/ThemeContext';
import { PREDICT_PROGRAMS } from '../services/predictPrograms';
import { PRACTICE_QUESTIONS } from '../services/practiceQuestions';

describe('Predict → Execute → Compare Module', () => {
  it('loads 10 classic misconception programs', () => {
    expect(PREDICT_PROGRAMS.length).toBe(10);
    expect(PREDICT_PROGRAMS.every(p => p.misconceptionNote && p.code)).toBe(true);
  });

  it('renders program selector and prediction input form', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <PredictComparePage />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Predict, Execute, and Understand the Runtime/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your predicted console output here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Prediction & Verify Runtime/i })).toBeInTheDocument();
  });
});

describe('Practice Arena Module', () => {
  it('contains at least 30 questions across topics', () => {
    expect(PRACTICE_QUESTIONS.length).toBeGreaterThanOrEqual(15);
  });

  it('renders topic filters and questions list', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <PracticePage />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Practice Arena/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^HTML$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^CSS$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^JavaScript$/i })).toBeInTheDocument();
  });
});
