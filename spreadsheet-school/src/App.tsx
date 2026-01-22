import { FileSpreadsheet, Menu, X, Github, ChevronRight, ArrowUpRight, Info, BookOpen, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FormulaBuilder } from './components/FormulaBuilder';
import { FormulaChecker } from './components/FormulaChecker';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // --- SMART HELPERS ---
  const smartQuote = (val: string) => {
    if (!val) return '""'; 
    const clean = val.trim();
    if (!isNaN(Number(clean)) || clean.startsWith('"') || clean.startsWith('=') || clean.match(/^[A-Z]+[0-9]+(:[A-Z]+[0-9]+)?$/)) {
      return clean;
    }
    return `"${clean}"`;
  };

  const smartRange = (val: string) => {
    if (!val) return '';
    const clean = val.trim();
    if (clean.includes('!')) {
      const parts = clean.split('!');
      const sheet = parts[0];
      const range = parts.slice(1).join('!'); 
      if (sheet.trim().startsWith("'") && sheet.trim().endsWith("'")) return clean;
      return `'${sheet}'!${range}`;
    }
    if (clean.includes(' ')) {
       const parts = clean.split(' ');
       const range = parts.pop(); 
       const sheet = parts.join(' '); 
       return `'${sheet}'!${range}`;
    }
    return clean;
  };

  // --- DATA ---
  const formulas = [
    {
      id: 'vlookup',
      title: 'Connect Data (VLOOKUP)',
      description: 'The standard way to merge data. Use this when you have two separate lists (e.g., a "Sales" list and a "Product" list) and you need to pull information from one to the other.',
      explanation: "VLOOKUP stands for Vertical Lookup. It searches for a specific value in the first column of a dataset and returns a value in the same row from a specified column. Think of it like a restaurant menu: You look down the list for the 'Dish Name' (Search Key), and then look across to find the 'Price' (Result).",
      tip: 'Remember to check the Syntax 101 above if your sheet references aren\'t working!',
      inputs: [
        { id: 'searchKey', label: 'The Search Key', defaultValue: 'G3', placeholder: 'e.g. A2' },
        { id: 'range', label: 'The range to search inside', defaultValue: 'Sheet2!A:C', placeholder: 'Sheet2!A:C' },
        { id: 'index', label: 'Which column number has the result?', defaultValue: '3', placeholder: 'e.g. 2 (If data is in Col B)' },
      ],
      generator: (v: any) => `=VLOOKUP(${v.searchKey}, ${smartRange(v.range)}, ${v.index}, FALSE)`
    },
    {
      id: 'if-logic',
      title: 'Logic Rules (IF)',
      description: 'Allows your spreadsheet to make decisions. It checks if a statement is true or false, and returns a different result for each outcome.',
      explanation: "The IF function runs a logical test to see if a specific condition is met. If the condition is true, it returns one value; if false, it returns another. Think of it like a bouncer at a club: 'IF you are over 18, come in (True); otherwise, go home (False).'",
      tip: 'We automatically add quotes for text results. Just type Bonus and we handle the rest.',
      inputs: [
        { id: 'condition', label: 'The Logical Test', defaultValue: 'B2 > 1000', placeholder: 'e.g. B2 > 1000' },
        { id: 'trueVal', label: 'Result if YES (True)', defaultValue: 'Bonus', placeholder: 'Bonus' },
        { id: 'falseVal', label: 'Result if NO (False)', defaultValue: 'Review', placeholder: 'Review' },
      ],
      generator: (v: any) => `=IF(${v.condition}, ${smartQuote(v.trueVal)}, ${smartQuote(v.falseVal)})`
    },
    {
      id: 'sumifs',
      title: 'Sum with Conditions (SUMIFS)',
      description: 'Adds up numbers, but only if they meet specific criteria. (e.g. "Total Revenue" but ONLY for "Product A").',
      explanation: "SUMIFS adds numerical values based on multiple criteria. Unlike a simple SUM, it filters the data before adding it. Think of it like calculating your grocery bill but asking: 'What is the total cost ONLY for items that are Fruit?'",
      tip: 'The column you want to add up (Sum Range) always comes FIRST in this formula.',
      inputs: [
        { id: 'sumRange', label: 'Which column contains the numbers to add?', defaultValue: 'C:C', placeholder: 'e.g. C:C (Revenue)' },
        { id: 'criteriaRange', label: 'Which column are we checking?', defaultValue: 'A:A', placeholder: 'e.g. A:A (Product Names)' },
        { id: 'criterion', label: 'What must it match?', defaultValue: 'Widgets', placeholder: 'Widgets' },
      ],
      generator: (v: any) => `=SUMIFS(${smartRange(v.sumRange)}, ${smartRange(v.criteriaRange)}, ${smartQuote(v.criterion)})`
    },
    {
      id: 'filter',
      title: 'Filter Data (FILTER)',
      description: 'The modern alternative to VLOOKUP. It returns a list of ALL matches, not just the first one. Great for creating mini-reports.',
      explanation: "The FILTER function extracts a list of values that meet specific criteria. Unlike VLOOKUP, which only finds the first match, FILTER returns every single match. Think of it like a sieve: You pour all your data in, and only the 'Gold Nuggets' (matches) stay.",
      tip: 'This is an "Array Formula", meaning it will spill results into multiple cells. Make sure there is empty space below it!',
      inputs: [
        { id: 'range', label: 'The full list you want to filter', defaultValue: 'A2:D100', placeholder: 'A2:D100' },
        { id: 'checkCol', label: 'Which column are we checking?', defaultValue: 'B2:B100', placeholder: 'B2:B100' },
        { id: 'value', label: 'Value to match (e.g. Completed)', defaultValue: 'Completed', placeholder: 'Completed' },
      ],
      generator: (v: any) => `=FILTER(${smartRange(v.range)}, ${smartRange(v.checkCol)} = ${smartQuote(v.value)})`
    },
    {
      id: 'text-join',
      title: 'Combine Text (TEXTJOIN)',
      description: 'Merges text from multiple cells. Unlike CONCATENATE, this lets you pick a separator (like a comma) and ignores empty cells.',
      explanation: "TEXTJOIN combines text from multiple strings or ranges, separating them with a specified delimiter (like a comma). It is smarter than CONCATENATE because it can automatically ignore empty cells. Great for creating comma-separated lists from a column of names.",
      tip: 'We automatically handle the separator quotes for you. Just type a comma.',
      inputs: [
        { id: 'delimiter', label: 'The Separator', defaultValue: ', ', placeholder: ', ' },
        { id: 'range', label: 'The cells to combine', defaultValue: 'A2:A10', placeholder: 'A2:A10' },
      ],
      generator: (v: any) => `=TEXTJOIN("${v.delimiter.replace(/"/g, '')}", TRUE, ${smartRange(v.range)})`
    },
    {
      id: 'unique',
      title: 'Find Duplicates (UNIQUE)',
      description: 'Instantly looks at a messy list with repeating items and returns a clean list of only the unique values.',
      explanation: "The UNIQUE function scans a list or range and returns a new list containing every value exactly once. It effectively removes all duplicates. Think of it like taking a roll call where you only write down each person's name the first time you hear it.",
      tip: 'Combine this with SORT to get a perfectly organized list: =SORT(UNIQUE(A:A))',
      inputs: [
        { id: 'range', label: 'The column with duplicates', defaultValue: 'A2:A', placeholder: 'A2:A' },
      ],
      generator: (v: any) => `=UNIQUE(${smartRange(v.range)})`
    },
    {
      id: 'trim',
      title: 'Clean Text (TRIM)',
      description: 'Removes accidentally added spaces from the start or end of text. Essential for cleaning data before doing a VLOOKUP.',
      explanation: "TRIM removes all extra spaces from text, leaving only single spaces between words. It strips leading and trailing whitespace that often causes errors in formulas like VLOOKUP. It turns '  Apple  ' into 'Apple'.",
      tip: 'If your VLOOKUP is failing but the data looks correct, try wrapping it in TRIM(). " Space " is not the same as "Space".',
      inputs: [
        { id: 'text', label: 'The cell with messy text', defaultValue: 'A2', placeholder: 'A2' },
      ],
      generator: (v: any) => `=TRIM(${v.text})`
    },
    {
      id: 'importrange',
      title: 'Link Sheets (IMPORTRANGE)',
      description: 'The Google Sheets superpower. Pulls live data from a completely different spreadsheet file into your current one.',
      explanation: "IMPORTRANGE allows you to import a range of cells from one Google Sheets spreadsheet into another. It creates a live link between files. Think of it like a tunnel connecting two different buildings, allowing data to flow from one to the other.",
      tip: 'The first time you use this, you will see a #REF! error. Hover over the cell and click "Allow Access" to connect the sheets.',
      inputs: [
        { id: 'url', label: 'The URL of the OTHER sheet', defaultValue: 'https://docs.google.com...', placeholder: 'Paste full URL...' },
        { id: 'range', label: 'The tab and range to grab', defaultValue: 'Sheet1!A:C', placeholder: 'Sheet1!A:C' },
      ],
      generator: (v: any) => `=IMPORTRANGE(${smartQuote(v.url)}, ${smartQuote(v.range)})`
    },
    {
      id: 'iferror',
      title: 'Hide Errors (IFERROR)',
      description: 'Wraps around any formula to catch ugly errors like #N/A or #DIV/0! and replace them with something cleaner (or nothing at all).',
      explanation: "IFERROR checks if a formula results in an error (like #N/A or #DIV/0!). If an error is found, it returns a custom value (like 'Not Found' or a blank cell) instead of the scary error code. It acts like a safety net for your formulas.",
      tip: 'Leave the "What to show" box blank to simply show an empty cell if an error occurs.',
      inputs: [
        { id: 'formula', label: 'Your existing formula', defaultValue: 'VLOOKUP(A2, B:C, 2, FALSE)', placeholder: 'Your Formula...' },
        { id: 'value', label: 'What to show instead (Leave blank for empty)', defaultValue: '', placeholder: 'e.g. Not Found' },
      ],
      generator: (v: any) => `=IFERROR(${v.formula}, ${v.value === '' ? '""' : smartQuote(v.value)})`
    },
    {
      id: 'eomonth',
      title: 'Finance Dates (EOMONTH)',
      description: 'Calculates the specific date for the "End Of Month". Crucial for financial modeling, runway calculations, and billing cycles.',
      explanation: "EOMONTH returns the date of the last day of the month which falls a specified number of months before or after a start date. It is essential for financial models where invoices are due at the end of the month. '0' means this month, '1' means next month.",
      tip: 'Use "0" to get the end of the current month. Use "1" for next month, "-1" for last month.',
      inputs: [
        { id: 'date', label: 'The starting date cell', defaultValue: 'A2', placeholder: 'A2' },
        { id: 'months', label: 'How many months forward/back?', defaultValue: '1', placeholder: '1' },
      ],
      generator: (v: any) => `=EOMONTH(${v.date}, ${v.months})`
    }
  ];

  // --- SCROLL SPY LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Check Syntax
      const syntaxEl = document.getElementById('syntax-101');
      if (syntaxEl && syntaxEl.offsetTop <= scrollPosition && (syntaxEl.offsetTop + syntaxEl.offsetHeight) > scrollPosition) {
          setActiveSection('syntax-101');
          return;
      }

      // Check Formula Doctor
      const doctorEl = document.getElementById('formula-doctor');
      if (doctorEl && doctorEl.offsetTop <= scrollPosition && (doctorEl.offsetTop + doctorEl.offsetHeight) > scrollPosition) {
          setActiveSection('formula-doctor');
          return;
      }

      // Check Formulas
      for (const formula of formulas) {
        const element = document.getElementById(formula.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
           setActiveSection(formula.id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [formulas]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 border-r border-slate-200 bg-white z-10">
        
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-sheet-green rounded-lg flex items-center justify-center text-white shadow-sm shadow-green-200">
            <FileSpreadsheet size={22} />
          </div>
          <div className="leading-tight">
            <span className="font-bold tracking-tight text-lg block">Spreadsheet</span>
            <span className="font-bold tracking-tight text-lg text-slate-400">School</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-6">
          
          {/* TOP SECTION: TOOLS */}
          <div className="mb-6">
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tools</p>
            <div className="space-y-1">
              {/* Syntax 101 */}
              <a 
                href="#syntax-101" 
                className={`group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  activeSection === 'syntax-101' 
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="flex items-center gap-2"><BookOpen size={16}/> Syntax 101</span>
                {activeSection === 'syntax-101' && <ChevronRight size={14} />}
              </a>

              {/* Formula Doctor */}
              <a 
                href="#formula-doctor" 
                className={`group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  activeSection === 'formula-doctor' 
                    ? 'bg-purple-50 text-purple-600 font-bold shadow-sm' 
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span className="flex items-center gap-2"><Wand2 size={16}/> Debug Formulas</span>
                {activeSection === 'formula-doctor' && <ChevronRight size={14} />}
              </a>
            </div>
          </div>

          {/* DIVIDER */}
          <hr className="border-slate-100 mb-6 mx-2" />

          {/* BOTTOM SECTION: FUNCTIONS */}
          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Core Functions</p>
            <div className="space-y-1">
              {formulas.map(f => (
                <a 
                  key={f.id} 
                  href={`#${f.id}`} 
                  className={`group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    activeSection === f.id 
                      ? 'bg-green-50 text-sheet-green font-bold shadow-sm' 
                      : 'text-slate-600 hover:text-sheet-green hover:bg-slate-50'
                  }`}
                >
                  <span>{f.title.split(' (')[0]}</span>
                  {activeSection === f.id && (
                    <ChevronRight size={14} className="text-sheet-green" />
                  )}
                </a>
              ))}
            </div>
          </div>

        </nav>
        
        {/* Footer Link */}
        <div className="p-6 border-t border-slate-100">
          <a 
            href="https://sheridanjamieson.com" 
            target="_blank" 
            rel="me noopener noreferrer"
            className="text-xs text-slate-500 hover:text-sheet-green flex items-center gap-2 font-medium transition-colors"
          >
            <Github size={14} /> Built by Sheridan Jamieson
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
           <div className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 bg-sheet-green rounded flex items-center justify-center text-white"><FileSpreadsheet size={16}/></div>
              Spreadsheet School
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2">
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-50 p-4 overflow-y-auto flex flex-col">
              <div className="flex-1">
                <a 
                  href="#syntax-101" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-4 border-b border-slate-100 text-blue-600 font-bold flex items-center gap-2"
                >
                  <BookOpen size={18}/> Syntax 101
                </a>
                
                {/* NEW: Mobile Formula Doctor */}
                <a 
                  href="#formula-doctor" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-4 border-b border-slate-100 text-purple-600 font-bold flex items-center gap-2"
                >
                  <Wand2 size={18}/> Debug Formulas
                </a>

                {formulas.map(f => (
                 <a 
                   key={f.id} 
                   href={`#${f.id}`} 
                   onClick={() => setMobileMenuOpen(false)}
                   className="block px-4 py-4 border-b border-slate-100 text-slate-800 font-bold"
                 >
                   {f.title}
                 </a>
                ))}
              </div>
              
              <div className="pt-6 pb-12 border-t border-slate-100 mt-4">
                <a href="https://sheridanjamieson.com" target="_blank" className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                  <Github size={16} /> Built by Sheridan Jamieson
                </a>
              </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
          
          {/* Hero */}
<div className="space-y-6 md:pr-12">
  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
    Stop memorising <br/><span className="text-sheet-green">syntax.</span>
  </h1>
  <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
    You know <em>what</em> you want the spreadsheet to do, but you forgot the formula order. We get it.
  </p>
  
  {/* Quick Jump Buttons */}
  <div className="flex flex-wrap gap-3 pt-2">
    <a 
      href="#formula-doctor" 
      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg hover:bg-purple-100 transition-colors text-sm"
    >
      <Wand2 size={16} /> Fix broken formula
    </a>
    
    {/* UPDATED BUTTON BELOW */}
    <a 
      href="#vlookup" 
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:text-sheet-green transition-colors text-sm shadow-sm"
    >
      <FileSpreadsheet size={16} /> Browse Formulas
    </a>
  </div>
</div>

          {/* SYNTAX CHEAT SHEET */}
          <section id="syntax-101" className="bg-blue-50 rounded-xl border border-blue-100 p-6 md:p-8 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                    <Info size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">Syntax Cheat Sheet</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ranges</div>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded border border-blue-100 inline-block text-slate-700">A:C</div>
                    <p className="text-sm text-slate-600 leading-relaxed">Use a <strong>colon (:)</strong> to select everything between two points. <br/><em>"Column A to C"</em></p>
                 </div>
                 <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sheets</div>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded border border-blue-100 inline-block text-slate-700">Sheet1!A1</div>
                    <p className="text-sm text-slate-600 leading-relaxed">Use an <strong>exclamation (!)</strong> to separate the Sheet Name from the cell.</p>
                 </div>
                 <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logic</div>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded border border-blue-100 inline-block text-slate-700">&gt; &lt; &lt;&gt;</div>
                    <p className="text-sm text-slate-600 leading-relaxed"><strong>&gt;</strong> (Greater than), <strong>&lt;</strong> (Less than), and <strong>&lt;&gt;</strong> (Not Equal).</p>
                 </div>
                 <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Text</div>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded border border-blue-100 inline-block text-slate-700">"Done"</div>
                    <p className="text-sm text-slate-600 leading-relaxed">Always wrap text inside <strong>double quotes</strong>.</p>
                 </div>
              </div>
          </section>

          {/* NEW: FORMULA DOCTOR SECTION */}
          <section id="formula-doctor" className="scroll-mt-32 mb-16">
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Wand2 className="text-purple-600" />
                  Formula Debugger
                </h2>
                <p className="text-slate-600 mt-2">
                  Getting a <strong>#NAME?</strong> error? Paste your broken Excel or Google Sheets formula below, and we'll fix the syntax instantly.
                </p>
              </div>
              <FormulaChecker />
            </div>
          </section>

          {/* THE FEED */}
          <div className="space-y-16">
            {formulas.map((formula) => (
              <section key={formula.id} id={formula.id} className="scroll-mt-32">
                <FormulaBuilder 
                  title={formula.title}
                  description={formula.description}
                  explanation={formula.explanation}
                  tip={formula.tip}
                  inputs={formula.inputs}
                  generator={formula.generator}
                />
              </section>
            ))}
          </div>

          {/* Nurture Call to Action */}
          <section className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-sheet-green text-xs font-bold uppercase tracking-widest border border-slate-700">
                Beyond the basics
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Need more than a cheat sheet?</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">
                If your spreadsheet problems can't be fixed with a VLOOKUP, you might need a CFO. We build custom financial models and dashboards for founders.
              </p>
              <a href="https://nurture.kiwi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-sheet-green hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-900/20">
                Work with Nurture <ArrowUpRight size={18} />
              </a>
          </section>
          
          <footer className="pt-16 pb-8 border-t border-slate-200">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-slate-500 text-sm">
                  &copy; {new Date().getFullYear()} Spreadsheet School.
                </div>
                <div className="text-sm font-medium text-slate-600">
                   Part of the <a href="https://nurture.kiwi" target="_blank" className="text-slate-900 hover:text-sheet-green underline decoration-slate-300 underline-offset-4 transition-colors">Nurture</a> Portfolio.
                </div>
             </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
