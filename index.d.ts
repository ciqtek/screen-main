/// <reference types="electron" />
declare namespace ScreenMain {
  type ScaleDPMsg = {
    width: number,
    height: number,
    ratio: number,
    originScale: number
  }
  // import type { BrowserWindow, Display } from 'electron'
  interface DpOptions {
    initialWidth: number,
    initialHeight: number,
    timeOut: number // ms
    watchValue: Array<'bounds' | 'workArea' | 'scaleFactor' | 'rotation'>,
    mainCb?: (scaleDPMsg?: ScaleDPMsg & { preDP: ScaleDPMsg }) => void,
    callRender: boolean
  }
  enum DPEnum {
    DP_CHANGED = 'screen-dp-changed',
    UPDATE_DP = 'screen-update-dp'
  }
  type ChangeMsg = Pick<Electron.Display, 'bounds' | 'workArea' | 'rotation' | 'scaleFactor'>
  class ZoomFactor {
    constructor(win: Electron.BrowserWindow, dpOptions?: DpOptions)
    checkDP: () => ScaleDPMsg & { preDP: ScaleDPMsg }
  }
}

declare module 'screen-main' {
  export = ScreenMain
}



