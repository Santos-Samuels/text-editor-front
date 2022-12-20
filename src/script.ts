type ResponseData = {
  id: string;
  root: string;
  files: string[];
};

(function (_window, document) {
  const container = document?.getElementById("first-list");
  const Ajax = new XMLHttpRequest();
  const FILE_EXTENSION = ".spec.cy.ts";
  const pathsList = [];

  function request() {
    Ajax.open("GET", "./docs/mapper.json");
    Ajax.send();
    Ajax.addEventListener("readystatechange", () => {
      if (Ajax.readyState === 4) {
        const flows = JSON.parse(Ajax.responseText);
        flows.data.forEach((element: ResponseData) => {
          insertMenuItem(element?.root, element?.files);
        });
        checkItemsClicked();
      }
    });
  }

  const checkItemsClicked = () => {
    const ULs = document.querySelectorAll("ul");
    ULs.forEach((element: any) => {
      element.childNodes.forEach((li: any, index: number) => {
        li.addEventListener("click", () => {
          getMenuItemDocFile(li);

          const item = li.childNodes[1]?.firstChild.firstChild?.classList;
          if (li.firstChild.checked) {
            item?.add("open-image");
            if (
              element.childNodes[index + 1] &&
              element.childNodes[index + 1].tagName === "DIV"
            ) {
              element.childNodes[index + 1].classList.remove("close");
            }
          } else {
            item?.remove("open-image");
            if (
              element.childNodes[index + 1] &&
              element.childNodes[index + 1].tagName === "DIV"
            ) {
              element.childNodes[index + 1].classList.add("close");
            }
          }
        });
      });
    });
  };

  const insertMenuItem = (flowPath: string, files: string[]) => {
    const flowsList = flowPath.split("/");
    const namePath = [];
    const listPath = [];
    flowsList.forEach((flow, index) => {
      listPath.push(
        !!flowsList[index - 1] &&
          listPath.every((item) => item !== flowsList[index - 1])
          ? flowsList[index - 1]
          : flow
      );
      const joinedNames = listPath.join("/");
      namePath.push(joinedNames);

      const isChild =
        index !== 0 || pathsList.some((item) => item === joinedNames);

      const path = !!namePath[index - 1] ? namePath[index - 1] : joinedNames;

      if (pathsList.every((item) => item !== joinedNames)) {
        createMenuItem(flow, isChild, path);
      }

      const itemPath = listPath.join("/");
      if (pathsList.every((path) => path !== itemPath)) {
        pathsList.push(itemPath);
      }
    });
    files.forEach((file, index) => {
      if (file !== "index") {
        createMenuItem(
          file,
          true,
          namePath[namePath.length - 1],
          true,
          files.includes("index") && index
        );
      }
    });
  };

  const createChilds = (
    id: string,
    li: HTMLLIElement,
    value?: string,
    isFile?: boolean
  ) => {
    const div = document.getElementById(`child-${id}`);
    const childBox = document.createElement("div");
    const ul = document.createElement("ul");
    !isFile && childBox.setAttribute("class", "child close");
    !isFile && childBox.setAttribute("id", `child-${id}/${value}`);
    div.appendChild(ul);
    ul.appendChild(li);
    !isFile && ul.appendChild(childBox);
  };

  const createMenuItem = (
    value: string,
    isChild?: boolean,
    id?: string,
    isFile?: boolean,
    fileIndex?: number
  ) => {
    const box = document.createElement("li");
    const input = document.createElement("input");
    const radio = document.createElement("input");
    const label = document.createElement("label");
    const divArrow = document.createElement("div");
    const divFolder = document.createElement("div");
    const iconArrow = document.createElement("img");
    const mainIcon = document.createElement("img");
    const span = document.createElement("span");
    const childBox = document.createElement("div");

    input.setAttribute("id", `${id}${isChild ? "/" + value : ""}`);
    input.setAttribute("type", "checkbox");
    radio.setAttribute("id", `${id}${isChild ? "/" + value : ""}`);
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "file");
    fileIndex && radio.setAttribute("file-index", fileIndex.toString());
    label.setAttribute("for", `${id}${isChild ? "/" + value : ""}`);
    label.setAttribute("id", `label-${id}${isChild ? "/" + value : ""}`);
    childBox.setAttribute("class", "child close");
    childBox.setAttribute("id", `child-${id}`);
    span.textContent = `${value}${isFile ? FILE_EXTENSION : ""}`;
    iconArrow.src = "./icons/arrow.svg";
    mainIcon.src = !isFile ? "./icons/folder.svg" : "./icons/file.svg";

    const labelLenght = id.split("/").length * 10;

    const paddinSize = isChild ? labelLenght + 10 : labelLenght;

    !isFile ? box.appendChild(input) : box.appendChild(radio);
    box.appendChild(label);
    label.appendChild(divArrow);
    label.appendChild(divFolder);
    label.style.paddingLeft = `${paddinSize}px`;
    !isFile && divArrow.appendChild(iconArrow);
    divFolder.appendChild(mainIcon);
    label.appendChild(span);

    if (isChild) {
      createChilds(id, box, value, isFile);
    } else {
      container.appendChild(box);
      !isFile && container.appendChild(childBox);
    }
  };

  const getMenuItemDocFile = (element: any) => {
    const menuItem = element.childNodes[0];
    
    if (menuItem.name === "file") {
      setHeaderFileName(element.childNodes[1].childNodes[2].textContent);
      const filePath = menuItem.id.split("/");
      const scrollId = `${filePath[filePath.length - 2]}-${filePath[filePath.length - 1]}`

      if (menuItem.getAttribute("file-index")) {
        filePath.pop()
        filePath.push("index")
        getDoc(filePath.join("/"), Number(menuItem.getAttribute("file-index")), scrollId)
        return
      }

      getDoc(menuItem.id, 1, scrollId,);
    }
  };

  const getDoc = (path: string, fileIndex: number, divId?: string) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", `docs/${path}.txt`, true);
    xhttp.send();

    xhttp.onload = function () {
      const file = this.responseText;
      document.getElementById("page-content").innerHTML = file;

      divId && scrollToId(divId, fileIndex);
    };
  };

  const scrollToId = (id: string, fileIndex: number) => {
    if (fileIndex === 1) {
      window.scrollTo({ top: 0 })
      return
    }

    document.getElementById(id).scrollIntoView();
  };

  const setHeaderFileName = (fileName: string) => {
    document.getElementById(
      "current-file"
    ).innerHTML = fileName;
  };

  request();
})(window, document);
