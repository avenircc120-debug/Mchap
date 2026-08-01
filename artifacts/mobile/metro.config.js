const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude Metro from watching pnpm's ephemeral expo_tmp_* directories,
// which are created and immediately deleted during startup, causing
// ENOENT crashes in the FallbackWatcher.
const originalBlockList = config.resolver?.blockList ?? [];
const blockListArr = Array.isArray(originalBlockList)
  ? originalBlockList
  : [originalBlockList];

config.resolver = {
  ...config.resolver,
  blockList: [
    ...blockListArr,
    /node_modules[/\\]\.pnpm[/\\].*expo_tmp_[^/\\]+[/\\].*/,
  ],
};

// Also exclude those paths from watching
config.watchFolders = (config.watchFolders ?? []).filter(
  (f) => !f.includes('expo_tmp_'),
);

module.exports = config;
