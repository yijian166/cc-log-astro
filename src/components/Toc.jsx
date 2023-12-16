import { useEffect, useRef } from 'react';
// import { hashCode } from './hashCode';
// import { BaseStyle } from '@components/frontLayout/FrontLayout';
import style from './toc.module.less';
const BaseStyle = style;
const PostWidth = 700 + 20 * 2; // + padding * 2
const TocWidth = 200;

export const hashCode = (st) => {
  let hash = 0;
  for (let i = 0; i < st.length; i++) {
    let character = st.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const PostToc = (props) => {
  const ulEl = useRef(null);
  useEffect(() => {
    setVisible();
    // window.addEventListener('resize', setVisible);
    return () => {
      // window.removeEventListener('resize', setVisible);
    };
  }, []);
  function setVisible() {
    if (ulEl.current) {
      ulEl.current.style.maxHeight = `${window.innerHeight - 95 - 20}px`;
      ulEl.current.style.visibility =
        window.innerWidth / 2 > PostWidth / 2 + TocWidth + 30
          ? 'visible'
          : 'hidden';
    }
  }
  return (
    <>
      <h2 id="toc">toc</h2>
      <ul className={style.toc + ' toc'} ref={ulEl}>
        {(props.data?.blocks ?? []).map(({ type, data }, index) => {
          if (typeof data !== 'object' || !data || type !== 'header') {
            return null;
          }
          const text = data.text ?? '';
          const id = hashCode(text);
          const level = data.level ?? 3;

          return (
            <li key={index} className={'level-' + level}>
              <a href={`#${id}`} className={` ${BaseStyle.unlink}`}>
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default PostToc;
