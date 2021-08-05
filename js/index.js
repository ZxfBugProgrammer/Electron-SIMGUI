var path = require("path");
var fs = require("fs");
const { dialog } = require('electron').remote;
var child_process = require('child_process');
var os = require('os');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

Vue.directive('highlight', function (el) {
    let blocks = el.querySelectorAll('pre code');
    blocks.forEach((block) => {
        hljs.highlightBlock(block)
    })
})

var stepBarData = {
    active: 0,
    isShow: true,
}

var stepBarVue = new Vue({
    el: '#stepBar',
    data: stepBarData
})

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds()
        // millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

var fileTableData = {
    tableData: [],
    isShow: false,
}

var boxCardData = {
    isShow: true,
}

var chooseFilePathData = {
    filePath: '',
    disabled: false,
    isShow: true
}

var chooseFilePathVue = new Vue({
    el: '#chooseFilePath',
    data: chooseFilePathData,
    methods: {
        choose() {
            dialog.showOpenDialog({
                title: '请选择文件夹',
                properties: ['openDirectory']
            }).then(result => {
                if (!result.canceled) {
                    var re = new RegExp('^[^\u4e00-\u9fa5]+$');
                    if (re.test(result.filePaths[0])) {
                        if (!fs.existsSync(result.filePaths[0])) {
                            this.$message({
                                message: '文件夹不存在，请重新选择',
                                type: 'error',
                                showClose: true,
                                duration: 2000
                            });
                            return;
                        }

                        this.filePath = result.filePaths[0];

                        let allFileSize = 0;
                        fileTableData.tableData = [];
                        fs.readdirSync(result.filePaths[0]).forEach(function (item, index) {
                            let fPath = path.join(result.filePaths[0], item);
                            let stat = fs.statSync(fPath);
                            if (stat.isFile() === true) {
                                let tempObj = {};
                                tempObj.fileName = item;
                                tempObj.filePath = fPath;
                                tempObj.size = stat.size;
                                tempObj.mtime = stat.mtime.format("yyyy-MM-dd hh:mm:ss");
                                fileTableData.tableData.push(tempObj);
                                allFileSize += tempObj.size;
                            }
                        });

                        allFileSize /= (1024 * 1024)
                        if (allFileSize > 1024) {
                            this.$message({
                                message: '请选择包含文件小于1G的文件夹',
                                type: 'error',
                                showClose: true,
                                duration: 2000
                            });
                            return;
                        }

                        let message = '';
                        if (allFileSize >= 0.001) {
                            message = '共选择 ' + fileTableData.tableData.length + '个文件，总大小为 ' + allFileSize.toFixed(3) + ' MB';
                        } else {
                            message = '选择文件夹成功，' + '共选择 ' + fileTableData.tableData.length + '个文件';
                        }
                        this.$message({
                            message: message,
                            type: 'success',
                            showClose: true,
                            duration: 2000
                        });

                        //console.log(fileList);
                        fileTableData.isShow = true;
                        boxCardData.isShow = false;
                    } else {
                        this.filePath = "请选择文件夹(纯英文路径)";
                        this.$message({
                            message: '请选择纯英文路径的文件夹',
                            type: 'error',
                            showClose: true,
                            duration: 2000
                        });
                    }
                } else {
                    this.$message({
                        message: '取消选择',
                        showClose: true,
                        duration: 2000
                    });
                }
            })
        }
    }
})

var fileTableVue = new Vue({
    el: '#fileTable',
    data: fileTableData,
    methods: {
        deleteRow(index, rows) {
            rows.splice(index, 1);
        }
    },
})

var boxCardVue = new Vue({
    el: '#boxCard',
    data: boxCardData,
})

var chooseCodeData = {
    options: [{
        value: '8086',
        label: '8086汇编'
    }, {
        value: 'C',
        label: 'C'
    }, {
        value: 'C++',
        label: 'C++'
    }, {
        value: 'Java',
        label: 'Java'
    }, {
        value: 'lisp',
        label: 'Lisp'
    }, {
        value: 'm2',
        label: 'Modula-2'
    }, {
        value: 'mira',
        label: 'Miranda'
    }, {
        value: 'pasc',
        label: 'Pascal'
    }, {
        value: 'Text',
        label: '文本'
    }],
    value: '',
    isShow: false,
    limitValue: 50,
}

var chooseCodeVue = new Vue({
    el: '#chooseCode',
    data: chooseCodeData,
    methods: {
        handlDelta(e) {
            return e + '%'
        },
    }
})

var resTableData = {
    tableData: [],
    isShow: false,
    currentRow: {},
}

var resTableVue = new Vue({
    el: "#resTable",
    data: resTableData,
    methods: {
        clickRow(row, column, event) {
            //console.log(row)
            stepBarData.isShow = false;
            //chooseFilePathData.isShow = false;
            resTableData.isShow = false;
            codeShowData.isShow = true;
            doneStep1Data.isShow = false;
            resTableData.currentRow = row;

            //console.log(row)
            let fileAStr = fs.readFileSync(rawNameToNewPath[row.fileAName], {
                encoding: 'utf8',
            })
            let fileBStr = fs.readFileSync(rawNameToNewPath[row.fileBName], {
                encoding: 'utf8',
            })
            //console.log(fileAStr)
            //console.log(fileBStr)
            codeShowData.fileAStr = fileAStr;
            codeShowData.fileBStr = fileBStr;
            codeShowData.megbtn1text = row.fileAName + ' 与 ' + row.fileBName + ' 相似度为 ' + row.similarValue;
        }
    }
})

var codeShowData = {
    isShow: false,
    fileAStr: '',
    fileBStr: '',
    megbtn1text: '',
    isCpp: false,
    isJava: false,
}

var codeShowVue = new Vue({
    el: '#codeShow',
    data: codeShowData,
    methods: {
        goBack() {
            stepBarData.isShow = true;
            //chooseFilePathData.isShow = true;
            resTableData.isShow = true;
            codeShowData.isShow = false;
            doneStep1Data.isShow = true;
        }
    }
})

var doneStep1Data = {
    fullscreenLoading: false,
    isShow: true,
    buttonText: '下一步',
}

var rawNameToNewName = {}
var newNameToRawName = {}
var newNameToNewPath = {}
var rawNameToNewPath = {}

var doneStep1Vue = new Vue({
    el: '#doneStep1',
    data: doneStep1Data,
    methods: {
        next() {
            if (stepBarVue.active == 0) {
                if (!fileTableData.isShow) {
                    this.$message({
                        message: '请选择文件夹后再点击下一步',
                        type: 'error',
                        showClose: true,
                        duration: 2000
                    });
                    return
                }
            }
            if (stepBarVue.active == 1) {
                if (chooseCodeData.value == '') {
                    this.$message({
                        message: '请设置查重语言后再点击下一步',
                        type: 'error',
                        showClose: true,
                        duration: 2000
                    });
                    return
                }

                codeShowData.isCpp = false;
                codeShowData.isJava = false;
                if (chooseCodeData.value == 'C++' || chooseCodeData.value == 'C') {
                    codeShowData.isCpp = true;
                }
                if (chooseCodeData.value == 'Java') {
                    codeShowData.isJava = true;
                }

                doneStep1Data.fullscreenLoading = true;
                let tempFilePath = fs.mkdtempSync(path.join(os.tmpdir(), 'SIMGUI-'));
                //console.log(tempFilePath)
                let cnt = 0;
                let newFileNameArray = []

                rawNameToNewName = {}
                newNameToRawName = {}
                newNameToNewPath = {}
                rawNameToNewPath = {}

                fileTableData.tableData.forEach((tempObj) => {
                    fs.copyFileSync(tempObj.filePath, path.join(tempFilePath, cnt + '.simgui'));
                    newFileNameArray.push(cnt + '.simgui');
                    rawNameToNewName[tempObj.fileName] = cnt + '.simgui';
                    newNameToRawName[cnt + '.simgui'] = tempObj.fileName;
                    newNameToNewPath[cnt + '.simgui'] = path.join(tempFilePath, cnt + '.simgui');
                    rawNameToNewPath[tempObj.fileName] = path.join(tempFilePath, cnt + '.simgui');
                    cnt++;
                })

                simArgs = '-pt ' + chooseCodeData.limitValue
                newFileNameArray.forEach((tempObj) => {
                    simArgs += (' ' + tempObj);
                })
                //console.log(simArgs);

                //开发调试时调用SIM的命令
                let commandStr = '"' + path.join(__dirname, '/src/SIM/sim_' + chooseCodeData.value + '.exe') + '" ' + simArgs
                
                //打包应用时调用SIM的命令
                //let commandStr = '"' + path.join(__dirname, '../SIM/sim_' + chooseCodeData.value + '.exe') + '" ' + simArgs
                
                let res = child_process.execSync(commandStr, {
                    maxBuffer: 1024 * 1024 * 1024 * 1024,
                    windowsHide: true,
                    cwd: tempFilePath
                }).toString()
                //console.log(res)
                let resArray = res.split('\n');
                //console.log(resArray)
                let startIndex = resArray.indexOf('\r') + 1;
                //console.log(startIndex)
                resTableData.tableData = []
                while (startIndex < resArray.length - 1) {
                    let tempObj = {}
                    let tempStrArray = resArray[startIndex].split(' ');
                    tempObj.fileAName = newNameToRawName[tempStrArray[0]];
                    tempObj.similarValue = tempStrArray[3] + '%';
                    tempObj.fileBName = newNameToRawName[tempStrArray[6]];
                    resTableData.tableData.push(tempObj);
                    startIndex++;
                }

                doneStep1Data.fullscreenLoading = false;
            }
            if (stepBarVue.active++ >= 2) stepBarVue.active = 0;
            if (stepBarVue.active == 0) {
                boxCardData.isShow = true;
                fileTableData.isShow = false;
                resTableData.isShow = false;
                chooseFilePathData.disabled = false;
                chooseFilePathData.filePath = '';
                chooseFilePathData.isShow = true;
                doneStep1Data.buttonText = '下一步';
            }
            if (stepBarVue.active == 1) {
                chooseFilePathData.disabled = true;
                boxCardData.isShow = false;
                fileTableData.isShow = false;
                chooseCodeVue.isShow = true;
                doneStep1Data.buttonText = '开始查重';
            }
            if (stepBarVue.active == 2) {
                doneStep1Data.buttonText = '返回第一步';
                chooseCodeVue.isShow = false;
                chooseFilePathData.isShow = false;
                resTableData.isShow = true;
            }
        }
    }
})