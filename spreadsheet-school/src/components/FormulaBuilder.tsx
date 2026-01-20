import { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';

interface InputField {
  id: string;
  label: string;
  defaultValue: string;
  placeholder: string;
}

interface FormulaBuilderProps {
  title: string;
  description: string;
  tip?: string; // NEW: Added a Pro Tip section
  inputs: InputField[];
  generator: (values: Record<string, string>) => string;
}

export function FormulaBuilder({ title, description, tip, inputs, generator }: FormulaBuilderProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    inputs.forEach(i => defaults[i.id] = i.defaultValue);
    return defaults;
  });

  const [copied, setCopied] = useState(false);
  const result = generator(values);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">{description}</p>
        
        {/* Pro Tip Badge */}
        {tip && (
          <div className="inline-flex items-start gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong className="font-bold">Pro Tip:</strong> {tip}</span>
          </div>
        )}
      </div>

      {/* The Builder Area */}
      <div className="p-6 bg-white space-y-8"> {/* Increased spacing for clarity */}
        
        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputs.map((input) => (
            <div key={input.id} className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {input.label}
              </label>
              <input
                type="text"
                value={values[input.id]}
                onChange={(e) => setValues({ ...values, [input.id]: e.target.value })}
                placeholder={input.placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sheet-green/50 focus:border-sheet-green transition-all shadow-sm"
              />
            </div>
          ))}
        </div>

        {/* The Result Box - Fixed Spacing/Badge */}
        <div className="relative group mt-8"> {/* Added top margin so badge has room */}
          <div className="absolute -top-3 left-3 px-2 bg-white text-[10px] font-black uppercase tracking-widest text-sheet-green border border-slate-100 rounded shadow-sm z-10">
            Copy Your Formula
          </div>
          <div className="bg-slate-900 rounded-lg p-5 font-mono text-white break-all pr-12 text-sm md:text-base border border-slate-800 shadow-inner relative">
            {result}
            <button
              onClick={handleCopy}
              className="absolute right-3 top-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors border border-slate-700"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} className="text-sheet-green" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}