const { build } = require('electron-builder');
const path = require('path');

console.log('🚀 Building CrtyXSpeed Network Optimizer...');

build({
  config: {
    appId: 'com.crtyxspeed.networkoptimizer',
    productName: 'CrtyXSpeed Network Optimizer',
    directories: {
      output: 'dist'
    },
    files: [
      'src/**/*',
      'node_modules/**/*',
      '!node_modules/.cache'
    ],
    win: {
      target: 'nsis',
      requestedExecutionLevel: 'requireAdministrator',
      icon: 'src/assets/icon.png'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      runAfterFinish: true
    }
  }
})
.then(() => {
  console.log('✅ Build completed successfully!');
  console.log('📦 Setup file created in dist/ folder');
  console.log('🔧 Ready for distribution with admin privileges');
})
.catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});