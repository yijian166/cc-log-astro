import GiscusCmp from '@giscus/react';

export default function Giscus() {
  return (
    <GiscusCmp
      id="comments"
      repo="yijian166/cc-log-astro"
      repoId="R_kgDOGxlm0A"
      category="Announcements"
      categoryId="DIC_kwDOGxlm0M4CZI_3"
      mapping="title"
      term="Welcome to Hipo log!"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
      loading="lazy"
    />
  );
}
