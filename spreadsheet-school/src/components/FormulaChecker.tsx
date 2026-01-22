import { useState } from 'react';
import { useFormulaLinter } from '../hooks/useFormulaLinter'; // Update path if needed
import { AlertTriangle, Wand2, Check, Copy } from 'lucide-react';

export const FormulaChecker = () => {
  const [input, setInput] = useState('=IF(B2>1000, Bonus, Standard)');
  const { suggestion, error } = useFormulaLinter(input);
  const [copied, setCopied] = useState(false);

  const applyFix = () => {
    if (suggestion) setInput(suggestion);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-10">
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Paste your broken formula
          </label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full font-mono text-sm p-4 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition-all"
              placeholder="=IF(A1=Pending, ...)"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Diagnostic Area */}
        <div className={`p-4 rounded-lg border transition-all duration-300 ${
          error 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-slate-50 border-slate-100'
        }`}>
          {error ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="w-full">
                <h3 className="font-semibold text-amber-800 text-sm">Potential Error Found</h3>
                <p className="text-amber-700 text-sm mt-1">{error}</p>
                
                {suggestion && (
                  <div className="mt-3 p-3 bg-white/60 rounded border border-amber-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <code className="text-xs font-mono text-slate-600 break-all bg-white px-2 py-1 rounded border border-slate-200">
                      {suggestion}
                    </code>
                    <button 
                      onClick={applyFix}
                      className="whitespace-nowrap px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Wand2 className="w-3 h-3" />
                      Auto-Fix
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-500">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">No obvious syntax errors found.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
