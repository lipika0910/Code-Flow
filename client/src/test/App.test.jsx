import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '../context/ThemeContext';

describe('App Component', () => {
  it('renders navbar logo and tagline correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Flow')).toBeInTheDocument();
    expect(screen.getByText(/Learn. Experiment. Execute. Understand. Assess./i)).toBeInTheDocument();
  });

  it('renders navigation links to core sections', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /^Learn$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^CodeLab$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^CodeTrace$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Practice$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Assessments$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Dashboard$/i })).toBeInTheDocument();
  });
});
