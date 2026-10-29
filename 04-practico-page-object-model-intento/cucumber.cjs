module.exports = {
  default: {
    path: ['features/**/*.feature'],
    requireModule: ['tsx/cjs'],
    require: ['support/**/*.ts', 'steps/**/*.ts'],
    format: ['progress', 'html:reports/cucumber.html'],
    retry: 0
  }
};