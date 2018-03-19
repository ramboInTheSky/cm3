module.exports = {
  plugins: {
    'postcss-omit-import-tilde': {},
    'postcss-import': {root: __dirname},
    'postcss-url': {},
    'postcss-custom-properties': {},
    'postcss-mixins': {},
    'postcss-each': {},
    'postcss-cssnext': {
      browsers: ['last 2 versions', '> 5%']
    },
    'postcss-discard-comments': {}
  }
};