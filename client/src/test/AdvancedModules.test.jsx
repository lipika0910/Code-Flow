import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import DebuggingLabPage from '../pages/DebuggingLabPage';
import DomExplorerPage from '../pages/DomExplorerPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import AdminPage from '../pages/AdminPage';

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </BrowserRouter>
  );
}

describe('Advanced Modules Test Suite', () => {
  it('renders Debugging Lab with category filters and staged hints', () => {
    renderWithProviders(<DebuggingLabPage />);

    expect(screen.getAllByText(/Debugging Lab/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /All Bugs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Syntax Errors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Runtime Exceptions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logic & Subtle Bugs/i })).toBeInTheDocument();

    // Verify hint button exists
    const revealHintBtn = screen.getByRole('button', { name: /Reveal Hint 1/i });
    expect(revealHintBtn).toBeInTheDocument();

    // Reveal hint
    fireEvent.click(revealHintBtn);
    expect(screen.getByText(/Check the string literal delimiter on line 2/i)).toBeInTheDocument();
  });

  it('renders DOM Explorer with presets, DOM tree and event dispatcher', () => {
    renderWithProviders(<DomExplorerPage />);

    expect(screen.getByText(/DOM Explorer & Event Mutator/i)).toBeInTheDocument();
    expect(screen.getByText(/DOM Tree Hierarchy/i)).toBeInTheDocument();
    expect(screen.getByText(/Node Inspector & Live Mutator/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate Event Dispatch/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trigger Event/i })).toBeInTheDocument();
  });

  it('renders Leaderboard with genuine ranking and leveling formula', () => {
    renderWithProviders(<LeaderboardPage />);

    expect(screen.getByText(/Student Standing & Gamification/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Rankings/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Level Progression/i)).toBeInTheDocument();
    expect(screen.getByText(/XP Reward Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Level = ⌊√\(XP \/ 100\)⌋ \+ 1/i)).toBeInTheDocument();
  });

  it('renders Analytics Page with topic proficiency, explainable rules, and export controls', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText(/Learning Analytics & Performance Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Topic Proficiency Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Concepts Needing Reinforcement/i)).toBeInTheDocument();
    expect(screen.getByText(/Explainable Recommendation Engine/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print Report/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export JSON/i })).toBeInTheDocument();
  });

  it('renders Admin Page with educator controls and security barrier', () => {
    renderWithProviders(<AdminPage />);

    expect(screen.getByText(/Course Administration & Management/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Practice Question/i })).toBeInTheDocument();
  });
});
