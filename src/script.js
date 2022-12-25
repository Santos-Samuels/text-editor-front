

(function (_window) {
    var container = document.getElementById("first-list");
    var Ajax = new XMLHttpRequest();
    //var FILE_EXTENSION = ".spec.cy.ts";
    var FILE_EXTENSION = "";
    var pathsList = [];

    //const socket = io("http://localhost:3000");
    const socket2 = io("http://localhost:3000/namespace");

    // socket.on("connect", () => {
    //     console.log(`Conectado com id ${socket.id}`)
    // })
    
    socket2.on("connect", () => {
        console.log(`Conectado com id ${socket2.id}`)
    })

    socket2.on("send-folders", folders => {
        console.log(folders)
        initializeMenu(folders);
    })

    socket2.on("room-changed", content => {
        document.getElementById("page-content").value = content;
    })

    socket2.on("receive-text-changed", (text) =>{
        console.log(text)
        document.getElementById("page-content").value = text;
    })

    document.getElementById("page-content").oninput = function() { onKeyPressed() }

    function onKeyPressed(){
        const text = document.getElementById("page-content").value;
    
        console.log(text)

        socket2.emit("text-changed", text);
    }

    function initializeMenu(folders) {
        var flows = folders;
        flows.forEach(function (element) {
            insertMenuItem(element === null || element === void 0 ? void 0 : element.root, element === null || element === void 0 ? void 0 : element.files);
        });
        checkItemsClicked();
    }

    var checkItemsClicked = function () {
        var ULs = document.querySelectorAll("ul");
        ULs.forEach(function (element) {
            element.childNodes.forEach(function (li, index) {
                li.addEventListener("click", function () {
                    var _a, _b;
                    getMenuItemDocFile(li);
                    var item = (_b = (_a = li.childNodes[1]) === null || _a === void 0 ? void 0 : _a.firstChild.firstChild) === null || _b === void 0 ? void 0 : _b.classList;
                    if (li.firstChild.checked) {
                        item === null || item === void 0 ? void 0 : item.add("open-image");
                        if (element.childNodes[index + 1] &&
                            element.childNodes[index + 1].tagName === "DIV") {
                            element.childNodes[index + 1].classList.remove("close");
                        }
                    }
                    else {
                        item === null || item === void 0 ? void 0 : item.remove("open-image");
                        if (element.childNodes[index + 1] &&
                            element.childNodes[index + 1].tagName === "DIV") {
                            element.childNodes[index + 1].classList.add("close");
                        }
                    }
                });
            });
        });
    };
    var insertMenuItem = function (flowPath, files) {
        var flowsList = flowPath.split("/");
        var namePath = [];
        var listPath = [];
        flowsList.forEach(function (flow, index) {
            listPath.push(!!flowsList[index - 1] &&
                listPath.every(function (item) { return item !== flowsList[index - 1]; })
                ? flowsList[index - 1]
                : flow);
            var joinedNames = listPath.join("/");
            namePath.push(joinedNames);
            var isChild = index !== 0 || pathsList.some(function (item) { return item === joinedNames; });
            var path = !!namePath[index - 1] ? namePath[index - 1] : joinedNames;
            if (pathsList.every(function (item) { return item !== joinedNames; })) {
                createMenuItem(flow, isChild, path);
            }
            var itemPath = listPath.join("/");
            if (pathsList.every(function (path) { return path !== itemPath; })) {
                pathsList.push(itemPath);
            }
        });
        files.forEach(function (file, index) {
            if (file !== "index") {
                createMenuItem(file, true, namePath[namePath.length - 1], true, files.includes("index") && index);
            }
        });
    };
    var createChilds = function (id, li, value, isFile) {
        var div = document.getElementById("child-" + id);
        var childBox = document.createElement("div");
        var ul = document.createElement("ul");
        !isFile && childBox.setAttribute("class", "child close");
        !isFile && childBox.setAttribute("id", "child-" + id + "/" + value);
        div.appendChild(ul);
        ul.appendChild(li);
        !isFile && ul.appendChild(childBox);
    };
    var createMenuItem = function (value, isChild, id, isFile, fileIndex) {
        var box = document.createElement("li");
        var input = document.createElement("input");
        var radio = document.createElement("input");
        var label = document.createElement("label");
        var divArrow = document.createElement("div");
        var divFolder = document.createElement("div");
        var iconArrow = document.createElement("img");
        var mainIcon = document.createElement("img");
        var span = document.createElement("span");
        var childBox = document.createElement("div");
        input.setAttribute("id", "" + id + (isChild ? "/" + value : ""));
        input.setAttribute("type", "checkbox");
        radio.setAttribute("id", "" + id + (isChild ? "/" + value : ""));
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", "file");
        fileIndex && radio.setAttribute("file-index", fileIndex.toString());
        label.setAttribute("for", "" + id + (isChild ? "/" + value : ""));
        label.setAttribute("id", "label-" + id + (isChild ? "/" + value : ""));
        childBox.setAttribute("class", "child close");
        childBox.setAttribute("id", "child-" + id);
        span.textContent = "" + value + (isFile ? FILE_EXTENSION : "");
        iconArrow.src = "./icons/arrow.svg";
        mainIcon.src = !isFile ? "./icons/folder.svg" : "./icons/file.svg";
        var labelLenght = id.split("/").length * 10;
        var paddinSize = isChild ? labelLenght + 10 : labelLenght;
        !isFile ? box.appendChild(input) : box.appendChild(radio);
        box.appendChild(label);
        label.appendChild(divArrow);
        label.appendChild(divFolder);
        label.style.paddingLeft = paddinSize + "px";
        !isFile && divArrow.appendChild(iconArrow);
        divFolder.appendChild(mainIcon);
        label.appendChild(span);
        if (isChild) {
            createChilds(id, box, value, isFile);
        }
        else {
            container.appendChild(box);
            !isFile && container.appendChild(childBox);
        }
    };
    var getMenuItemDocFile = function (element) {
        var menuItem = element.childNodes[0];
        if (menuItem.name === "file") {
            setHeaderFileName(element.childNodes[1].childNodes[2].textContent);
            var filePath = menuItem.id.split("/");
            var scrollId = filePath[filePath.length - 2] + "-" + filePath[filePath.length - 1];
            if (menuItem.getAttribute("file-index")) {
                filePath.pop();
                filePath.push("index");
                getDoc(filePath.join("/"), Number(menuItem.getAttribute("file-index")), scrollId);
                return;
            }
            getDoc(menuItem.id, 1, scrollId);
        }
    };

    var getDoc = function (path, fileIndex, divId) {
        socket2.emit("change-room", path);
    };

    var scrollToId = function (id, fileIndex) {
        if (fileIndex === 1) {
            window.scrollTo({ top: 0 });
            return;
        }
        document.getElementById(id).scrollIntoView();
    };

    var setHeaderFileName = function (fileName) {
        document.getElementById("current-file").innerHTML = fileName;
    };
    //request();
})(window, document);
