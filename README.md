🚄 使用教程
# screen-main
用来解决软件在不同大小和分辨率的自适应问题



安装：
```
 - npm i screen-main --save
```

使用：

**>main process**


在窗口创建完成之后使用
```
//mainWindow = new BrowserWindow()
 const zoomF = new ZoomFactor(mainWindow, {
    callRender: true,
    initialWidth: 1600,
    timeOut: 2000
  })
  //doSomething
```
**>render process**

```
//渲染进程准备好后从主进程获取当前分辨率信息
ipcRenderer.invoke('render-process-ready').then((res：ScaleDPMsg & { preDP: ScaleDPMsg }) => {
  //doSomething
})
//当分辨率改变后会通过这个时间通知渲染进程
ipcRenderer.on('screen-dp-changed', (_e, args：ScaleDPMsg & { preDP: ScaleDPMsg }) => {
  //doSomething
})
```
📖 文档
### Class: ZoomFactor
```
class ZoomFactor {
    constructor(win: Electron.BrowserWindow, dpOptions?: DpOptions)
    // 检测分辨率适应情况
    checkDP: () => ScaleDPMsg & { preDP: ScaleDPMsg }
 }
```

### interface 
```
  interface DpOptions {
    //设计图初始宽度
    initialWidth: number,
    //设计图初始高度
    initialHeight: number,
    // 分辨率改变后多久触发回调，当多次触发回调可以将这个属性设置大一点
    timeOut: number,
    // 监听那些属性的改变
    watchValue: Array<'bounds' | 'workArea' | 'scaleFactor' | 'rotation'>,
    // 改变后触发主进程中传入的回调
    mainCb?: (scaleDPMsg?: ScaleDPMsg & { preDP: ScaleDPMsg }) => void,
    //是否通知渲染进程
    callRender: boolean
  }
  
  type ScaleDPMsg = {
    // 改变后的工作宽度
    width: number,
    // 改变后的工作高度
    height: number,
    // 比列，在操作窗口大小时都需要乘上这个比例
    ratio: number,
    // 原始缩放比例
    originScale: number
  }
  // 记录着上一次的分辨率信息
  type preDP = ScaleDPMsg 
```