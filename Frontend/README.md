# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Caching Approach

This app uses browser localStorage to cache the task list for performance and offline support. On app load, it checks localStorage for cached tasks and uses them if available. When tasks are added or deleted, the cache is updated. This reduces redundant API calls and improves perceived speed.

- On load: If tasks are cached, use them; otherwise, fetch from the server and cache the result.
- On add/delete: Update both the server and the cache.
- Manual refresh: The UI provides a button to force-refresh the cache from the server.

## Vector Search Approach

The backend uses PostgreSQL with the pgvector extension to store vector embeddings of task descriptions. When a user searches, the backend generates an embedding for the query and finds the top 3 most similar tasks using vector distance. Embeddings are generated using the all-MiniLM-L6-v2 model from Sentence Transformers.

- Each task's description is embedded and stored as a vector.
- Search queries are embedded and compared to task vectors using the `<->` operator in SQL.
- The backend returns the most semantically similar tasks, not just exact matches.

## Offline Support

A service worker is included to enable offline access to cached tasks. If the network is unavailable, the app will still display the most recently cached tasks.

## Similarity Highlighting

When searching, the UI displays a similarity score for each result, visually highlighting the most relevant tasks.
