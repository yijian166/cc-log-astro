export * from './api';
export * from './post';

export const hashCode = (st) => {
  let hash = 0;
  for (let i = 0; i < st.length; i++) {
    let character = st.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
