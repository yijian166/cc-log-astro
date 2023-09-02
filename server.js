'use strict';

var adapter = require('@astrojs/node/server.js');
var React = require('react');
var ReactDOM = require('react-dom/server');
var htmlEscaper = require('html-escaper');
var qs = require('qs');
var fetch$1 = require('node-fetch');
var nodeUrl = require('url');
var remark = require('remark');
var html = require('remark-html');
var prism = require('remark-prism');
var toc = require('remark-toc');
var slug = require('remark-slug');
require('plaiceholder');
var rss = require('@astrojs/rss');
var ReactMarkdown = require('react-markdown');
var reactSyntaxHighlighter = require('react-syntax-highlighter');
var jsxRuntime = require('react/jsx-runtime');
var TurndownService = require('turndown');
var turndownPluginGfm = require('turndown-plugin-gfm');
require('mime');
require('kleur/colors');
require('string-width');
require('path-browserify');
var pathToRegexp = require('path-to-regexp');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(
          n,
          k,
          d.get
            ? d
            : {
                enumerable: true,
                get: function () {
                  return e[k];
                },
              },
        );
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var adapter__namespace = /*#__PURE__*/ _interopNamespace(adapter);
var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
var ReactDOM__default = /*#__PURE__*/ _interopDefaultLegacy(ReactDOM);
var qs__default = /*#__PURE__*/ _interopDefaultLegacy(qs);
var fetch$1__default = /*#__PURE__*/ _interopDefaultLegacy(fetch$1);
var nodeUrl__default = /*#__PURE__*/ _interopDefaultLegacy(nodeUrl);
var html__default = /*#__PURE__*/ _interopDefaultLegacy(html);
var prism__default = /*#__PURE__*/ _interopDefaultLegacy(prism);
var toc__default = /*#__PURE__*/ _interopDefaultLegacy(toc);
var slug__default = /*#__PURE__*/ _interopDefaultLegacy(slug);
var rss__default = /*#__PURE__*/ _interopDefaultLegacy(rss);
var ReactMarkdown__default = /*#__PURE__*/ _interopDefaultLegacy(ReactMarkdown);
var TurndownService__default =
  /*#__PURE__*/ _interopDefaultLegacy(TurndownService);
var turndownPluginGfm__namespace =
  /*#__PURE__*/ _interopNamespace(turndownPluginGfm);

const box = '_box_qh6yc_1';
const header = '_header_qh6yc_17';
const headerLink = '_headerLink_qh6yc_17';
const embed = '_embed_qh6yc_26';
const card = '_card_qh6yc_60';
const unlink = '_unlink_qh6yc_67';
const hr = '_hr_qh6yc_81';
const style = {
  box: box,
  header: header,
  headerLink: headerLink,
  embed: embed,
  'link-tool': '_link-tool_qh6yc_31',
  'link-tool-info-title': '_link-tool-info-title_qh6yc_40',
  'link-tool-info': '_link-tool-info_qh6yc_40',
  break: '_break_qh6yc_47',
  card: card,
  unlink: unlink,
  'mute-link': '_mute-link_qh6yc_74',
  hr: hr,
};

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
  if (!value) return null;
  return React.createElement('astro-slot', {
    name,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: value },
  });
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) =>
  str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
  return (
    err.message &&
    (err.message.startsWith("Cannot read property '__H'") ||
      err.message.includes("(reading '__H')"))
  );
}

async function check$1(Component, props, children) {
  // Note: there are packages that do some unholy things to create "components".
  // Checking the $$typeof property catches most of these patterns.
  if (typeof Component === 'object') {
    const $$typeof = Component['$$typeof'];
    return (
      $$typeof &&
      $$typeof.toString().slice('Symbol('.length).startsWith('react')
    );
  }
  if (typeof Component !== 'function') return false;

  if (
    Component.prototype != null &&
    typeof Component.prototype.render === 'function'
  ) {
    return (
      React__default['default'].Component.isPrototypeOf(Component) ||
      React__default['default'].PureComponent.isPrototypeOf(Component)
    );
  }

  let error = null;
  let isReactComponent = false;
  function Tester(...args) {
    try {
      const vnode = Component(...args);
      if (vnode && vnode['$$typeof'] === reactTypeof) {
        isReactComponent = true;
      }
    } catch (err) {
      if (!errorIsComingFromPreactComponent(err)) {
        error = err;
      }
    }

    return React__default['default'].createElement('div');
  }

  await renderToStaticMarkup$1(Tester, props, children, {});

  if (error) {
    throw error;
  }
  return isReactComponent;
}

async function getNodeWritable() {
  let nodeStreamBuiltinModuleName = 'stream';
  let { Writable } = await (function (t) {
    return Promise.resolve().then(function () {
      return /*#__PURE__*/ _interopNamespace(require(t));
    });
  })(/* @vite-ignore */ nodeStreamBuiltinModuleName);
  return Writable;
}

async function renderToStaticMarkup$1(
  Component,
  props,
  { default: children, ...slotted },
  metadata,
) {
  delete props['class'];
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName$1(key);
    slots[name] = React__default['default'].createElement(StaticHtml, {
      value,
      name,
    });
  }
  // Note: create newProps to avoid mutating `props` before they are serialized
  const newProps = {
    ...props,
    ...slots,
    children:
      children != null
        ? React__default['default'].createElement(StaticHtml, {
            value: children,
          })
        : undefined,
  };
  const vnode = React__default['default'].createElement(Component, newProps);
  let html;
  if (metadata && metadata.hydrate) {
    html = ReactDOM__default['default'].renderToString(vnode);
    if ('renderToReadableStream' in ReactDOM__default['default']) {
      html = await renderToReadableStreamAsync(vnode);
    } else {
      html = await renderToPipeableStreamAsync(vnode);
    }
  } else {
    if ('renderToReadableStream' in ReactDOM__default['default']) {
      html = await renderToReadableStreamAsync(vnode);
    } else {
      html = await renderToStaticNodeStreamAsync(vnode);
    }
  }
  return { html };
}

async function renderToPipeableStreamAsync(vnode) {
  const Writable = await getNodeWritable();
  let html = '';
  return new Promise((resolve, reject) => {
    let error = undefined;
    let stream = ReactDOM__default['default'].renderToPipeableStream(vnode, {
      onError(err) {
        error = err;
        reject(error);
      },
      onAllReady() {
        stream.pipe(
          new Writable({
            write(chunk, _encoding, callback) {
              html += chunk.toString('utf-8');
              callback();
            },
            destroy() {
              resolve(html);
            },
          }),
        );
      },
    });
  });
}

async function renderToStaticNodeStreamAsync(vnode) {
  const Writable = await getNodeWritable();
  let html = '';
  return new Promise((resolve) => {
    let stream = ReactDOM__default['default'].renderToStaticNodeStream(vnode);
    stream.pipe(
      new Writable({
        write(chunk, _encoding, callback) {
          html += chunk.toString('utf-8');
          callback();
        },
        destroy() {
          resolve(html);
        },
      }),
    );
  });
}

async function renderToReadableStreamAsync(vnode) {
  const decoder = new TextDecoder();
  const stream =
    await ReactDOM__default['default'].renderToReadableStream(vnode);
  let html = '';
  for await (const chunk of stream) {
    html += decoder.decode(chunk);
  }
  return html;
}

const _renderer1 = {
  check: check$1,
  renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = '1.1.1';
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error(
      'Deprecated: Astro.fetchContent() has been replaced with Astro.glob().',
    );
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(
        `Astro.glob(${JSON.stringify(globValue())}) - no matches found.`,
      );
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce(
        (u, segment) => new URL(segment, u),
        referenceURL,
      ).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = '/' + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    },
  };
}

const escapeHTML = htmlEscaper.escape;
class HTMLString extends String {}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === 'string') {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, 'http://example.com');
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith('.')) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith('/@fs') && resolved.endsWith('.jsx')) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === 'string';
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === 'tagName' && Component === value) {
            return {
              componentExport: key,
              componentUrl: id,
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id,
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    }),
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case '[object Date]': {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case '[object RegExp]': {
      return [PROP_TYPE.RegExp, value.source];
    }
    case '[object Map]': {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case '[object Set]': {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case '[object BigInt]': {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case '[object URL]': {
      return [PROP_TYPE.URL, value.toString()];
    }
    case '[object Array]': {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === 'object') {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(' ');
  function push(item) {
    if (item && typeof item.forEach === 'function') item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name]) push(name);
      });
    else {
      item = item === false || item == null ? '' : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ['load', 'idle', 'media', 'visible', 'only'];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(
  HydrationDirectivesRaw.map((n) => `client:${n}`),
);
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {},
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith('server:')) {
      if (key === 'server:root') {
        extracted.isPage = true;
      }
    }
    if (key.startsWith('client:')) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: '',
          value: '',
          componentUrl: '',
          componentExport: { value: '' },
        };
      }
      switch (key) {
        case 'client:component-path': {
          extracted.hydration.componentUrl = value;
          break;
        }
        case 'client:component-export': {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case 'client:component-hydration': {
          break;
        }
        case 'client:display-name': {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(':')[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps,
              ).join(', ')}`,
            );
          }
          if (
            extracted.hydration.directive === 'media' &&
            typeof extracted.hydration.value !== 'string'
          ) {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"',
            );
          }
          break;
        }
      }
    } else if (key === 'class:list') {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`,
    );
  }
  const island = {
    children: '',
    props: {
      uid: astroId,
    },
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props['component-url'] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props['component-export'] = componentExport.value;
    island.props['renderer-url'] = await result.resolve(
      renderer.clientEntrypoint,
    );
    island.props['props'] = escapeHTML(serializeProps(props));
  }
  island.props['ssr'] = '';
  island.props['client'] = hydrate;
  island.props['before-hydration-url'] = await result.resolve(
    'astro:scripts/before-hydration.js',
  );
  island.props['opts'] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || '',
    }),
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t)},o=(t,i)=>{if(t===""||!Array.isArray(i))return i;const[e,n]=i;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const i=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const s of n){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("data-astro-template")||"default"]=s.innerHTML,s.remove())}for(const s of i){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("name")||"default"]=s.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((i,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url")),this.start()}start(){const i=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:s}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),r=this.getAttribute("component-export")||"default";if(!r.includes("."))this.Component=a[r];else{this.Component=a;for(const d of r.split("."))this.Component=this.Component[d]}return this.hydrator=s,this.hydrate},i,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return (result._metadata.hasHydrationScript = true);
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default,
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case 'both':
      return `<style>astro-island,astro-slot{display:contents}</style><script>${
        getDirectiveScriptText(directive) + astro_island_prebuilt_default
      }<\/script>`;
    case 'directive':
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return '';
}

const Fragment = Symbol.for('astro:fragment');
const Renderer = Symbol.for('astro:renderer');
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case 'directive': {
      const { hydration } = chunk;
      let needsHydrationScript =
        hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript =
        hydration &&
        determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript
        ? 'both'
        : needsDirectiveScript
        ? 'directive'
        : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return '';
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (
    ((_a = Object.assign(
      { BASE_URL: '/', MODE: 'production', DEV: false, PROD: true },
      { _: process.env._ },
    )) == null
      ? void 0
      : _a.DEV) &&
    props != null
  ) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`,
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return 'AstroComponent';
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return (
    typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object AstroComponent]'
  );
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case 'directive': {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = '';
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(
  result,
  componentFactory,
  displayName,
  props,
  children,
) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`,
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === 'function') {
    yield* renderChild(child());
  } else if (typeof child === 'string') {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0);
  else if (
    child instanceof AstroComponent ||
    Object.prototype.toString.call(child) === '[object AstroComponent]'
  ) {
    yield* renderAstroComponent(child);
  } else if (typeof child === 'object' && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = '';
    for await (const chunk of iterator) {
      if (chunk.type === 'directive') {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY';
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = '';
  let integer = bitwise(text);
  const sign = integer < 0 ? 'Z' : '';
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames =
  /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes =
  /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes =
  /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(['set:html', 'set:text']);
const toIdent = (k) =>
  k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
    if (/[^\w]|\s/.test(match)) return '';
    return index === 0 ? match : match.toUpperCase();
  });
const toAttributeString = (value, shouldEscape = true) =>
  shouldEscape
    ? String(value).replace(/&/g, '&#38;').replace(/"/g, '&#34;')
    : value;
const kebab = (k) =>
  k.toLowerCase() === k
    ? k
    : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) =>
  Object.entries(obj)
    .map(([k, v]) => `${kebab(k)}:${v}`)
    .join(';');
function defineScriptVars(vars) {
  let output = '';
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return '';
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return '';
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return '';
  }
  if (key === 'class:list') {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === '') {
      return '';
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (
    key === 'style' &&
    !(value instanceof HTMLString) &&
    typeof value === 'object'
  ) {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === 'className') {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (
    value === true &&
    (key.startsWith('data-') || htmlBooleanAttributes.test(key))
  ) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(
      ` ${key}="${toAttributeString(value, shouldEscape)}"`,
    );
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = '';
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(
  name,
  { props: _props, children = '' },
  shouldEscape = true,
) {
  const {
    lang: _,
    'data-astro-id': astroId,
    'define:vars': defineVars,
    ...props
  } = _props;
  if (defineVars) {
    if (name === 'style') {
      delete props['is:global'];
      delete props['is:scoped'];
    }
    if (name === 'script') {
      delete props.hoist;
      children = defineScriptVars(defineVars) + '\n' + children;
    }
  }
  if ((children == null || children == '') && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(
    props,
    shouldEscape,
  )}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return (
    typeof HTMLElement !== 'undefined' && HTMLElement.isPrototypeOf(Component)
  );
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = '';
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(
      result,
      slots == null ? void 0 : slots.default,
    )}</${name}>`,
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName) return definedName;
  const assignedName = constructor.name
    .replace(/^HTML|Element$/g, '')
    .replace(/[A-Z]/g, '-$&')
    .toLowerCase()
    .replace(/^-/, 'html-');
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([['solid', 'solid-js']]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split('.').pop();
  switch (extname) {
    case 'svelte':
      return ['@astrojs/svelte'];
    case 'vue':
      return ['@astrojs/vue'];
    case 'jsx':
    case 'tsx':
      return ['@astrojs/react', '@astrojs/preact'];
    default:
      return [
        '@astrojs/react',
        '@astrojs/preact',
        '@astrojs/vue',
        '@astrojs/svelte',
      ];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return 'fragment';
  }
  if (Component && typeof Component === 'object' && Component['astro:html']) {
    return 'html';
  }
  if (isAstroComponentFactory(Component)) {
    return 'astro-factory';
  }
  return 'unknown';
}
async function renderComponent(
  result,
  displayName,
  Component,
  _props,
  slots = {},
) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case 'fragment': {
      const children2 = await renderSlot(
        result,
        slots == null ? void 0 : slots.default,
      );
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case 'html': {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(([key, value]) =>
            renderSlot(result, value).then((output) => {
              children2[key] = output;
            }),
          ),
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case 'astro-factory': {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(
          result,
          Component,
          displayName,
          _props,
          slots,
        );
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props['client:only']) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`,
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = '';
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (
    Array.isArray(renderers) &&
    renderers.length === 0 &&
    typeof Component !== 'string' &&
    !componentIsHTMLElement(Component)
  ) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(
      probableRendererNames.map((r) => '`' + r + '`'),
    )}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(([key, value]) =>
        renderSlot(result, value).then((output) => {
          children[key] = output;
        }),
      ),
    );
  }
  let renderer;
  if (metadata.hydrate !== 'only') {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (
      !renderer &&
      typeof HTMLElement === 'function' &&
      componentIsHTMLElement(Component)
    ) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName)
        ? rendererAliases.get(passedName)
        : passedName;
      renderer = renderers.find(
        ({ name }) =>
          name === `@astrojs/${rendererName}` || name === rendererName,
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname =
        (_a = metadata.componentUrl) == null ? void 0 : _a.split('.').pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname,
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === 'only') {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${
        metadata.displayName
      } client:only="${probableRendererNames
        .map((r) => r.replace('@astrojs/', ''))
        .join('|')}" />
`);
    } else if (typeof Component !== 'string') {
      const matchingRenderers = renderers.filter((r) =>
        probableRendererNames.includes(r.name),
      );
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? 'are' : 'is'} ${renderers.length} renderer${
          plural ? 's' : ''
        } configured in your \`astro.config.mjs\` file,
but ${plural ? 'none were' : 'it was not'} able to server-side render ${
          metadata.displayName
        }.

Did you mean to enable ${formatList(
          probableRendererNames.map((r) => '`' + r + '`'),
        )}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata,
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === 'only') {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata,
      ));
    }
  }
  if (
    renderer &&
    !renderer.clientEntrypoint &&
    renderer.name !== '@astrojs/lit' &&
    metadata.hydrate
  ) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`,
    );
  }
  if (!html && typeof Component === 'string') {
    const childSlots = Object.values(children).join('');
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(
        props,
      )}${markHTMLString(
        childSlots === '' && voidElementNames.test(Component)
          ? `/>`
          : `>${childSlots}</${Component}>`,
      )}`,
    );
    html = '';
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === 'astro:jsx') {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ''));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(props)}`,
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata,
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (
          !html.includes(
            key === 'default' ? `<astro-slot>` : `<astro-slot name="${key}">`,
          )
        ) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template =
    unrenderedSlots.length > 0
      ? unrenderedSlots
          .map(
            (key) =>
              `<template data-astro-template${
                key !== 'default' ? `="${key}"` : ''
              }>${children[key]}</template>`,
          )
          .join('')
      : '';
  island.children = `${html ?? ''}${template}`;
  if (island.children) {
    island.props['await-children'] = '';
  }
  async function* renderAll() {
    yield { type: 'directive', hydration, result };
    yield markHTMLString(renderElement$1('astro-island', island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return (
    index ===
    all.findIndex(
      (i) => JSON.stringify(i.props) === props && i.children == children,
    )
  );
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles)
    .filter(uniqueElements)
    .map((style) => renderElement$1('style', style));
  result.styles.clear();
  const scripts = Array.from(result.scripts)
    .filter(uniqueElements)
    .map((script, i) => {
      return renderElement$1('script', script, false);
    });
  const links = Array.from(result.links)
    .filter(uniqueElements)
    .map((link) => renderElement$1('link', link, false));
  return markHTMLString(
    links.join('\n') + styles.join('\n') + scripts.join('\n'),
  );
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === 'object' &&
  Object.prototype.toString.call(process) === '[object process]';

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = '';
  if (scopedClassName) {
    if (typeof values.class !== 'undefined') {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values['class:list'] !== 'undefined') {
      values['class:list'] = [values['class:list'], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = 'astro:jsx';
const Empty = Symbol('empty');
const toSlotName = (str) =>
  str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === 'object' && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === 'string') return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child)) return;
    if (!('slot' in child.props)) return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]['$$slot'] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children
      .map((child) => {
        if (!isVNode(child)) return child;
        if (!('slot' in child.props)) return child;
        const name = toSlotName(child.props.slot);
        if (Array.isArray(slots[name])) {
          slots[name].push(child);
        } else {
          slots[name] = [child];
          slots[name]['$$slot'] = true;
        }
        delete child.props.slot;
        return Empty;
      })
      .filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === 'string') return markHTMLString(child);
  if (Array.isArray(child)) return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!('set:html' in vnode.props || 'set:text' in vnode.props)) return;
  if ('set:html' in vnode.props) {
    const children = markRawChildren(vnode.props['set:html']);
    delete vnode.props['set:html'];
    Object.assign(vnode.props, { children });
    return;
  }
  if ('set:text' in vnode.props) {
    const children = vnode.props['set:text'];
    delete vnode.props['set:text'];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {},
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = 'astro-client-only';
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === '') {
        return '';
      }
      return vnode;
    case typeof vnode === 'string':
      return markHTMLString(escapeHTML(vnode));
    case !vnode && vnode !== 0:
      return '';
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join(''),
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for('astro:fragment'):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (
            key === 'children' ||
            (value && typeof value === 'object' && value['$$slot'])
          ) {
            slots[key === 'children' ? 'default' : key] = () =>
              renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(
          await renderToString(result, vnode.type, props, slots),
        );
      }
      case !vnode.type && vnode.type !== 0:
        return '';
      case typeof vnode.type === 'string' &&
        vnode.type !== ClientOnlyPlaceholder:
        return markHTMLString(
          await renderElement(result, vnode.type, vnode.props ?? {}),
        );
    }
    if (vnode.type) {
      let extractSlots2 = function (child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ('slot' in child.props) {
          _slots[child.props.slot] = [
            ...(_slots[child.props.slot] ?? []),
            child,
          ];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === 'function' && vnode.type['astro:renderer']) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === 'function' && vnode.props['server:root']) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (
        typeof vnode.type === 'function' &&
        !skipAstroJSXCheck.has(vnode.type)
      ) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: [],
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value['$$slot']) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0) return;
            slots[key] = () => output2;
          }),
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props['client:only']) {
        output = await renderComponent(
          result,
          vnode.props['client:display-name'] ?? '',
          null,
          props,
          slots,
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === 'function' ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots,
        );
      }
      if (typeof output !== 'string' && Symbol.asyncIterator in output) {
        let body = '';
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == '') && voidElementNames.test(tag)
        ? `/>`
        : `>${
            children == null ? '' : await renderJSX(result, children)
          }</${tag}>`,
    )}`,
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {}
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === 'string') {
    const isKnownReactHookError =
      msg.includes('Warning: Invalid hook call.') &&
      msg.includes('https://reactjs.org/link/invalid-hook-call');
    if (isKnownReactHookError) return;
  }
}

const slotName = (str) =>
  str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(
  Component,
  props,
  { default: children = null, ...slotted } = {},
) {
  if (typeof Component !== 'function') return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {}
  return false;
}
async function renderToStaticMarkup(
  Component,
  props = {},
  { default: children = null, ...slotted } = {},
) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(
    result,
    createVNode(Component, { ...props, ...slots, children }),
  );
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup,
};

const $$metadata$b = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/BaseHead.astro',
  {
    modules: [],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$b = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/BaseHead.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const {
    title,
    description,
    image = '/placeholder-social.jpg',
    imageWidth,
    imageHeight,
    tags,
  } = Astro2.props;
  return renderTemplate`<!-- Global Metadata --><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="/favicon.png">
<meta name="generator"${addAttribute(Astro2.generator, 'content')}>

<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title"${addAttribute(title, 'content')}>
<meta name="description"${addAttribute(description, 'content')}>

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url"${addAttribute(Astro2.url, 'content')}>
<meta property="og:title"${addAttribute(title, 'content')}>
<meta property="og:description"${addAttribute(description, 'content')}>
<meta property="og:image"${addAttribute(new URL(image, Astro2.url), 'content')}>

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url"${addAttribute(Astro2.url, 'content')}>
<meta property="twitter:title"${addAttribute(title, 'content')}>
<meta property="twitter:description"${addAttribute(description, 'content')}>
<meta property="twitter:image"${addAttribute(
    new URL(image, Astro2.url),
    'content',
  )}>
<meta name="twitter:label1" content="Written by">
<meta name="twitter:data1" content="tyler">
<meta name="twitter:label2" content="Filed under">
<meta name="twitter:data2"${addAttribute(
    Array.isArray(tags) ? tags.join(', ') : '',
    'content',
  )}>
<meta name="twitter:site" content="@xiaodao26">
${
  imageWidth
    ? renderTemplate`<meta property="og:image:width"${addAttribute(
        String(imageWidth ?? 0),
        'content',
      )}>`
    : null
}
${
  imageHeight
    ? renderTemplate`<meta property="og:image:height"${addAttribute(
        String(imageHeight ?? 0),
        'content',
      )}>`
    : null
}`;
});

const $$file$b =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/components/BaseHead.astro';
const $$url$b = undefined;

const $$module1$3 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$b,
      default: $$BaseHead,
      file: $$file$b,
      url: $$url$b,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$a = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/HeaderLink.astro',
  {
    modules: [],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$a = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/HeaderLink.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$HeaderLink = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$HeaderLink;
  const { href, class: className, ...props } = Astro2.props;
  const isActive = href === Astro2.url.pathname;
  const STYLES = [];
  for (const STYLE of STYLES) $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<a${addAttribute(
    href,
    'href',
  )}${addAttribute(
    [[className, { active: isActive }], 'astro-KWAAWCVX'],
    'class:list',
  )}${spreadAttributes(props)}>
	${renderSlot($$result, $$slots['default'])}
</a>
`;
});

const $$file$a =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/components/HeaderLink.astro';
const $$url$a = undefined;

const $$module1$2 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$a,
      default: $$HeaderLink,
      file: $$file$a,
      url: $$url$a,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const SITE_TITLE = 'Hipo log';
const SITE_DESCRIPTION = 'We must travel in the direction of our fear.';

const $$module1$1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      SITE_TITLE,
      SITE_DESCRIPTION,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$9 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/Header.astro',
  {
    modules: [
      { module: $$module1$2, specifier: './HeaderLink.astro', assert: {} },
      { module: $$module1$1, specifier: '../config', assert: {} },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$9 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/Header.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Header;
  const STYLES = [];
  for (const STYLE of STYLES) $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead(
    $$result,
  )}<header class="astro-4FOFXJZF">
	<h2 class="astro-4FOFXJZF">
		${SITE_TITLE}
	</h2>
	<nav class="astro-4FOFXJZF">
		${renderComponent(
      $$result,
      'HeaderLink',
      $$HeaderLink,
      { href: '/', class: 'astro-4FOFXJZF' },
      { default: () => renderTemplate`Home` },
    )}
		${renderComponent(
      $$result,
      'HeaderLink',
      $$HeaderLink,
      { href: '/articles', class: 'astro-4FOFXJZF' },
      { default: () => renderTemplate`Articles` },
    )}
		<!-- <HeaderLink href="/about">About</HeaderLink>
		<HeaderLink href="https://twitter.com/astrodotbuild" target="_blank">Twitter</HeaderLink>
		<HeaderLink href="https://github.com/withastro/astro" target="_blank">GitHub</HeaderLink> -->
	</nav>
</header>
`;
});

const $$file$9 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/components/Header.astro';
const $$url$9 = undefined;

const $$module2$2 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$9,
      default: $$Header,
      file: $$file$9,
      url: $$url$9,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$8 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/Footer.astro',
  {
    modules: [],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$8 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/components/Footer.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Footer;
  const today = new Date();
  const STYLES = [];
  for (const STYLE of STYLES) $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead(
    $$result,
  )}<footer class="astro-4ZKPBE5D">
	&copy; ${today.getFullYear()} Tyler. All rights reserved.
	<!-- <hr style="color: #eee;"> -->
	<br class="astro-4ZKPBE5D">
			<a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42011102004084" style="display:inline-block;text-decoration:none;height:20px;line-height:20px;font-size:14px;margin: 10px;color: #444;" class="astro-4ZKPBE5D">
				
				鄂公网安备 42011102004084号 <img src="/img/gongan.png" height="15" style="height: 15px" class="astro-4ZKPBE5D">
			</a>
			<br class="astro-4ZKPBE5D">
		<a href="https://beian.miit.gov.cn" target="_blank" style="display:inline-block;text-decoration:none;height:20px;line-height:20px;font-size:14px;color: #444;" class="astro-4ZKPBE5D">
			鄂ICP备18028144号-1
		</a>
</footer>
`;
});

const $$file$8 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/components/Footer.astro';
const $$url$8 = undefined;

const $$module3$1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$8,
      default: $$Footer,
      file: $$file$8,
      url: $$url$8,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const PaginationLimit = 30;
const AdminJwtTokenKey = 'adminJWTToken';
const CancelByAbort = 'The user aborted a request.';

const AdminUrl = 'https://cms.hicc.pro';
const SiteUrl = Object.assign(
  { BASE_URL: '/', MODE: 'production', DEV: false, PROD: true },
  { _: process.env._, SECRET_Backend: 'https://cms.hicc.pro' },
).SECRET_Url;
const apiRequestV2WithThrow = async (url, method, param = {}, option = {}) => {
  const result = await apiRequestV2(url, method, param, option);
  if (result.error) {
    throw result.error;
  }
  return result;
};

const apiRequestV2 = async (url, method, param = {}, option = {}) => {
  try {
    url = url.startsWith(AdminUrl)
      ? url
      : `${AdminUrl}${url.startsWith('/') ? url : `/${url}`}`;
    if (method === 'GET') {
      url += '?' + qs__default['default'].stringify(param);
      // console.log('---request url---', url);
    }
    // console.log('---request url---', url, param, option);
    const res = await fetch$1__default['default'](url, {
      ...(method !== 'GET' && {
        body: JSON.stringify(option.query ? { query: option.query } : param),
      }),
      method: method,
      headers: {
        'content-type': 'application/json',
        ...(option.token && {
          Authorization: `Bearer ${option.token}`,
        }),
      },
      ...(option.signal ? { signal: option.signal } : {}),
    });
    // console.log('--1 0', url);
    if (url.endsWith('posts')) {
      console.log('--1', param, res, url);
    }
    if (
      (res.status === 401 && res.statusText === 'Unauthorized') ||
      (res.status === 403 && res.statusText === 'Forbidden')
    ) {
      return {
        error: res.statusText,
        unauthorized: true,
      };
    }
    if (option.returnText) {
      const count = await res.text();
      return {
        error: '',
        data: parseInt(count),
      };
    }
    const data = await res.json();
    // console.log('--2 url', url, data);
    if (option.query) {
      // graphql
      return {
        error: '',
        data: data.data,
      };
    }
    if (!option.noObject && typeof data === 'object') {
      if (data.error) {
        const error = data.message?.[0]?.messages?.[0]?.message ?? data.error;
        return { error };
      }
      return {
        error: '',
        data,
      };
    }
    if (option.noObject) {
      return { error: '', data };
    }
    return { error: 'unknow error' };
  } catch (e) {
    console.log('---e', e);
    const error =
      typeof e === 'object' ? e?.message ?? 'Api Error' : e.toString();
    // console.warn('---apiRequest---', error.message === apiRequest.CanelByObort);
    return { error };
  }
};

function toJsonObject(data, timeLocal = false) {
  // console.log('-tojsondata', data);
  if (!data) {
    return data;
  }
  const _data = { ...data };
  // _data._createTime =
  //   _data.createTime instanceof Date ? _data.createTime.toLocaleString() : '';
  // _data._modifyTime =
  //   _data.modifyTime instanceof Date ? _data.modifyTime.toLocaleString() : '';
  const cr =
    !timeLocal || !_data.created_at
      ? _data.created_at ?? ''
      : new Date(_data.created_at).toLocaleString();
  const up =
    !timeLocal || !_data.updated_at
      ? _data.updated_at ?? ''
      : new Date(_data.updated_at).toLocaleString();
  _data._createTime = cr;
  _data._modifyTime = up;
  _data.createTime = cr;
  _data.modifyTime = up;
  const content = _data.content || '';
  const richContent = _data.richContent || {};
  _data.content = richContent;
  _data.rawContent = content;
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      _data[key] = value.getTime();
    }
  }

  return _data;
}

const DefaultSiteFeatureImage = {
  url: 'https://image.hicc.pro/pro/20210621011100FogTEZ-rHY_vjy8BV-yGeEPPrBe3NWXhU6m2v1W4087jDXEnl.jpg',
  width: 4032,
  height: 3024,
};
const prismPlugins = [
  // 'autolinker',
  // 'command-line',
  // 'data-uri-highlight',
  // 'diff-highlight',
  // 'inline-color',
  'keep-markup',
  'line-numbers',
  'show-invisibles',
  // 'treeview',
];
async function markdownToHtml(markdown) {
  const result = await remark
    .remark()
    .use(slug__default['default'])
    .use(toc__default['default'], { skip: 'Intro' })
    .use((config) => {
      return function loopTree(node) {
        // console.log('---', node);
        if (node.type === 'code') {
          node.lang += `[class="${prismPlugins.join(' ')}"]`;
        } else if (Array.isArray(node.children)) {
          node.children.forEach(loopTree);
        }
      };
    }, {})
    .use(prism__default['default'], {
      // transformInlineCode: true,
      plugins: prismPlugins,
    })
    .use(html__default['default'])
    .process(markdown);
  return result.toString();
}
/**
 * query books
 * @returns
 */
const getBooks = () => {
  return apiRequestV2WithThrow(
    'graphql',
    'POST',
    {},
    {
      query: `query {
        books(limit:20) {
          id,name,slug,status, 
        }
      }`,
    },
  );
};
/**
 * query books
 * @param {*} start
 * @param {*} bookUUID
 * @returns
 */
const getPosts = (start = 0, bookUUID = '') => {
  const limit = PaginationLimit;
  return apiRequestV2WithThrow(
    `graphql`,
    'POST',
    {},
    {
      query: `query {
        posts(limit: ${limit},start:${
          start * limit
        },sort: "created_at:desc", where:{
        status: "published",
        ${bookUUID ? `book: { slug: "${bookUUID}" }` : ''}
      }) {
          slug,
          uuid,
          status,
          name,
          book {
            id,uuid,name,slug
          },
          updated_at,
					created_at
        }
      }`,
    },
  );
};
const getImgInfo = async (url) => {
  if (url.startsWith('http') || url.startsWith('//')) {
    try {
      url = url.startsWith('//') ? `https:${url}` : url;
      // const pathname = nodeUrl.parse(url);
      // const key = Buffer.from('hicdn:' + pathname).toString('base64');
      let _url =
        (url.includes('?') ? url.slice(0, url.indexOf('?')) : url) +
        '?imageInfo';
      _url = new nodeUrl__default['default'].URL(_url).href;
      const res = await fetch(_url);
      const result = await res.json();
      return { isOk: true, result };
      // console.log('---stat', _url, result);
      // block.data.file.width = result.width;
      // block.data.file.height = result.height;
      // block.data.file.isFirst = i === 0;
      // if (
      //   url.startsWith('https://image.hicc.pro') ||
      //   url.startsWith('http://image.hicc.pro')
      // ) {
      //   block.data.file.sourceType = 'qiniu';
      // }
    } catch (error) {
      console.log('--get img info--', error);
    }
  }
  return { isOk: false };
};
const getPostDetail = async (postUUID) => {
  const posts = await apiRequestV2WithThrow(
    `/posts`,
    'GET',
    {
      _where: { _or: [{ uuid: postUUID }, { slug: postUUID }] },
      _limit: 1,
    },
    {},
  );

  // console.log('--getPostDetail',posts)

  const post = toJsonObject(posts.data?.[0] ?? null, true);
  // console.log('---post info ---', post, posts);
  let featureImage = {};
  if (post?.meta?.featureImage?.url) {
    if (post.meta.featureImage.formats?.medium) {
      featureImage = post.meta.featureImage.formats.medium;
    } else {
      const { isOk, result } = await getImgInfo(post.meta.featureImage.url);
      featureImage = {
        url: post.meta.featureImage.url,
        ...(isOk && result),
      };
    }
  }
  const base = {
    adminUrl: AdminUrl,
    siteUrl: SiteUrl,
    defaultSiteFeatureImage: DefaultSiteFeatureImage,
    featureImage,
  };
  if (post && typeof post.rawContent === 'string' && post.rawContent) {
    // post.html = mdToHTML(post.rawContent);
    // const md = (post.rawContent || '') + '## toc\n';
    post.rawContent = `## toc\n# Intro\n${post.rawContent || ''}`;
    // const mdHtml = await markdownToHtml(md);
    // delete post.rawContent;
    return {
      props: {
        post,
        error: posts.error ?? '',
        ...base,
        featureImage: base.featureImage.url
          ? base.featureImage
          : DefaultSiteFeatureImage,
        isMd: true,
        // md,
      },
      revalidate: 10,
    };
  }
  const editorJsData = post?.content?.data ?? {};

  // 处理图片
  for (let i = 0; i < editorJsData.blocks.length; i++) {
    const block = editorJsData.blocks[i];
    if (block.type === 'image') {
      // console.log('--file', block.data.file.url);
      let url = block.data.file.url;
      const { isOk, result } = await getImgInfo(url);
      // const { isOk, result } = await getImgInfo(url);
      if (!base.featureImage.url) {
        base.featureImage = {
          url,
          ...(isOk && result),
        };
      }
      if (isOk) {
        block.data.file.width = result.width;
        block.data.file.height = result.height;
        block.data.file.imageProps = result;
        block.data.file.isFirst = i === 0;
        if (
          url.startsWith('https://image.hicc.pro') ||
          url.startsWith('http://image.hicc.pro')
        ) {
          block.data.file.sourceType = 'qiniu';
        }
      }
    }
    if (block.type === 'paragraph') {
      let text = block.data?.text ?? '';
      if (text.length > 300) {
        text = text.slice(0, 300);
      }
      if (!post.meta?.metaDescription) {
        if (!post.meta) {
          post.meta = {};
        }
        post.meta.metaDescription = text;
      }
    }
    if (block.type === 'code') {
      block.data.language ?? 'javascript';
      // const md = '```' + lan.toLowerCase() + '\n' + block.data.text + '\n````';
      // block.data.text = md;
      // block.data.html = await markdownToHtml(md);
    }
    if (block.type === 'table') {
      const [tHead, ...tBody] = block.data.content ?? [];
      let body = (tBody ?? []).map((col, colIndex) => {
        return col.map((item, rowIndex) => {
          const content = item;
          let rowSpan = 1;
          let colSpan = 1;
          if (item) {
            // check row
            for (let i = colIndex + 1; i < tBody.length; i++) {
              // console.log('-row', i, rowIndex);
              if (!tBody[i]?.[rowIndex]) {
                rowSpan++;
              } else {
                break;
              }
            }

            // check col
            for (let i = rowIndex + 1; i < col.length; i++) {
              // console.log('-col', i, rowIndex);
              if (!tBody[colIndex]?.[i]) {
                colSpan++;
              } else {
                break;
              }
            }
          }

          return { content, rowSpan, colSpan };
        });
      });
      block.data.enhancedContent = [tHead, ...body];
      // console.log('--table ', block.data.enhancedContent);
    }
  }

  // console.log('---editor', editorJsData);
  // if (
  //   post?.book.uuid !== params?.bookUUID &&
  //   post?.book.slug !== params?.bookUUID
  // ) {
  //   return {
  //     props: {
  //       error: 'NOT FOUNT POST',
  //     },
  //   };
  // }
  return {
    props: {
      post,
      isMd: false,
      error: posts.error ?? '',
      ...base,
      featureImage: base.featureImage.url
        ? base.featureImage
        : DefaultSiteFeatureImage,
    },
    revalidate: 10,
  };
};

const $$module2$1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      DefaultSiteFeatureImage,
      markdownToHtml,
      getBooks,
      getPosts,
      getPostDetail,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const hashCode = (st) => {
  let hash = 0;
  for (let i = 0; i < st.length; i++) {
    let character = st.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const $$module2 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      hashCode,
      PaginationLimit,
      AdminJwtTokenKey,
      CancelByAbort,
      AdminUrl,
      SiteUrl,
      apiRequestV2WithThrow,
      apiRequestV2,
      toJsonObject,
      DefaultSiteFeatureImage,
      markdownToHtml,
      getBooks,
      getPosts,
      getPostDetail,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$7 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/index.astro',
  {
    modules: [
      {
        module: $$module1$3,
        specifier: '../components/BaseHead.astro',
        assert: {},
      },
      {
        module: $$module2$2,
        specifier: '../components/Header.astro',
        assert: {},
      },
      {
        module: $$module3$1,
        specifier: '../components/Footer.astro',
        assert: {},
      },
      { module: $$module1$1, specifier: '../config', assert: {} },
      { module: $$module2, specifier: '../services', assert: {} },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$7 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/index.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$Index$2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Index$2;
  return renderTemplate`<html lang="en-us">
	<head>
		${renderComponent($$result, 'BaseHead', $$BaseHead, {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      image: DefaultSiteFeatureImage.url,
    })}
	${renderHead($$result)}</head>
	<body>
		${renderComponent($$result, 'Header', $$Header, { title: SITE_TITLE })}
		<main>
			<img${addAttribute(DefaultSiteFeatureImage?.width, 'width')}${addAttribute(
        DefaultSiteFeatureImage?.height,
        'height',
      )}${addAttribute(DefaultSiteFeatureImage?.url, 'src')} alt="">
			<p>
				我希望能够远走，逃离我的所知，逃离我的所有，逃离我的所爱。我想要出发，不是去缥渺幻境中的西印度，不是去远离其他南大陆的巨大海岛，我只是想去任何地方，不论是村庄或者荒原，只要不是在这里就行。我向往的只是不再见到这些人面，不再过这种没完没了的日子。我想做到的，是卸下我已成习惯的伪装，成为另一个我，以此得到喘息。我想要睡意临近之感，这种睡眠是生活的期许而不是生活的休息。靠着海边的一个木棚，甚至崎岖山脉边缘的一个山洞，对于我来说都够了。不幸的是，我在这些事情上从来都是事与愿违。
			</p>
		</main>
		${renderComponent($$result, 'Footer', $$Footer, {})}
	</body></html>`;
});

const $$file$7 = '/Users/tyler/CodeWithGit/cc-log-astro/src/pages/index.astro';
const $$url$7 = '';

const _page0 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$7,
      default: $$Index$2,
      file: $$file$7,
      url: $$url$7,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$6 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/layouts/BlogList.astro',
  {
    modules: [
      {
        module: $$module1$3,
        specifier: '../components/BaseHead.astro',
        assert: {},
      },
      {
        module: $$module2$2,
        specifier: '../components/Header.astro',
        assert: {},
      },
      {
        module: $$module3$1,
        specifier: '../components/Footer.astro',
        assert: {},
      },
      { module: $$module1$1, specifier: '../config', assert: {} },
      { module: $$module2, specifier: '../services', assert: {} },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$6 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/layouts/BlogList.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$BlogList = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$BlogList;
  const { page, book } = Astro2.props;
  const books = (await getBooks()).data?.books?.filter(
    (item) => item.status === 'public',
  );
  const posts = (await getPosts(page - 1, book)).data?.posts ?? [];
  const prefix = book ? `/p/${book}` : '/articles';
  const preUrl = page <= 1 ? '' : `${prefix}/page/${page - 1}`;
  const nextUrl = posts.length > 0 ? `${prefix}/page/${page + 1}` : '';
  const STYLES = [];
  for (const STYLE of STYLES) $$result.styles.add(STYLE);
  return renderTemplate`<html lang="en-us" class="astro-NGTLJA73">
	<head>
		${renderComponent($$result, 'BaseHead', $$BaseHead, {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      class: 'astro-NGTLJA73',
    })}
		
	${renderHead($$result)}</head>
	<body class="astro-NGTLJA73">
		${renderComponent($$result, 'Header', $$Header, { class: 'astro-NGTLJA73' })}
    <section class="book-nav astro-NGTLJA73">
      <ul class="astro-NGTLJA73">
        ${books.map((book2) => {
          const _path = `/p/${book2.slug}`;
          return renderTemplate`<li class="astro-NGTLJA73"><a${addAttribute(
            _path,
            'href',
          )}${addAttribute(
            (Astro2.url.pathname.startsWith(_path) ? 'active' : '') +
              ' astro-NGTLJA73',
            'class',
          )}>${book2.name}</a></li>`;
        })}
      </ul>
    </section>
		<main class="astro-NGTLJA73">
			<section class="astro-NGTLJA73">
        ${
          posts.length > 0
            ? renderTemplate`<ul class="astro-NGTLJA73">
              ${posts.map(
                (post) => renderTemplate`<li class="astro-NGTLJA73">
                  <time${addAttribute(
                    post.created_at,
                    'datetime',
                  )} class="astro-NGTLJA73">
                    ${new Date(post.created_at).toLocaleDateString('en-us', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <a${addAttribute(
                    `/p/${post.book?.slug || post.book?.uuid}/${
                      post.slug || post.uuid
                    }${''}`,
                    'href',
                  )} class="astro-NGTLJA73">
                    ${post.name}
                  </a>
                </li>`,
              )}
            </ul>`
            : renderTemplate`<p class="astro-NGTLJA73">No Data Yet!</p>`
        }
			</section>
      <div class="footer-link astro-NGTLJA73">
        <a${addAttribute(preUrl || `javascript:void`, 'href')}${addAttribute(
          (preUrl ? '' : 'mute') + ' astro-NGTLJA73',
          'class',
        )}>←&nbsp;Previous</a>
        <a${addAttribute(nextUrl || `javascript:void`, 'href')}${addAttribute(
          (nextUrl ? '' : 'mute') + ' astro-NGTLJA73',
          'class',
        )}>Next&nbsp;→</a>
      </div>
			${renderComponent($$result, 'Footer', $$Footer, { class: 'astro-NGTLJA73' })}
		</main>
	</body></html>`;
});

const $$file$6 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/layouts/BlogList.astro';
const $$url$6 = undefined;

const $$module1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$6,
      default: $$BlogList,
      file: $$file$6,
      url: $$url$6,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$5 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/articles/index.astro',
  {
    modules: [
      {
        module: $$module1,
        specifier: '../../layouts/BlogList.astro',
        assert: {},
      },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$5 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/articles/index.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Index$1;
  return renderTemplate`${renderComponent($$result, 'BlogList', $$BlogList, {
    page: 1,
  })}`;
});

const $$file$5 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/pages/articles/index.astro';
const $$url$5 = '/articles';

const _page1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$5,
      default: $$Index$1,
      file: $$file$5,
      url: $$url$5,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$4 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/articles/page/[page].astro',
  {
    modules: [
      {
        module: $$module1,
        specifier: '../../../layouts/BlogList.astro',
        assert: {},
      },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$4 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/articles/page/[page].astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$page$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$page$1;
  const { page } = Astro2.params;
  let pageN = 0;
  try {
    pageN = Number(page);
    if (isNaN(pageN) || !Number.isInteger(pageN)) {
      return new Response(null, {
        status: 404,
        statusText: 'Not found',
      });
    }
  } catch (error) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    });
  }
  if (pageN <= 1) {
    return Astro2.redirect('/articles');
  }
  return renderTemplate`${renderComponent($$result, 'BlogList', $$BlogList, {
    page: pageN,
  })}`;
});

const $$file$4 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/pages/articles/page/[page].astro';
const $$url$4 = '/articles/page/[page]';

const _page2 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$4,
      default: $$page$1,
      file: $$file$4,
      url: $$url$4,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const get = () =>
  rss__default['default']({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: 'https://example.com/',
    items: /* #__PURE__ */ Object.assign({}),
  });

const _page3 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      get,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$3 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/index.astro',
  {
    modules: [
      {
        module: $$module1,
        specifier: '../../../layouts/BlogList.astro',
        assert: {},
      },
      { module: $$module2, specifier: '../../../services', assert: {} },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$3 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/index.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Index;
  const { book, post } = Astro2.params;
  console.log('--book', book, post);
  const pageN = 1;
  return renderTemplate`${renderComponent($$result, 'BlogList', $$BlogList, {
    page: pageN,
    book: book,
  })}`;
});

const $$file$3 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/index.astro';
const $$url$3 = '/p/[book]';

const _page4 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$3,
      default: $$Index,
      file: $$file$3,
      url: $$url$3,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$2 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/page/[page].astro',
  {
    modules: [
      {
        module: $$module1,
        specifier: '../../../../layouts/BlogList.astro',
        assert: {},
      },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$2 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/page/[page].astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$page = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$page;
  const { page, book } = Astro2.params;
  let pageN = 0;
  try {
    pageN = Number(page);
    if (isNaN(pageN) || !Number.isInteger(pageN)) {
      return new Response(null, {
        status: 404,
        statusText: 'Not found',
      });
    }
  } catch (error) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    });
  }
  if (pageN <= 1) {
    return Astro2.redirect(`/p/${book}`);
  }
  return renderTemplate`${renderComponent($$result, 'BlogList', $$BlogList, {
    page: pageN,
    book: book,
  })}`;
});

const $$file$2 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/page/[page].astro';
const $$url$2 = '/p/[book]/page/[page]';

const _page5 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$2,
      default: $$page,
      file: $$file$2,
      url: $$url$2,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata$1 = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/layouts/BlogPost.astro',
  {
    modules: [
      {
        module: $$module1$3,
        specifier: '../components/BaseHead.astro',
        assert: {},
      },
      {
        module: $$module2$2,
        specifier: '../components/Header.astro',
        assert: {},
      },
      {
        module: $$module3$1,
        specifier: '../components/Footer.astro',
        assert: {},
      },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro$1 = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/layouts/BlogPost.astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { title, description, pubDate, updatedDate, heroImage, tags } =
    Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES) $$result.styles.add(STYLE);
  return renderTemplate`<html class="astro-UR4CF3E4">
	<head>
		${renderComponent($$result, 'BaseHead', $$BaseHead, {
      title: title,
      description: description,
      image: heroImage?.url ?? '',
      imageWidth: heroImage?.width,
      imageHeight: heroImage?.height,
      tags: tags,
      class: 'astro-UR4CF3E4',
    })}
		
	${renderHead($$result)}</head>
	<body class="astro-UR4CF3E4">
		${renderComponent($$result, 'Header', $$Header, { class: 'astro-UR4CF3E4' })}
		<main class="astro-UR4CF3E4">
			<article class="astro-UR4CF3E4">
				${
          heroImage?.url &&
          renderTemplate`<img${addAttribute(
            heroImage?.width,
            'width',
          )}${addAttribute(heroImage?.height, 'height')}${addAttribute(
            heroImage?.url,
            'src',
          )} alt="" class="astro-UR4CF3E4">`
        }
				<h1 class="title astro-UR4CF3E4">${title}</h1>
				${
          pubDate &&
          renderTemplate`<time style="font-size:14px" class="astro-UR4CF3E4">${pubDate}</time>`
        }
				${
          updatedDate &&
          renderTemplate`<div style="font-size:14px" class="astro-UR4CF3E4">Last updated on <time class="astro-UR4CF3E4">${updatedDate}</time></div>`
        }
				<hr class="astro-UR4CF3E4">
				${renderSlot($$result, $$slots['default'])}
			</article>
		</main>
		${renderComponent($$result, 'Footer', $$Footer, { class: 'astro-UR4CF3E4' })}
	</body></html>`;
});

const $$file$1 =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/layouts/BlogPost.astro';
const $$url$1 = undefined;

const $$module3 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata: $$metadata$1,
      default: $$BlogPost,
      file: $$file$1,
      url: $$url$1,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const Markdown = ({ md }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(ReactMarkdown__default['default'], {
    children: md,
    remarkPlugins: [
      slug__default['default'],
      [
        toc__default['default'],
        {
          skip: 'Intro',
        },
      ],
    ],
    components: {
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match
          ? /* @__PURE__ */ jsxRuntime.jsx(reactSyntaxHighlighter.Prism, {
              children: String(children).replace(/\n$/, ''),
              language: match[1],
              PreTag: 'div',
              ...props,
            })
          : /* @__PURE__ */ jsxRuntime.jsx('code', {
              className,
              ...props,
              children,
            });
      },
    },
  });
};

const $$module4 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: Markdown,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const BaseStyle = style;
const gfm = turndownPluginGfm__namespace.gfm;
const turndownService = new TurndownService__default['default']();
turndownService.use(gfm);
const toMd = (html) => turndownService.turndown(html);
const BaseUrl = '/img/placeholder.png';
const Paragraph = (props) => {
  const text = props.data?.text ?? '';
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsx('p', {
      children: toMd(text),
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx('p', {
    dangerouslySetInnerHTML: {
      __html: text,
    },
  });
};
const Image = (props) => {
  let url = props.data?.file?.url ?? BaseUrl;
  props.data?.file?.width ?? 0;
  props.data?.file?.height ?? 0;
  props.data?.file?.sourceType ?? '';
  const caption = props.data?.caption ?? '';
  props.data?.file?.isFirst ?? false;
  if (!url.startsWith('/u') && !url.startsWith('/img')) {
    const fullUrl = `${url.startsWith('http') ? '' : 'https:'}${url}`;
    const _url =
      fullUrl + '?imageMogr2/auto-orient/thumbnail/660x/blur/1x0/quality/75';
    if (props.isMd) {
      return /* @__PURE__ */ jsxRuntime.jsxs('p', {
        children: ['![', caption, '](', _url, ')'],
      });
    }
    return /* @__PURE__ */ jsxRuntime.jsxs('picture', {
      children: [
        /* @__PURE__ */ jsxRuntime.jsx('source', {
          srcSet: `${url}?imageMogr2/auto-orient/thumbnail/660x/format/webp/blur/1x0/quality/75`,
          type: 'image/webp',
        }),
        /* @__PURE__ */ jsxRuntime.jsx('img', {
          src: _url,
          alt: caption,
        }),
      ],
    });
  }
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs('p', {
      children: ['![', caption, '](https://hicc.pro', url, ')'],
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx('p', {
    children: /* @__PURE__ */ jsxRuntime.jsx('img', {
      src: url,
    }),
  });
};
const HeaderLink = (props) => {
  const [canCopy, setCanCopy] = React.useState(false);
  React.useEffect(() => {
    if (window?.navigatory?.clipboard?.writeText) {
      setCanCopy(true);
    }
  }, []);
  function copyLink() {
    navigator?.clipboard?.writeText?.(
      window.location.origin + window.location.pathname + `#${props.id}`,
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx('span', {
    className: style.headerLink,
    title: canCopy ? 'copy header link' : '',
    onClick: () => copyLink(),
    children: '#',
  });
};
const Header = (props) => {
  const text = props.data?.text ?? '';
  const id = hashCode(text) + '';
  const level = props.data?.level ?? 3;
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsx('div', {
      dangerouslySetInnerHTML: {
        __html: `<h${level}>${new Array(level)
          .fill('#')
          .join('')} ${text}</h${level}>`,
      },
    });
  }
  switch (level) {
    case 1:
      return /* @__PURE__ */ jsxRuntime.jsxs('h1', {
        id,
        className: style.header,
        children: [
          text,
          /* @__PURE__ */ jsxRuntime.jsx(HeaderLink, {
            id,
          }),
        ],
      });
    case 2:
      return /* @__PURE__ */ jsxRuntime.jsxs('h2', {
        id,
        className: style.header,
        children: [
          text,
          /* @__PURE__ */ jsxRuntime.jsx(HeaderLink, {
            id,
          }),
        ],
      });
    case 3:
      return /* @__PURE__ */ jsxRuntime.jsxs('h3', {
        id,
        className: style.header,
        children: [
          text,
          /* @__PURE__ */ jsxRuntime.jsx(HeaderLink, {
            id,
          }),
        ],
      });
    case 4:
      return /* @__PURE__ */ jsxRuntime.jsxs('h4', {
        id,
        className: style.header,
        children: [
          text,
          /* @__PURE__ */ jsxRuntime.jsx(HeaderLink, {
            id,
          }),
        ],
      });
    case 5:
      return /* @__PURE__ */ jsxRuntime.jsxs('h5', {
        id,
        className: style.header,
        children: [
          text,
          /* @__PURE__ */ jsxRuntime.jsx(HeaderLink, {
            id,
          }),
        ],
      });
    default:
      return /* @__PURE__ */ jsxRuntime.jsxs('h3', {
        id,
        className: style.header,
        children: [
          text,
          /* @__PURE__ */ jsxRuntime.jsx(HeaderLink, {
            id,
          }),
        ],
      });
  }
};
const List = (props) => {
  const list = props.data?.items ?? [];
  const isOrdered = props.data.style === 'ordered';
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, {
      children: [
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
        /* @__PURE__ */ jsxRuntime.jsx('div', {
          style: {
            paddingLeft: 0,
            listStyle: 'none',
          },
          children: list.map((item, index) => {
            return /* @__PURE__ */ jsxRuntime.jsxs(
              'div',
              {
                style: {
                  marginBottom: 8,
                  lineHeight: 1,
                },
                children: [isOrdered ? `${index + 1}. ` : '- ', toMd(item)],
              },
              `${index}`,
            );
          }),
        }),
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
      ],
    });
  }
  const content = /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, {
    children: list.map((item, index) => {
      return /* @__PURE__ */ jsxRuntime.jsx(
        'li',
        {
          dangerouslySetInnerHTML: {
            __html: item,
          },
        },
        `${index}`,
      );
    }),
  });
  if (isOrdered) {
    return /* @__PURE__ */ jsxRuntime.jsx('ol', {
      children: content,
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx('ul', {
    children: content,
  });
};
const Code = (props) => {
  let lan = props.data.language ?? 'javascript';
  lan = lan === 'TypeScript Jsx' ? 'tsx' : lan;
  lan = lan === 'Javascript Jsx' ? 'jsx' : lan;
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, {
      children: [
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
        '```',
        lan.toLowerCase(),
        /* @__PURE__ */ jsxRuntime.jsx('pre', {
          children: /* @__PURE__ */ jsxRuntime.jsx('code', {
            children: props.data.text,
          }),
        }),
        '```',
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(reactSyntaxHighlighter.Prism, {
    children: props.data.text ?? '',
    language: lan.toLowerCase(),
    PreTag: 'div',
  });
};
const LinkTool = (props) => {
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs('p', {
      children: [
        '[',
        props.data?.meta?.title ?? props.data.link ?? 'untitle',
        '](',
        props.data.link,
        ')',
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs('a', {
    className: `${style['link-tool']} ${BaseStyle.card} ${BaseStyle.unlink}`,
    href: props.data.link,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx('img', {
        src: props.data?.meta?.image?.url ?? BaseUrl,
        alt: '',
      }),
      /* @__PURE__ */ jsxRuntime.jsxs('div', {
        className: style['link-tool-info'],
        children: [
          /* @__PURE__ */ jsxRuntime.jsx('h6', {
            className: style['link-tool-info-title'],
            children: props.data?.meta?.title ?? props.data.link ?? 'untitle',
          }),
          /* @__PURE__ */ jsxRuntime.jsx('p', {
            className: style['link-tool-info-desp'],
            children: props.data?.meta?.description ?? '',
          }),
        ],
      }),
    ],
  });
};
const Delimiter = (props) => {
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsx('p', {
      children: '---',
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx('div', {
    className: BaseStyle.hr,
  });
};
const Embed = (props) => {
  if (!props.data?.embed) {
    return null;
  }
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, {
      children: [
        /* @__PURE__ */ jsxRuntime.jsx('pre', {
          className: style.break,
          children: /* @__PURE__ */ jsxRuntime.jsx('code', {
            children: `<div><iframe src="${props.data?.embed}"></iframe></div>`,
          }),
        }),
        toMd(props.data?.caption ?? ''),
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs('div', {
    className: style.embed,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx('iframe', {
        src: props.data?.embed,
      }),
      /* @__PURE__ */ jsxRuntime.jsx('p', {
        style: {
          textAlign: 'center',
        },
        dangerouslySetInnerHTML: {
          __html: props.data?.caption ?? '',
        },
      }),
    ],
  });
};
const Warning = (props) => {
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs('div', {
      style: {
        margin: '16px 0',
      },
      children: [
        '**\u{1F449}',
        toMd(props.data?.title ?? ''),
        '**',
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
        /* @__PURE__ */ jsxRuntime.jsx('br', {}),
        toMd(props.data?.message ?? ''),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs('div', {
    style: {
      margin: 10,
    },
    children: [
      /* @__PURE__ */ jsxRuntime.jsxs('strong', {
        children: [
          '\u{1F449}',
          /* @__PURE__ */ jsxRuntime.jsx('span', {
            dangerouslySetInnerHTML: {
              __html: props.data?.title ?? '',
            },
          }),
        ],
      }),
      /* @__PURE__ */ jsxRuntime.jsx('p', {
        dangerouslySetInnerHTML: {
          __html: props.data?.message ?? '',
        },
      }),
    ],
  });
};
const Md = (props) => {
  const text = props.data.text ?? '';
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsx('pre', {
      children: text,
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(Markdown, {
    md: text,
  });
};
const Quote = (props) => {
  const html = `<blockquote>
<p >${props.data?.text ?? ''}</p>
  <footer>${props.data?.caption ?? ''}</footer>
</blockquote>`;
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsx('p', {
      dangerouslySetInnerHTML: {
        __html: toMd(html).replace(/\>/g, '<br>>&nbsp;'),
      },
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs('blockquote', {
    children: [
      /* @__PURE__ */ jsxRuntime.jsx('p', {
        dangerouslySetInnerHTML: {
          __html: props.data?.text ?? '',
        },
      }),
      /* @__PURE__ */ jsxRuntime.jsx('footer', {
        dangerouslySetInnerHTML: {
          __html: props.data?.caption ?? '',
        },
      }),
    ],
  });
};
const Table = (props) => {
  if (!Array.isArray(props.data.content) || props.data.content.length === 0) {
    return null;
  }
  const [tHead, ...tBody] = props.data.content;
  const [_, ...eTBody] = props.data.enhancedContent ?? [];
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsxs('div', {
      style: {
        margin: '16px 0',
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx('div', {
          children: tHead.map((item, i) => {
            return /* @__PURE__ */ jsxRuntime.jsxs(
              'span',
              {
                children: [i ? '' : '|', toMd(item ?? ''), '|'],
              },
              `${i}`,
            );
          }),
        }),
        /* @__PURE__ */ jsxRuntime.jsx('div', {
          children: tHead.map((item, i) => {
            return /* @__PURE__ */ jsxRuntime.jsxs(
              'span',
              {
                children: [i ? '' : '|', '---|'],
              },
              `${i}`,
            );
          }),
        }),
        tBody.map((item, index) => {
          return /* @__PURE__ */ jsxRuntime.jsx(
            'div',
            {
              children: (Array.isArray(item) ? item : []).map((trItem, i) => {
                if (!trItem.content) {
                  return null;
                }
                return /* @__PURE__ */ jsxRuntime.jsxs(
                  'span',
                  {
                    children: [i ? '' : '|', toMd(trItem ?? ''), '|'],
                  },
                  `${i}`,
                );
              }),
            },
            index.toString(),
          );
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs('table', {
    children: [
      /* @__PURE__ */ jsxRuntime.jsx('thead', {
        children: /* @__PURE__ */ jsxRuntime.jsx('tr', {
          children: tHead.map((item, i) => {
            return /* @__PURE__ */ jsxRuntime.jsx(
              'th',
              {
                dangerouslySetInnerHTML: {
                  __html: item ?? '',
                },
              },
              `${i}`,
            );
          }),
        }),
      }),
      /* @__PURE__ */ jsxRuntime.jsx('tbody', {
        children: eTBody.map((item, index) => {
          return /* @__PURE__ */ jsxRuntime.jsx(
            'tr',
            {
              children: (Array.isArray(item) ? item : []).map((trItem, i) => {
                if (!trItem.content) {
                  return null;
                }
                return /* @__PURE__ */ jsxRuntime.jsx(
                  'td',
                  {
                    rowSpan: trItem?.rowSpan ?? 1,
                    colSpan: trItem?.colSpan ?? 1,
                    dangerouslySetInnerHTML: {
                      __html: trItem?.content ?? '',
                    },
                  },
                  `${i}`,
                );
              }),
            },
            `${index}`,
          );
        }),
      }),
    ],
  });
};
const Checklist = (props) => {
  if (props.isMd) {
    return /* @__PURE__ */ jsxRuntime.jsx('div', {
      style: {
        margin: '16px 0',
      },
      children: (props.data.items ?? []).map((item, i) => {
        return /* @__PURE__ */ jsxRuntime.jsxs(
          'div',
          {
            children: [
              `- [${item.checked ? 'x' : ' '}] `,
              toMd(item.text ?? ''),
            ],
          },
          `${i}`,
        );
      }),
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx('ul', {
    style: {
      listStyle: 'none',
    },
    children: (props.data.items ?? []).map((item, i) => {
      return /* @__PURE__ */ jsxRuntime.jsxs(
        'li',
        {
          children: [
            /* @__PURE__ */ jsxRuntime.jsx('input', {
              type: 'checkbox',
              checked: !!item.checked,
              readOnly: true,
            }),
            /* @__PURE__ */ jsxRuntime.jsx('span', {
              dangerouslySetInnerHTML: {
                __html: item.text ?? '',
              },
            }),
          ],
        },
        `${i}`,
      );
    }),
  });
};
const EditorJsRender = (props) => {
  return /* @__PURE__ */ jsxRuntime.jsx('div', {
    className: `${style.box} ${BaseStyle['artical']} ${
      props.isMd ? style.isMd : ''
    }`,
    children: (props.data?.blocks ?? []).map(({ type, data }, index) => {
      if (typeof data !== 'object' || !data) {
        return /* @__PURE__ */ jsxRuntime.jsx(
          'div',
          {
            children: '-',
          },
          `${index}`,
        );
      }
      switch (type) {
        case 'paragraph':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Paragraph,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'image':
          if (data.file.isFirst) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntime.jsx(
            Image,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'header':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Header,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'list':
          return /* @__PURE__ */ jsxRuntime.jsx(
            List,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'code':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Code,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'linkTool':
          return /* @__PURE__ */ jsxRuntime.jsx(
            LinkTool,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'delimiter':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Delimiter,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'quote':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Quote,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'table':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Table,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'checklist':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Checklist,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'embed':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Embed,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'warning':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Warning,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
        case 'md':
          return /* @__PURE__ */ jsxRuntime.jsx(
            Md,
            {
              data,
              isMd: props.isMd,
            },
            `${index}`,
          );
      }
      return /* @__PURE__ */ jsxRuntime.jsxs(
        'div',
        {
          children: ['TODO ', type],
        },
        `${index}`,
      );
    }),
  });
};

const $$module5 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: EditorJsRender,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const $$metadata = createMetadata(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/[post].astro',
  {
    modules: [
      { module: $$module1$1, specifier: '../../../config', assert: {} },
      { module: $$module2$1, specifier: '../../../services/post', assert: {} },
      {
        module: $$module3,
        specifier: '../../../layouts/BlogPost.astro',
        assert: {},
      },
      {
        module: $$module4,
        specifier: '../../../components/Markdown',
        assert: {},
      },
      {
        module: $$module5,
        specifier: '../../../components/EditorJsRender',
        assert: {},
      },
    ],
    hydratedComponents: [],
    clientOnlyComponents: [],
    hydrationDirectives: /* @__PURE__ */ new Set([]),
    hoisted: [],
  },
);
const $$Astro = createAstro(
  '/@fs/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/[post].astro',
  'https://example.com/',
  'file:///Users/tyler/CodeWithGit/cc-log-astro/',
);
const $$post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$post;
  const { book, post } = Astro2.params;
  const result = await getPostDetail(post);
  const isMd = !!result.props?.isMd;
  console.log('--', result.props?.post);
  return renderTemplate`${renderComponent(
    $$result,
    'BlogPost',
    $$BlogPost,
    {
      title: result.props?.post?.name ?? '',
      pubDate: result.props?.post?._createTime,
      updatedDate: result.props?.post?._modifyTime,
      description: result.props?.post?.meta?.metaDescription,
      heroImage: result.props?.post?.meta?.featureImage,
      tags: result.props?.post?.tags?.map((item) => item.name),
    },
    {
      default: () =>
        renderTemplate`${
          isMd
            ? renderTemplate`${renderComponent($$result, 'Markdown', Markdown, {
                md: result.props?.post?.rawContent ?? '',
              })}`
            : renderTemplate`${renderComponent(
                $$result,
                'EditorJsRender',
                EditorJsRender,
                { data: result.props?.post?.content?.data ?? {} },
              )}`
        }`,
    },
  )}`;
});

const $$file =
  '/Users/tyler/CodeWithGit/cc-log-astro/src/pages/p/[book]/[post].astro';
const $$url = '/p/[book]/[post]';

const _page6 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      $$metadata,
      default: $$post,
      file: $$file,
      url: $$url,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const pageMap = new Map([
  ['src/pages/index.astro', _page0],
  ['src/pages/articles/index.astro', _page1],
  ['src/pages/articles/page/[page].astro', _page2],
  ['src/pages/rss.xml.js', _page3],
  ['src/pages/p/[book]/index.astro', _page4],
  ['src/pages/p/[book]/page/[page].astro', _page5],
  ['src/pages/p/[book]/[post].astro', _page6],
]);
const renderers = [
  Object.assign(
    {
      name: 'astro:jsx',
      serverEntrypoint: 'astro/jsx/server.js',
      jsxImportSource: 'astro',
    },
    { ssr: server_default },
  ),
  Object.assign(
    {
      name: '@astrojs/react',
      clientEntrypoint: '@astrojs/react/client.js',
      serverEntrypoint: '@astrojs/react/server.js',
      jsxImportSource: 'react',
    },
    { ssr: _renderer1 },
  ),
];

if (typeof process !== 'undefined') {
  if (process.argv.includes('--verbose'));
  else if (process.argv.includes('--silent'));
  else;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set(['.js', '.ts']);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS)
    .map((s) => s.slice(1))
    .join('|')})($|\\?)`,
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  '.css',
  '.pcss',
  '.postcss',
  '.scss',
  '.sass',
  '.styl',
  '.stylus',
  '.less',
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS)
    .map((s) => s.slice(1))
    .join('|')})($|\\?)`,
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments
    .map((segment) => {
      return segment[0].spread
        ? `/:${segment[0].content.slice(3)}(.*)?`
        : '/' +
            segment
              .map((part) => {
                if (part)
                  return part.dynamic
                    ? `:${part.content}`
                    : part.content
                        .normalize()
                        .replace(/\?/g, '%3F')
                        .replace(/#/g, '%23')
                        .replace(/%5B/g, '[')
                        .replace(/%5D/g, ']')
                        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              })
              .join('');
    })
    .join('');
  let trailing = '';
  if (addTrailingSlash === 'always' && segments.length) {
    trailing = '/';
  }
  const toPath = pathToRegexp.compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(
      rawRouteData.segments,
      rawRouteData._meta.trailingSlash,
    ),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData),
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes,
  };
}

const _manifest = Object.assign(
  deserializeManifest({
    adapterName: '@astrojs/node',
    routes: [
      {
        file: '',
        links: ['assets/2cf4be4c.d6ea856c.css'],
        scripts: [],
        routeData: {
          route: '/',
          type: 'page',
          pattern: '^\\/$',
          segments: [],
          params: [],
          component: 'src/pages/index.astro',
          pathname: '/',
          _meta: { trailingSlash: 'ignore' },
        },
      },
      {
        file: '',
        links: ['assets/2cf4be4c.d6ea856c.css', 'assets/a9a5066e.d75c936e.css'],
        scripts: [],
        routeData: {
          route: '/articles',
          type: 'page',
          pattern: '^\\/articles\\/?$',
          segments: [[{ content: 'articles', dynamic: false, spread: false }]],
          params: [],
          component: 'src/pages/articles/index.astro',
          pathname: '/articles',
          _meta: { trailingSlash: 'ignore' },
        },
      },
      {
        file: '',
        links: ['assets/2cf4be4c.d6ea856c.css', 'assets/a9a5066e.d75c936e.css'],
        scripts: [],
        routeData: {
          route: '/articles/page/[page]',
          type: 'page',
          pattern: '^\\/articles\\/page\\/([^/]+?)\\/?$',
          segments: [
            [{ content: 'articles', dynamic: false, spread: false }],
            [{ content: 'page', dynamic: false, spread: false }],
            [{ content: 'page', dynamic: true, spread: false }],
          ],
          params: ['page'],
          component: 'src/pages/articles/page/[page].astro',
          _meta: { trailingSlash: 'ignore' },
        },
      },
      {
        file: '',
        links: [],
        scripts: [],
        routeData: {
          route: '/rss.xml',
          type: 'endpoint',
          pattern: '^\\/rss\\.xml$',
          segments: [[{ content: 'rss.xml', dynamic: false, spread: false }]],
          params: [],
          component: 'src/pages/rss.xml.js',
          pathname: '/rss.xml',
          _meta: { trailingSlash: 'ignore' },
        },
      },
      {
        file: '',
        links: ['assets/2cf4be4c.d6ea856c.css', 'assets/a9a5066e.d75c936e.css'],
        scripts: [],
        routeData: {
          route: '/p/[book]',
          type: 'page',
          pattern: '^\\/p\\/([^/]+?)\\/?$',
          segments: [
            [{ content: 'p', dynamic: false, spread: false }],
            [{ content: 'book', dynamic: true, spread: false }],
          ],
          params: ['book'],
          component: 'src/pages/p/[book]/index.astro',
          _meta: { trailingSlash: 'ignore' },
        },
      },
      {
        file: '',
        links: ['assets/2cf4be4c.d6ea856c.css', 'assets/a9a5066e.d75c936e.css'],
        scripts: [],
        routeData: {
          route: '/p/[book]/page/[page]',
          type: 'page',
          pattern: '^\\/p\\/([^/]+?)\\/page\\/([^/]+?)\\/?$',
          segments: [
            [{ content: 'p', dynamic: false, spread: false }],
            [{ content: 'book', dynamic: true, spread: false }],
            [{ content: 'page', dynamic: false, spread: false }],
            [{ content: 'page', dynamic: true, spread: false }],
          ],
          params: ['book', 'page'],
          component: 'src/pages/p/[book]/page/[page].astro',
          _meta: { trailingSlash: 'ignore' },
        },
      },
      {
        file: '',
        links: [
          'assets/2cf4be4c.d6ea856c.css',
          'assets/p-_book_-_post_.73b67c00.css',
        ],
        scripts: [],
        routeData: {
          route: '/p/[book]/[post]',
          type: 'page',
          pattern: '^\\/p\\/([^/]+?)\\/([^/]+?)\\/?$',
          segments: [
            [{ content: 'p', dynamic: false, spread: false }],
            [{ content: 'book', dynamic: true, spread: false }],
            [{ content: 'post', dynamic: true, spread: false }],
          ],
          params: ['book', 'post'],
          component: 'src/pages/p/[book]/[post].astro',
          _meta: { trailingSlash: 'ignore' },
        },
      },
    ],
    site: 'https://example.com/',
    base: '/',
    markdown: {
      drafts: false,
      syntaxHighlight: 'shiki',
      shikiConfig: { langs: [], theme: 'github-dark', wrap: false },
      remarkPlugins: [],
      rehypePlugins: [],
      remarkRehype: {},
      extendDefaultPlugins: false,
      isAstroFlavoredMd: false,
    },
    pageMap: null,
    renderers: [],
    entryModules: {
      '\u0000@astrojs-ssr-virtual-entry': 'entry.mjs',
      '@astrojs/react/client.js': 'client.bf4f0f8e.js',
      'astro:scripts/before-hydration.js':
        'data:text/javascript;charset=utf-8,//[no before-hydration script]',
    },
    assets: [
      '/assets/2cf4be4c.d6ea856c.css',
      '/assets/a9a5066e.d75c936e.css',
      '/assets/p-_book_-_post_.73b67c00.css',
      '/client.bf4f0f8e.js',
      '/favicon.png',
      '/favicon.svg',
      '/placeholder-about.jpg',
      '/placeholder-hero.jpg',
      '/placeholder-social.jpg',
      '/social.jpg',
      '/social.png',
      '/img/dragon_hicc.jpeg',
      '/img/favicon.png',
      '/img/gongan.png',
      '/img/logo.png',
      '/img/logo.svg',
      '/img/placeholder.png',
      '/assets/blog/introducing-astro.jpg',
    ],
  }),
  {
    pageMap: pageMap,
    renderers: renderers,
  },
);
const _args = undefined;

const _exports = adapter__namespace.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if (_start in adapter__namespace) {
  adapter__namespace[_start](_manifest, _args);
}

const koa = require('koa');
const serve = require('koa-static');

const app = koa();
// app.use(express.static('dist/client/'));
app.use(serve('dist/client/', {}));
app.use(handler);

app.listen(3001);
