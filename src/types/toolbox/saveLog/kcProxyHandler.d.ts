import SaveFiles from '@src/extensions/toolbox/saveLog-tools/saveFiles.js'

export interface KcProxyHandler<T> extends ProxyHandler<T> {
  main: SaveFiles
}
