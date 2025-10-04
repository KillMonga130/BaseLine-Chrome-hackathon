module.exports = [
  {
    // Apply to JS and CSS files so our example files are covered
    files: ['**/*.js', '**/*.css'],
    plugins: {
      baseline: require('./eslint-plugin-baseline/lib')
    },
    rules: {
      'baseline/use-baseline': 'warn'
    }
  }
];
module.exports = [
  {
    files: ['**/*.css'],
    plugins: {
      baseline: require('./eslint-plugin-baseline/lib')
    },
    rules: {
      'baseline/use-baseline': 'warn'
    }
  }
];
