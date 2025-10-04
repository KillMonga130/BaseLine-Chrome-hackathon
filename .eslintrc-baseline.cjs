module.exports = [
  {
    files: ['**/*.css', '**/*.js'],
    plugins: {
      baseline: require('./eslint-plugin-baseline/lib/index')
    },
    rules: {
      'baseline/use-baseline': 'warn'
    }
  }
];
