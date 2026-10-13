import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '../context/ThemeContext';

describe('App Component', () => {
  it('renders navbar logo, tagline and guest banner correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByText('Code').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Flow').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Guest Mode Active:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Learn. Experiment. Execute./i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation links to core sections', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByRole('link', { name: /Learn/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /CodeLab/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /CodeTrace/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Practice/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Assessments/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Dashboard/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders live runnable demo on homepage', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Live Sandbox Demo/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Execute code in sandboxed iframe/i)).toBeInTheDocument();
  });
});
