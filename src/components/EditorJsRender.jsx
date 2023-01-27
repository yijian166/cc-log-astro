import { FC, useLayoutEffect, useEffect, useState } from 'react';
import style from './editorJsRender.module.less';
// import { BaseStyle } from '@components/frontLayout/FrontLayout';
import TurndownService from 'turndown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import * as turndownPluginGfm from 'turndown-plugin-gfm';
// import prismjs from 'prismjs';
import { hashCode } from '../services';
import Markdown from './Markdown';
import PostToc from './Toc';
const BaseStyle = style;
// import NextImage from 'next/image';
// import 'prismjs/themes/prism.css';
// import { markdownToHtml } from './mdToHtml';
// import 'prismjs/themes/prism-okaidia.css';
const gfm = turndownPluginGfm.gfm;

const turndownService = new TurndownService();
turndownService.use(gfm);
const toMd = (html) => turndownService.turndown(html);
const BaseUrl = '/img/placeholder.png';

const Paragraph = (props) => {
  // useEffect(() => {
  //   console.log('---');
  // }, [props]);
  // console.log('---', props);
  const text = props.data?.text ?? '';
  if (props.isMd) {
    return <p>{toMd(text)}</p>;
  }
  return <p dangerouslySetInnerHTML={{ __html: text }} />;
};

const qiniuLoader = ({ src, width, quality }) => {
  // console.log('---qiniuLoader', src, width, quality);
  // return `${src}?imageMogr2/auto-orient/thumbnail/${width}x/format/webp/interlace/1/blur/1x0/quality/${
  //   quality || 75
  // }`;
  return `${src}?imageMogr2/auto-orient/thumbnail/${width}x/interlace/1/blur/1x0/quality/${
    quality || 75
  }`;
};

const Image = (props) => {
  //TODO: more detail https://dn-ojlty2hua.qbox.me/image-1586593621155-55ar5oOF56y8572p5LiL55qE6Zi05aSpLmpwZw==.jpg?imageView2/0/w/200/h/200/q/75
  let url = props.data?.file?.url ?? BaseUrl;
  const width = props.data?.file?.width ?? 0;
  const height = props.data?.file?.height ?? 0;
  const sourceType = props.data?.file?.sourceType ?? '';
  const caption = props.data?.caption ?? '';
  const isFirst = props.data?.file?.isFirst ?? false;
  // console.log('-img-', url, width, height, isFirst);
  if (!url.startsWith('/u') && !url.startsWith('/img')) {
    // not local
    const fullUrl = `${url.startsWith('http') ? '' : 'https:'}${url}`;
    // const
    const _url =
      fullUrl + '?imageMogr2/auto-orient/thumbnail/660x/blur/1x0/quality/75';
    if (props.isMd) {
      return (
        <p>
          ![{caption}]({_url})
        </p>
      );
    }

    // if (width && height) {
    //   return (
    //     <NextImage
    //       loader={sourceType === 'qiniu' ? qiniuLoader : undefined}
    //       src={fullUrl}
    //       alt={caption}
    //       {...(props.data?.file?.imageProps ?? {})}
    //       width={width}
    //       height={height}
    //       // layout="responsive"
    //       placeholder={
    //         props.data?.file?.imageProps?.blurDataURL ? 'blur' : 'empty'
    //       }
    //       sizes="
    //         (max-width: 700px) 100vw,
    //         1200px
    //       "
    //       priority={!!isFirst}
    //     />
    //   );
    // }

    return (
      <picture>
        <source
          srcSet={`${url}?imageMogr2/auto-orient/thumbnail/660x/format/webp/blur/1x0/quality/75`}
          type={'image/webp'}
        />
        <img src={_url} alt={caption} />
      </picture>
    );
  }
  if (props.isMd) {
    return (
      <p>
        ![{caption}](https://hicc.pro{url})
      </p>
    );
  }
  return (
    <p>
      <img src={url} />
    </p>
  );
};

const HeaderLink = (props) => {
  const [canCopy, setCanCopy] = useState(false);
  useEffect(() => {
    if (window?.navigatory?.clipboard?.writeText) {
      setCanCopy(true);
    }
  }, []);
  function copyLink() {
    navigator?.clipboard?.writeText?.(
      window.location.origin + window.location.pathname + `#${props.id}`
    );
  }

  return (
    <span
      className={style.headerLink}
      title={canCopy ? 'copy header link' : ''}
      onClick={() => copyLink()}
    >
      #
    </span>
  );
};

const Header = (props) => {
  // console.log(props.data);
  const text = props.data?.text ?? '';
  const id = hashCode(text) + '';
  const level = props.data?.level ?? 3;
  if (props.isMd) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: `<h${level}>${new Array(level)
            .fill('#')
            .join('')} ${text}</h${level}>`,
        }}
      />
    );
  }
  switch (level) {
    case 1:
      return (
        <h1 id={id} className={style.header}>
          {text}
          <HeaderLink id={id} />
        </h1>
      );
    case 2:
      return (
        <h2 id={id} className={style.header}>
          {text}
          <HeaderLink id={id} />
        </h2>
      );
    case 3:
      return (
        <h3 id={id} className={style.header}>
          {text}
          <HeaderLink id={id} />
        </h3>
      );
    case 4:
      return (
        <h4 id={id} className={style.header}>
          {text}
          <HeaderLink id={id} />
        </h4>
      );
    case 5:
      return (
        <h5 id={id} className={style.header}>
          {text}
          <HeaderLink id={id} />
        </h5>
      );
    default:
      return (
        <h3 id={id} className={style.header}>
          {text}
          <HeaderLink id={id} />
        </h3>
      );
  }
};

const List = (props) => {
  const list = props.data?.items ?? [];
  const isOrdered = props.data.style === 'ordered';
  if (props.isMd) {
    return (
      <>
        <br />
        <div style={{ paddingLeft: 0, listStyle: 'none' }}>
          {list.map((item, index) => {
            return (
              <div key={`${index}`} style={{ marginBottom: 8, lineHeight: 1 }}>
                {isOrdered ? `${index + 1}. ` : '- '}
                {toMd(item)}
              </div>
            );
          })}
        </div>
        <br />
      </>
    );
  }
  const content = (
    <>
      {list.map((item, index) => {
        return (
          <li key={`${index}`} dangerouslySetInnerHTML={{ __html: item }} />
        );
      })}
    </>
  );
  if (isOrdered) {
    return <ol>{content}</ol>;
  }
  return <ul>{content}</ul>;
};

const Code = (props) => {
  //  https://prismjs.com/
  // console.log('---code', props.data);
  let lan = props.data.language ?? 'javascript';
  lan = lan === 'TypeScript Jsx' ? 'tsx' : lan;
  lan = lan === 'Javascript Jsx' ? 'jsx' : lan;
  if (props.isMd) {
    return (
      <>
        <br />
        ```{lan.toLowerCase()}
        <pre>
          <code>{props.data.text}</code>
        </pre>
        ```
        <br />
      </>
    );
  }
  return (
    <SyntaxHighlighter
      children={props.data.text ?? ''}
      // children={String(children).replace(/\n$/, '')}
      // style={dark}
      language={lan.toLowerCase()}
      PreTag="div"
      // {...props}
    />
  );
  // const _className = `  language-${lan.toLowerCase()}`;
  // const language = lan.toLowerCase();
  // console.log('---', language, props.data.text);
  // const html = prismjs.highlight(
  //   props.data.text,
  //   Prism.languages[language],
  //   language
  // );
  // return (
  //   <div dangerouslySetInnerHTML={{ __html: html }} className={_className} />
  // );
  // return (
  //   <pre>
  //     <code className={_className} dangerouslySetInnerHTML={{ __html: html }} />
  //   </pre>
  // );
  // return <div dangerouslySetInnerHTML={{ __html: props.data.html }} />;
  // return (
  //   <pre>
  //     <code className={_className}>{props.data.text}</code>
  //   </pre>
  // );
};

const LinkTool = (props) => {
  const title = typeof props.data?.meta?.title === 'object' ? undefined:props.data?.meta?.title
  if (props.isMd) {
    return (
      <p>
        [{title ?? props.data.link ?? 'untitle'}](
        {props.data.link})
      </p>
    );
  }
  return (
    <a
      className={`${style['link-tool']} ${BaseStyle.card} ${BaseStyle.unlink}`}
      href={props.data.link}
    >
      <img src={props.data?.meta?.image?.url ?? BaseUrl} alt="" />
      <div className={style['link-tool-info']}>
        <h6 className={style['link-tool-info-title']}>
          {title ?? props.data.link ?? 'untitle'}
        </h6>
        <p className={style['link-tool-info-desp']}>
          {props.data?.meta?.description ?? ''}
        </p>
      </div>
    </a>
  );
};
const Delimiter = (props) => {
  if (props.isMd) {
    return <p>---</p>;
  }
  return <div className={BaseStyle.hr} />;
};
const Embed = (props) => {
  // console.log('---', props.data);
  if (!props.data?.embed) {
    return null;
  }
  if (props.isMd) {
    return (
      <>
        <pre className={style.break}>
          <code>{`<div><iframe src="${props.data?.embed}"></iframe></div>`}</code>
        </pre>
        {toMd(props.data?.caption ?? '')}
        <br />
        <br />
      </>
    );
  }
  return (
    <div className={style.embed}>
      <iframe src={props.data?.embed}></iframe>
      <p
        style={{ textAlign: 'center' }}
        dangerouslySetInnerHTML={{ __html: props.data?.caption ?? '' }}
      ></p>
    </div>
  );
};
const Warning = (props) => {
  if (props.isMd) {
    return (
      <div style={{ margin: '16px 0' }}>
        **👉{toMd(props.data?.title ?? '')}**
        <br />
        <br />
        {toMd(props.data?.message ?? '')}
      </div>
    );
  }
  return (
    <div style={{ margin: 10 }}>
      <strong>
        👉
        <span dangerouslySetInnerHTML={{ __html: props.data?.title ?? '' }} />
      </strong>
      <p dangerouslySetInnerHTML={{ __html: props.data?.message ?? '' }} />
    </div>
  );
};
const Md = (props) => {
  const text = props.data.text ?? '';
  if (props.isMd) {
    return <pre>{text}</pre>;
  }
  return <Markdown md={text} />;
  // const html = mdToHTML(text, { headerIds: true });
  // // console.log('md', text, html);
  // return <div dangerouslySetInnerHTML={{ __html: html ?? '' }}></div>;
};
const Quote = (props) => {
  const html = `<blockquote>
<p >${props.data?.text ?? ''}</p>
  <footer>${props.data?.caption ?? ''}</footer>
</blockquote>`;
  if (props.isMd) {
    return (
      <p
        dangerouslySetInnerHTML={{
          __html: toMd(html).replace(/\>/g, '<br>>&nbsp;'),
        }}
      />
    );
  }
  return (
    <blockquote>
      <p dangerouslySetInnerHTML={{ __html: props.data?.text ?? '' }} />
      <footer dangerouslySetInnerHTML={{ __html: props.data?.caption ?? '' }} />
    </blockquote>
  );
};

const Table = (props) => {
  if (!Array.isArray(props.data.content) || props.data.content.length === 0) {
    return null;
  }
  const [tHead, ...tBody] = props.data.content;
  const [_, ...eTBody] = props.data.enhancedContent ?? [];
  if (props.isMd) {
    return (
      <div style={{ margin: '16px 0' }}>
        <div>
          {tHead.map((item, i) => {
            return (
              <span key={`${i}`}>
                {i ? '' : '|'}
                {toMd(item ?? '')}|
              </span>
            );
          })}
        </div>
        <div>
          {tHead.map((item, i) => {
            return <span key={`${i}`}>{i ? '' : '|'}---|</span>;
          })}
        </div>
        {tBody.map((item, index) => {
          return (
            <div key={index.toString()}>
              {(Array.isArray(item) ? item : []).map((trItem, i) => {
                if (!trItem.content) {
                  return null;
                }
                return (
                  <span key={`${i}`}>
                    {i ? '' : '|'}
                    {toMd(trItem ?? '')}|
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          {tHead.map((item, i) => {
            return (
              <th
                key={`${i}`}
                dangerouslySetInnerHTML={{ __html: item ?? '' }}
              />
            );
          })}
        </tr>
      </thead>
      <tbody>
        {eTBody.map((item, index) => {
          return (
            <tr key={`${index}`}>
              {(Array.isArray(item) ? item : []).map((trItem, i) => {
                if (!trItem.content) {
                  return null;
                }
                return (
                  <td
                    key={`${i}`}
                    rowSpan={trItem?.rowSpan ?? 1}
                    colSpan={trItem?.colSpan ?? 1}
                    dangerouslySetInnerHTML={{ __html: trItem?.content ?? '' }}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const Checklist = (props) => {
  if (props.isMd) {
    return (
      <div style={{ margin: '16px 0' }}>
        {(props.data.items ?? []).map((item, i) => {
          return (
            <div key={`${i}`}>
              {`- [${item.checked ? 'x' : ' '}] `}
              {toMd(item.text ?? '')}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <ul style={{ listStyle: 'none' }}>
      {(props.data.items ?? []).map((item, i) => {
        return (
          <li key={`${i}`}>
            <input type="checkbox" checked={!!item.checked} readOnly />
            <span dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
          </li>
        );
      })}
    </ul>
  );
};

const EditorJsRender = (props) => {
  // const keys = Object.keys(props.data.blocks)
  return (
    <>
    <PostToc data={props.data} />
    <div
      className={`${style.box} ${BaseStyle['artical']} ${
        props.isMd ? style.isMd : ''
      }`}
    >
      {(props.data?.blocks ?? []).map(({ type, data }, index) => {
        if (typeof data !== 'object' || !data) {
          return <div key={`${index}`}>-</div>;
        }
        switch (type) {
          case 'paragraph':
            return <Paragraph key={`${index}`} data={data} isMd={props.isMd} />;
          case 'image':
            if (data.file.isFirst) {
              return null;
            }
            return <Image key={`${index}`} data={data} isMd={props.isMd} />;
          case 'header':
            return <Header key={`${index}`} data={data} isMd={props.isMd} />;
          case 'list':
            return <List key={`${index}`} data={data} isMd={props.isMd} />;
          case 'code':
            return <Code key={`${index}`} data={data} isMd={props.isMd} />;
          case 'linkTool':
            return <LinkTool key={`${index}`} data={data} isMd={props.isMd} />;
          case 'delimiter':
            return <Delimiter key={`${index}`} data={data} isMd={props.isMd} />;
          case 'quote':
            return <Quote key={`${index}`} data={data} isMd={props.isMd} />;
          case 'table':
            return <Table key={`${index}`} data={data} isMd={props.isMd} />;
          case 'checklist':
            return <Checklist key={`${index}`} data={data} isMd={props.isMd} />;
          case 'embed':
            return <Embed key={`${index}`} data={data} isMd={props.isMd} />;
          case 'warning':
            return <Warning key={`${index}`} data={data} isMd={props.isMd} />;
          case 'md':
            return <Md key={`${index}`} data={data} isMd={props.isMd} />;
        }
        return <div key={`${index}`}>TODO {type}</div>;
      })}
    </div>
    </>
  );
};

export default EditorJsRender;
