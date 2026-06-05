import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Normalizes LaTeX delimiters so remark-math + rehype-katex render them correctly.
 * Gemini or other LLMs sometimes output:
 * - \[ ... \] for display math
 * - \( ... \) for inline math
 * We normalize these to $$...$$ and $...$ respectively.
 */
const preprocessMathContent = (text: string): string => {
  if (!text) return '';

  // Replace block delimiters \[ ... \]
  let processed = text.replace(/\\\[/g, '$$\n').replace(/\\\]/g, '\n$$');

  // Replace inline delimiters \( ... \)
  // Ensure we add spacing if needed to avoid merging with letters
  processed = processed.replace(/\\\(/g, ' $').replace(/\\\)/g, '$ ');

  // Standardize some escaped math characters that may bypass KaTeX
  // e.g., if there are stray Greek letters or math symbols in plaintext
  // that the AI wrote with LaTeX syntax.
  // Wait, let's only do safe substitutions of common mathematical symbols 
  // if they are outdoors (plain text) to render nicely.
  
  return processed;
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const cleanContent = preprocessMathContent(content);

  return (
    <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-2 select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed break-words text-slate-800 dark:text-gray-200">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-slate-800 dark:text-gray-200">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-slate-800 dark:text-gray-200">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed mb-1 text-slate-800 dark:text-gray-200">{children}</li>,
          h1: ({ children }) => <h1 className="text-sm font-extrabold tracking-tight mt-4 mb-2 text-slate-900 dark:text-gray-100 border-b border-slate-105 dark:border-gray-800 pb-1 uppercase">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold tracking-tight mt-3 mb-1.5 text-indigo-600 dark:text-indigo-400">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-semibold tracking-tight mt-2 mb-1 text-slate-800 dark:text-gray-100">{children}</h3>,
          
          // Render gorgeous adaptive tables with clean borders
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[10px]">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900/10">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3.5 py-2.5 font-bold">{children}</th>,
          td: ({ children }) => <td className="px-3.5 py-2 text-slate-600 dark:text-gray-100 font-medium">{children}</td>,
          
          // Code block highlighting styled with elegant JetBrains Mono & copy options
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className;
            return isInline ? (
              <code className="bg-slate-100 dark:bg-slate-800/80 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded text-xs font-mono font-bold" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-white/5 my-3.5 leading-relaxed shadow-lg">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
