/**
 * Keep RCT_EXPORT_* visible for react-native-firebase under
 * use_frameworks! :linkage => :static on RN 0.84+.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'node_modules', '@react-native-firebase')
const files = [
  path.join(root, 'auth', 'ios', 'RNFBAuth', 'RNFBAuthModule.m'),
  path.join(root, 'storage', 'ios', 'RNFBStorage', 'RNFBStorageModule.m'),
  path.join(root, 'app', 'ios', 'RNFBApp', 'RNFBAppModule.m'),
]

const needle = '#import <React/RCTBridgeModule.h>\n'

for (const file of files) {
  if (!fs.existsSync(file)) continue
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('#import <React/RCTBridgeModule.h>')) continue
  src = src.replace('#import <Firebase/Firebase.h>', `${needle}#import <Firebase/Firebase.h>`)
  fs.writeFileSync(file, src)
}
