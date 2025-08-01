'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function IDEInterface({ aiSuggestion, onCodeChange }) {
  const [code, setCode] = useState('// Welcome to the Codex IDE!\n// Start coding here...\n\n');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [files, setFiles] = useState([
    { name: 'main.js', content: code, language: 'javascript', active: true }
  ]);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' }
  ];

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value) => {
    setCode(value || '');
    onCodeChange?.(value || '');
    
    // Update active file content
    setFiles(prev => prev.map(file => 
      file.active ? { ...file, content: value || '' } : file
    ));
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    // Update active file language
    setFiles(prev => prev.map(file => 
      file.active ? { ...file, language: newLanguage } : file
    ));
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    // Simulate code execution
    setTimeout(() => {
      if (language === 'javascript') {
        try {
          // Simple JavaScript execution simulation
          let result = '';
          const console = {
            log: (...args) => {
              result += args.join(' ') + '\n';
            }
          };
          
          // Create a safe evaluation context
          const func = new Function('console', code);
          func(console);
          
          setOutput(result || 'Code executed successfully (no output)');
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        }
      } else {
        setOutput(`Code execution for ${language} is simulated.\nYour code would run here in a real environment.`);
      }
      setIsRunning(false);
    }, 1000);
  };

  const createNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const newFile = {
        name: fileName,
        content: '// New file\n',
        language: 'javascript',
        active: false
      };
      setFiles(prev => [...prev, newFile]);
    }
  };

  const switchToFile = (index) => {
    setFiles(prev => prev.map((file, i) => ({ ...file, active: i === index })));
    const activeFile = files[index];
    setCode(activeFile.content);
    setLanguage(activeFile.language);
  };

  const insertAISuggestion = () => {
    if (aiSuggestion && editorRef.current) {
      const position = editorRef.current.getPosition();
      editorRef.current.executeEdits('ai-suggestion', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: '\n// AI Suggestion:\n' + aiSuggestion + '\n'
      }]);
    }
  };

  const activeFile = files.find(file => file.active) || files[0];

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Codex IDE</h2>
            <p className="text-sm opacity-90">Code, test, and learn</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 bg-white/20 border border-white/30 rounded text-sm focus:outline-none focus:bg-white/30"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value} className="text-black">
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="px-4 py-1 bg-white/20 border border-white/30 rounded text-sm hover:bg-white/30 disabled:opacity-50 transition-colors"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex bg-gray-100 border-b border-gray-200">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => switchToFile(index)}
            className={`px-4 py-2 text-sm border-r border-gray-200 ${
              file.active 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            {file.name}
          </button>
        ))}
        <button
          onClick={createNewFile}
          className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
        >
          + New
        </button>
      </div>

      {/* AI Suggestion Bar */}
      {aiSuggestion && (
        <div className="p-2 bg-blue-50 border-b border-blue-200 flex justify-between items-center">
          <span className="text-sm text-blue-800">
            💡 AI Suggestion: {aiSuggestion.substring(0, 60)}...
          </span>
          <button
            onClick={insertAISuggestion}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Insert
          </button>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme="vs-light"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              bracketPairColorization: { enabled: true }
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="w-1/3 border-l border-gray-200 flex flex-col">
          <div className="p-2 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Output</h3>
          </div>
          <div className="flex-1 p-3 bg-gray-900 text-green-400 font-mono text-sm overflow-y-auto">
            <pre className="whitespace-pre-wrap">{output || 'Run your code to see output here...'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}