import { Copy, Check, ChevronDown, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface InputField {
  id: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}

interface FormulaBuilderProps {
  title: string;
  description: string;
  tip: string;
  explanation?: string; // New Optional Prop
  inputs: InputField[];
  generator: (values: Record<string, string>) => string;
}

export function FormulaBuilder({ title, description, tip, explanation, inputs, generator }: FormulaBuilderProps) {
  const [values, setValues] = useState<Record<string, string>>(() => 
    inputs.reduce((acc, input) => ({ ...acc, [input.id]: input.defaultValue }), {})
  );
  const [copied, setCopied] = useState(false);

  const formula = generator(values);

  const handleCopy = () => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>

        {/* SEO/AEO OPTIMISED ACCORDION */}
        {explanation && (
          <details className="group">
            <summary className="flex items-center gap-2 text-sm font-bold text-blue-600 cursor-pointer select-none hover:text-blue-700 transition-colors">
              <BookOpen size={16} />
              <span>How does this formula work?</span>
              <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-3 text-sm text-slate-600 bg-blue-50 p-4 rounded-lg border border-blue-100 leading-relaxed">
              {explanation}
            </div>
          </details>
        )}

        {/* Tip Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-900">
           <span className="shrink-0 font-bold">ℹ️ Pro Tip:</span>
           <span>{tip}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                {input.label}
              </label>
              <input
                type="text"
                value={values[input.id]}
                onChange={(e) => setValues({ ...values, [input.id]: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sheet-green/20 focus:border-sheet-green transition-all placeholder:text-slate-400"
                placeholder={input.placeholder}
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
           <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sheet-green uppercase tracking-widest">Copy your formula</span>
           </div>
           <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between gap-4 group cursor-pointer relative" onClick={handleCopy}>
              <code className="font-mono text-sm md:text-base text-white break-all">{formula}</code>
              <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 shrink-0">
                {copied ? <Check size={20} className="text-sheet-green" /> : <Copy size={20} />}
              </button>
              {copied && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sheet-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-fade-in-up">
                  Copied!
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
