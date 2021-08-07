# 基于Electron和element UI的代码查重软件
## 一、项目简介

本项目是基于Electron和element UI开发的一款代码查重软件，其内核使用了开源软件[SIM](https://dickgrune.com/Programs/similarity_tester/)（SIM是大佬[Dick Grune](https://dickgrune.com/)开发的一款代码查重软件）

本项目为SIM添加了GUI界面，简化了操作，**练手之作，技术含量不高，如有错漏，请大佬们指出**。

## 二、代码使用方式

```shell
# nodeJS版本 v12.19.0
# electron版本 v10.1.4

# Clone this repository
git clone https://github.com/ZxfBugProgrammer/Electron-SIMGUI.git
# Go into the repository
cd Electron-SIMGUI
# Install dependencies
npm install
# Run the app
npm start
```

## 三、打包应用方式

修改js/index.js（js文件夹下的index.js文件）中的第342-345行，取消342行的注释，注释345行。修改后的部分代码如下：

```javascript
//开发调试时调用SIM的命令
//let commandStr = '"' + path.join(__dirname, '/src/SIM/sim_' + chooseCodeData.value + '.exe') + '" ' + simArgs
                
//打包应用时调用SIM的命令
let commandStr = '"' + path.join(__dirname, '../SIM/sim_' + chooseCodeData.value + '.exe') + '" ' + simArgs
```

使用如下命令打包应用(仅限打包win32平台应用)

```shell
# 全局安装electron-packager
npm install electron-packager -g
# 运行打包命令 应用生成在./out 中
npm run build-electron
```

可在release页面下载打包好的win32平台应用：[下载链接](https://github.com/ZxfBugProgrammer/Electron-SIMGUI/releases)

## 四、软件预览图

![预览图1](./Preview-Image/1.png)

![预览图2](./Preview-Image/2.png)

![预览图3](./Preview-Image/3.png)

![预览图4](./Preview-Image/4.png)

![预览图5](./Preview-Image/5.png)

## 五、联系方式

如有问题可联系邮箱  1150123839@qq.com