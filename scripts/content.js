
var sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var wait_ele_by_xpath_in_documment = async (xpath, document, timeout) => {
    const count = 100;
    for (let i = 0; i < count; i++) {
        const element = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (element) {
            return element;
        }
        await sleep(timeout / count)
    }
    return null
}
var fetch_history = async () => {
    const url = document.location.href;
    const appId = new URL(url).searchParams.get('defaultProjectId');
    const currentUrl = encodeURIComponent(url);
    const his_url=`https://nav-cn-beijing.data.aliyun.com/header/user/history?appId=${appId}&projectSelect=true&currentUrl=${currentUrl}&em=&needProjectPermissionOnly=false`;
    console.log("fetch_history", his_url)
    return fetch(his_url, {
        "credentials": "include",
        "headers": { },
        "method": "GET",
        "mode": "cors"
      }).then(res => res.json());
}
var fetch_file = async (projectId, tenantId, fileId) => {
    return fetch(`https://ide2-cn-beijing.data.aliyun.com/rest/file?projectId=${projectId}&tenantId=${tenantId}&fileId=${fileId}&openType=0`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en,zh;q=0.9,en-US;q=0.8,und;q=0.7,zh-CN;q=0.6",
            "bx-v": "2.5.13",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Microsoft Edge\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-forwarded-for": "104.225.154.136",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(res => res.json());
}
var fetch_file_list = async (projectId, tenantId) => {
    return fetch(`https://ide2-cn-beijing.data.aliyun.com/rest/folder/module/list?projectId=${projectId}&tenantId=${tenantId}&useType=0&labelLevels=2&pageNum=1&pageSize=5000`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en,zh;q=0.9,en-US;q=0.8,und;q=0.7,zh-CN;q=0.6",
            "bx-v": "2.5.13",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Microsoft Edge\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(res => res.json());
}
var stop_sync = false;
var sync_directory = async () => {
    try {
        stop_sync = false;
        console.log("sync_directory")
        const rootDirHandle = await window.idbKeyval.get('cededir');
        if (!rootDirHandle) {
            console.log("sync_directory exit, rootDirHandle is null")
            return;
        }
        const options = {
            mode: 'readwrite',
        }
        if ((await rootDirHandle.queryPermission(options)) !== 'granted') {
            if ((await rootDirHandle.requestPermission(options)) !== 'granted') {
                console.log("sync_directory exit, requestPermission is not granted")
                return
            }
        }
        var button = document.getElementById('cede-button');
        button.innerHTML = 'syncing';
        console.log("sync_directory,find button", button)

        const history_resp = await fetch_history(); 
        console.log("sync_directory,history_resp", history_resp);
        const project_length = history_resp.data.projectList.length; 
        for(var i=0;i<project_length;i++){
            const project = history_resp.data.projectList[i];
            await sync_project(i,project_length,project.projectId,project.projectIdentifier,project.tenantId,rootDirHandle,button);
        }
    } finally {
        setTimeout(sync_directory, 1000 * 60 * 60)
    }
}
var sync_project = async (project_index,project_length,projectId,projectIdentifier,tenantId,rootDirHandle,button) => {
    const projectName = projectIdentifier;
    const dirHandle = await rootDirHandle.getDirectoryHandle(projectName, { create: true });
    var file_list_resp = await fetch_file_list(projectId, tenantId);
    console.log("sync_directory,file_list_resp", file_list_resp)
    {
        const jsonHandler = await dirHandle.getFileHandle(`file_list__.json`, { create: true });
        const writable = await jsonHandler.createWritable();
        await writable.write(JSON.stringify(file_list_resp));
        await writable.close();
    }

    const folders = {}
    for (const folder of file_list_resp.data.folderList) {
        folders[folder.folderId] = folder;
    }
    const loopParent = (folder, pid,parentIds) => {
        if (pid) {
            console.log("folderId:", folder.folderId, "parentIds:", parentIds) 
            const parent = folders[pid];
            if (parent) {
                parentIds.unshift(pid);
                loopParent(parent, parent.parentFolderItemId,parentIds);
            }
        }
    }
    for (const folder of Object.values(folders)) {
        folder.parentIds = folder.parentIds || [];
        loopParent(folder, folder.parentFolderItemId,folder.parentIds);
    }
    console.log("sync_directory,folders", folders)
    let total = file_list_resp.data.fileList.length;
    let remain = total;
    let newCount = 0;
    for (const file of file_list_resp.data.fileList) {
        button.innerHTML = `${project_index+1}/${project_length}:__:${newCount}/${remain}/${total}`;
        if (stop_sync) {
            console.log("sync_directory,stop");
            break;
        }
        console.log("sync_directory,file", file)
        let fileExtension = {
            "6": "sh", //Shell
            "10": "sql",// ODPS SQL
            "11": "txt", //ODPS MR
            "23": "json", //数据集成
            "24": "script.sql", //ODPS Script
            "99": "virtual.txt", //虚拟节点
            "221": "odps.py", //PyODPS 2
            "225": "odps-spark.py", //ODPS Spark
            "227": "emr-hive.txt", //EMR Hive
            "228": "emr-spark.txt",//EMR Spark 
            "229": "emr-spark.sql", //EMR Spark SQL
            "230": "emr-mr.txt", //EMR MR
            "239": "oss-check.txt", //OSS 对象检查
            "257": "emr.sh", //EMR Shell
            "258": "emr-spark.sh", //EMR Spark Shell
            "259": "emr-presto.txt", //EMR Presto
            "260": "emr-impala.txt", //#EMR Impala
            "900": "real-time-sync.txt", //实时同步
            "1089": "hg.txt", //Hologres 开发
            "1091": "hg.sql", //#Hologres SQL
            "1093": "hg.sql", //Hologres SQL
            "1100": "set.txt", //赋值节点
            "1221": "odps-3.py", //PyODPS 3
            "1000041": "jdbc.sql", //jdbc  
            "17": "func.json", //函数  
            "1320": "ftp-check.json", //函数  
        }[file.fileType + ""] || `.unknown_${file.fileType}.txt`;


        // { "10": "sql", "1093": ".hg.sql" } [file.fileType + ""] || `.unkown_${file.fileType}.txt`;
        let handler = dirHandle;
        let folder = folders[file.fileFolderId];
        if (folder) {
            console.log("sync_directory,fileId", file.fileId, folder.parentIds)
            for (const pid of folder.parentIds) {
                console.log("sync_directory,handler begin", handler, pid,folders[pid].folderItemName) 
                handler = await handler.getDirectoryHandle(folders[pid].folderItemName, { create: true });
                console.log("sync_directory,handler end", handler, pid,folders[pid].folderItemName) 
            }
            console.log("sync_directory,handler final", handler, folder.folderItemName)
            handler = await handler.getDirectoryHandle(folder.folderItemName, { create: true });
        }
        console.log("sync_directory,file write", file)

        const metaHandler = await rootDirHandle.getDirectoryHandle(`.meta`, { create: true });
        const jsonHandler = await metaHandler.getFileHandle(`.${file.fileId}`, { create: true });
        const jsonFile = await jsonHandler.getFile();
        const jsonStr = (await jsonFile.text()) || "{}";
        const json = JSON.parse(jsonStr);
        if (file.lastEditTime != json?.data?.file?.lastEditTime) {
            {
                const fileResp = await fetch_file(projectId, tenantId, file.fileId);
                const writable = await jsonHandler.createWritable();
                await writable.write(JSON.stringify(fileResp));
                await writable.close();
                handler.getFileHandle(`${file.fileName}.${fileExtension}`, { create: true }).then(fileHandle => {
                    fileHandle.createWritable().then(fileWriter => {
                        fileWriter.write(fileResp.data.file.content);
                        fileWriter.close();
                    })
                })
                newCount++;
            }
        }
        remain--;

    }

}
var main = async () => {
    var list_div = await wait_ele_by_xpath_in_documment('//div[@class="dataworks-header-icon-list"]', document, 1000 * 300)
    var button = list_div.appendChild(document.createElement('button'));
    button.id = "cede-button";
    button.innerHTML = 'sync'
    button.addEventListener('click', async () => {
        const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        await window.idbKeyval.set('cededir', dirHandle);
        stop_sync = true;
        setTimeout(sync_directory, 1000 * 10);
    });
    await sync_directory();
}

main()