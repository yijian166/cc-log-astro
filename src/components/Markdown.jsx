// import React from 'react'
import ReactMarkdown from 'react-markdown';
import toc from 'remark-toc';
import slug from 'remark-slug';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { CodeBox } from './CodeBox';
// import prism from 'remark-prism';
// import 'prismjs/themes/prism.css';
// import dark from 'react-syntax-highlighter/dist/cjs/styles/prism/dark';
// import ReactDom from 'react-dom'

export default ({ md }) => {
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[
        slug,
        remarkGfm,
        [toc, { skip: 'Intro' }],
        // [
        //   prism,
        //   {
        //     plugins: [
        //       // 'highlight-keywords',
        //       'autolinker',
        //       'command-line',
        //       'data-uri-highlight',
        //       'diff-highlight',
        //       'keep-markup',
        //       'inline-color',
        //       'line-numbers',
        //       'show-invisibles',
        //       'treeview',
        //     ],
        //   },
        // ],
      ]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          console.log('---', match, className);
          return !inline ? (
            <CodeBox
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
