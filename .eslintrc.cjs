module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended'],
  ignorePatterns: ['dist/', 'dist-vite/', 'dist-electron/', 'node_modules/'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off' // deliberate: tab is a shared reactive object reference, not a plain prop
  }
}
