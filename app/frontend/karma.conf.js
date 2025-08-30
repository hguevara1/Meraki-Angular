module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    client: {
      jasmine: {
        timeoutInterval: 100000
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--remote-debugging-port=9222'
        ]
      }
    },
    reporters: ['progress', 'kjhtml'],
    singleRun: true,
    autoWatch: false,
    restartOnFileChange: true,

    // Configuración para Angular
    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    // Configuraciones de timeout para CI (corregidas)
    captureTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    transports: ['polling'],
    pingTimeout: 10000

    // Niveles de logging
    logLevel: config.LOG_INFO
  });
};
