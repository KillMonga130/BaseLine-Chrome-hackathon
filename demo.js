// Interactive Baseline Tooling Demo
(async function() {
  let editor;
  let exceptions = {};
  let webstatus = {};
  
  // Load data sources
  async function loadJSON(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn(`Could not load ${url}:`, e);
      return null;
    }
  }

  // Initialize CodeMirror editor
  function initEditor() {
    const textarea = document.getElementById('cssEditor');
    editor = CodeMirror.fromTextArea(textarea, {
      mode: 'css',
      theme: 'github',
      lineNumbers: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
      lineWrapping: true
    });

    editor.on('change', debounce(analyzeCss, 500));
    
    // Set initial content
    const defaultCss = `.modern-layout {
  /* This will trigger a Baseline warning */
  word-break: auto-phrase;
  
  /* These are Baseline features */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  /* Try adding more CSS properties... */
}`;
    editor.setValue(defaultCss);
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Analyze CSS and show results
  function analyzeCss() {
    const css = editor.getValue();
    const results = checkBaseline(css);
    displayResults(results);
    updateStatus(results);
  }

  // Main Baseline checking logic
  function checkBaseline(css) {
    const declRe = /([a-zA-Z-]+)\s*:\s*([^;\n}]+)\s*;/g;
    let match;
    const results = {
      warnings: [],
      info: [],
      processed: 0
    };

    while ((match = declRe.exec(css)) !== null) {
      const prop = match[1].trim();
      const value = match[2].trim();
      const line = css.substring(0, match.index).split('\n').length;
      
      results.processed++;
      
      const analysis = analyzeProperty(prop, value);
      if (analysis.isBaseline === false) {
        results.warnings.push({
          line,
          property: prop,
          value,
          reason: analysis.reason,
          source: analysis.source
        });
      } else if (analysis.isBaseline === true) {
        results.info.push({
          line,
          property: prop,
          value,
          reason: 'Baseline supported',
          source: analysis.source
        });
      }
    }

    return results;
  }

  // Analyze individual property-value pair
  function analyzeProperty(prop, value) {
    const key = `css.properties.${prop}.${value}`;
    
    // Check exceptions first
    if (exceptions && exceptions[key]) {
      return {
        isBaseline: false,
        reason: exceptions[key].reason,
        source: 'Curated Exceptions'
      };
    }

    // Check webstatus cache
    if (webstatus) {
      for (const queryKey of Object.keys(webstatus)) {
        const data = webstatus[queryKey];
        if (!data || !data.data) continue;
        
        for (const feat of data.data) {
          if (feat.feature_id && feat.feature_id.includes(prop)) {
            if (feat.baseline) {
              const status = feat.baseline.status;
              if (status === 'limited' || status === false) {
                return {
                  isBaseline: false,
                  reason: `Limited browser support (${feat.feature_id})`,
                  source: 'Web Platform Dashboard'
                };
              } else if (status === 'widely' || status === true) {
                return {
                  isBaseline: true,
                  reason: `Widely supported (${feat.feature_id})`,
                  source: 'Web Platform Dashboard'
                };
              }
            }
          }
        }
      }
    }

    // Heuristic: common baseline properties
    const commonBaseline = [
      'display', 'margin', 'padding', 'color', 'background', 'font-size',
      'width', 'height', 'position', 'top', 'left', 'right', 'bottom',
      'border', 'text-align', 'flex', 'grid', 'gap'
    ];

    if (commonBaseline.some(p => prop.startsWith(p))) {
      return {
        isBaseline: true,
        reason: 'Common CSS property (heuristic)',
        source: 'Heuristic Analysis'
      };
    }

    return {
      isBaseline: null,
      reason: 'Unknown - requires manual verification',
      source: 'Unknown'
    };
  }

  // Display results in the UI
  function displayResults(results) {
    const resultsEl = document.getElementById('lintResults');
    
    if (results.processed === 0) {
      resultsEl.innerHTML = '<div class="placeholder">Start typing CSS to see real-time Baseline analysis...</div>';
      return;
    }

    let output = `<div class="success">✓ Analyzed ${results.processed} CSS declarations</div>\n\n`;

    if (results.warnings.length > 0) {
      output += '<div class="error">⚠️  BASELINE WARNINGS:</div>\n';
      results.warnings.forEach(w => {
        output += `<div class="warning">Line ${w.line}: ${w.property}: ${w.value}\n  → ${w.reason}\n  → Source: ${w.source}</div>\n`;
      });
      output += '\n';
    }

    if (results.info.length > 0) {
      output += '<div class="success">✓ BASELINE COMPATIBLE:</div>\n';
      results.info.forEach(i => {
        output += `<div class="success">Line ${i.line}: ${i.property}: ${i.value} ✓</div>\n`;
      });
    }

    if (results.warnings.length === 0 && results.info.length === 0) {
      output += '<div class="placeholder">No CSS declarations found to analyze.</div>';
    }

    resultsEl.innerHTML = output;
  }

  // Update status indicator
  function updateStatus(results) {
    const statusEl = document.getElementById('status');
    if (results.warnings.length > 0) {
      statusEl.textContent = `${results.warnings.length} Warning${results.warnings.length > 1 ? 's' : ''}`;
      statusEl.className = 'status warning';
      statusEl.style.background = '#f6ad55';
    } else if (results.processed > 0) {
      statusEl.textContent = 'All Good';
      statusEl.className = 'status success';
      statusEl.style.background = '#48bb78';
    } else {
      statusEl.textContent = 'Ready';
      statusEl.className = 'status';
      statusEl.style.background = '#667eea';
    }
  }

  // Tab switching
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
      });
    });
  }

  // Example CSS snippets
  function initExamples() {
    document.getElementById('loadExample1').addEventListener('click', () => {
      editor.setValue(`.problematic-styles {
  /* These will trigger Baseline warnings */
  word-break: auto-phrase;
  container-type: inline-size;
  color-scheme: light dark;
  
  /* This should be fine */
  display: flex;
  gap: 1rem;
}`);
    });

    document.getElementById('loadExample2').addEventListener('click', () => {
      editor.setValue(`.mixed-example {
  /* Modern layout - should be Baseline */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  /* Newer features - may warn */
  container-type: inline-size;
  
  /* Safe properties */
  padding: 1rem;
  border-radius: 8px;
  background: white;
}`);
    });

    document.getElementById('clearEditor').addEventListener('click', () => {
      editor.setValue('/* Start typing your CSS here... */\n\n');
    });
  }

  // Initialize everything
  async function init() {
    // Load data sources
    exceptions = await loadJSON('./data/exceptions.json') || {};
    webstatus = await loadJSON('./data/webstatus-cache.json') || {};
    
    console.log('Loaded exceptions:', Object.keys(exceptions).length);
    console.log('Loaded webstatus cache:', Object.keys(webstatus).length);
    
    // Initialize UI components
    initEditor();
    initTabs();
    initExamples();
    
    // Run initial analysis
    setTimeout(analyzeCss, 100);
  }

  // Start the demo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
