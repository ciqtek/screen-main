import { screen, BrowserWindow, ipcMain } from 'electron'

export enum DPEnum {
  DP_CHANGED = 'screen-dp-changed',
  UPDATE_DP = 'screen-update-dp'
}

type ScaleDPMsg = {
  width: number,
  height: number,
  ratio: number,
  originScale: number,
}
interface DpOptions {
  initialWidth: number,
  initialHeight: number,
  timeOut: number // ms
  watchValue: Array<'bounds' | 'workArea' | 'scaleFactor' | 'rotation'>,
  mainCb?: (scaleDPMsg?: ScaleDPMsg & { preDP: ScaleDPMsg }) => void,
  callRender: boolean
}
const defaultOptions: DpOptions = {
  initialWidth: 1600,
  initialHeight: 900,
  timeOut: 1000,
  watchValue: ['bounds', 'workArea', 'scaleFactor', 'rotation'],
  callRender: false
}

export class ZoomFactor {
  win: BrowserWindow
  dpOptions: DpOptions
  private timer: NodeJS.Timeout
  private changeKeyCache: Set<string>
  private preDP: ScaleDPMsg
  constructor(win: BrowserWindow, dpOptions?: DpOptions) {
    this.changeKeyCache = new Set()
    this.win = win
    this.dpOptions = Object.assign({}, defaultOptions, dpOptions || {})
    this.watchScreenDP()
  }

  private getDisplayMatching() {
    return screen.getDisplayMatching(this.win.getBounds())
  }
  public checkDP(): ScaleDPMsg & { preDP: ScaleDPMsg } {
    const { scaleFactor, workAreaSize } = this.getDisplayMatching()
    const { width, height } = workAreaSize
    const { initialWidth, initialHeight } = this.dpOptions
    let ws = scaleFactor
    let hs = scaleFactor
    if (width < initialWidth) {
      ws = width / initialWidth
    }
    if (height < initialHeight) {
      hs = height / initialHeight
    }
    const res = {
      width,
      height,
      originScale: scaleFactor,
      ratio: ws > hs ? hs : ws
    }
    const preDP = this.preDP ? this.preDP : res
    this.preDP = res
    return {
      preDP,
      ...this.preDP
    }
  }


  private watchScreenDP() {
    const { timeOut, watchValue, callRender } = this.dpOptions
    ipcMain.handle('render-process-ready', () => {
      return this.checkDP()
    })
    screen.on('display-metrics-changed', (event, display, changedMetrics) => {
      const { id } = this.getDisplayMatching()
      if (id === display.id) {
        if (this.timer) {
          changedMetrics.forEach(item => this.changeKeyCache.add(item))
          return
        }
        this.timer = setTimeout(() => {
          if (!changedMetrics.some((item: any) => watchValue.includes(item))) return
          this.timer = null
          const dpMsg = this.checkDP()
          if (callRender) {
            this.win.webContents.send(DPEnum.DP_CHANGED, dpMsg)
          }
          if (this.dpOptions.mainCb) {
            this.dpOptions.mainCb(dpMsg)
          }
        }, timeOut)
      }
    })
  }

}