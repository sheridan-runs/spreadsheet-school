import { useState, useEffect } from 'react';

// Common Excel/Google Sheets functions to ignore
const KNOWN_FUNCTIONS = new Set([
  "IF", "SUM", "AVERAGE", "COUNT", "COUNTA", "VLOOKUP", "XLOOKUP", 
  "HLOOKUP", "INDEX", "MATCH", "AND", "OR", "NOT", "TRUE", "FALSE", 
  "TODAY", "NOW", "DATE", "YEAR", "MONTH", "DAY", "ISBLANK", "ISERROR",
  "LEFT", "RIGHT", "MID", "LEN", "TRIM", "CONCATENATE", "TEXT"
]);

// Regex to identify cell references (e.g., A1, $B$2, AA10)
const CELL_REF_REGEX = /^\$?[A-Z]{1,3}\$?[0-9]+$/i;

export const useFormulaLinter = (formula: string) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formula || !formula.startsWith('=')) {
      setSuggestion(null);
      setError(null);
      return;
    }

    // Split formula into tokens, keeping delimiters
    const parts = formula.split(/([=<>(),\s+\-*/&])/);

    let needsFix = false;
    let detectedError = null;

    const fixedParts = parts.map((part) => {
      const token = part.trim();

      // Skip empty, delimiters, numbers, or strings that are already quoted
      if (
        !token || 
        /^["'].*["']$/.test(token) || 
        !isNaN(Number(token)) ||      
        /^[=<>(),\s+\-*/&]+$/.test(token) 
      ) {
        return part;
      }

      // Check if it's a known function or cell reference
      const upperToken = token.toUpperCase();
      if (KNOWN_FUNCTIONS.has(upperToken) || CELL_REF_REGEX.test(token)) {
        return part; 
      }

      // If we got here, it's text that isn't a function or cell.
      needsFix = true;
      detectedError = `"${token}" looks like text but is missing quotes.`;
      return `"${token}"`; // Add quotes
    });

    if (needsFix) {
      setSuggestion(fixedParts.join(''));
      setError(detectedError);
    } else {
      setSuggestion(null);
      setError(null);
    }

  }, [formula]);

  return { suggestion, error };
};
