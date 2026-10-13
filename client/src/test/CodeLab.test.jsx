import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CodeLabPage from '../pages/CodeLabPage';
import { explainError } from '../services/errorExplainer';
import { ThemeProvider } from '../context/ThemeContext';

describe('Error Explainer Service', () => {
  it('correctly diagnoses ReferenceError for undefined variables', () => {
    const error = new Error('myVar is not defined');
    error.name = 'ReferenceError';
    const diag = explainError(error);

    expect(diag.type).toBe('ReferenceError');
    expect(diag.likelyCause).toContain('myVar');
    expect(diag.suggestedFix).toContain('let');
  });

  it('correctly diagnoses TypeError for non-functions', () => {
    const error = new Error('doSomething is not a function');
    error.name = 'TypeError';
    const diag = explainError(error);

    expect(diag.type).toBe('TypeError');
    expect(diag.likelyCause).toContain('doSomething');
  });

  it('correctly diagnoses infinite loop execution timeouts', () => {
    const error = new Error('Execution timed out (2500ms). Infinite loop detected.');
    const diag = explainError(error);

    expect(diag.likelyCause).toContain('infinite loop');
    expect(diag.suggestedFix).toContain('loop termination conditions');
  });
});

describe('CodeLab IDE Component', () => {
  it('renders runtime mode switch buttons', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <CodeLabPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Web \(HTML\/CSS\/JS\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /JS Worker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Run$/i })).toBeInTheDocument();
  });

  it('switches between Web and JS Worker modes', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <CodeLabPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    const workerBtn = screen.getByRole('button', { name: /JS Worker/i });
    fireEvent.click(workerBtn);

    expect(screen.getByText(/Worker Execution Terminal/i)).toBeInTheDocument();
  });
});
