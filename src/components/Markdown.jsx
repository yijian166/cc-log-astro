// import React from 'react'
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import toc from 'remark-toc';
import slug from 'remark-slug';
import rehypeRaw from 'rehype-raw'
// import dark from 'react-syntax-highlighter/dist/cjs/styles/prism/dark';
// import ReactDom from 'react-dom'

export default ({ md }) => {
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[slug, [toc, { skip: 'Intro' }]]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
         
          const match = /language-(\w+)/.exec(className || '');
          // console.log('---',match)
          return !inline ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, '')}
              // style={dark}
              language={match?.[1]}
              PreTag="div"
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};
