const icons = {
	bright: "\ue9d4",
	dark: "\ue9d6"
}

const colors = {
	white: "hsl(0, 0%, 100%)",
	offWhite: "hsl(0, 0%, 98%)",
	darkGray: "hsl(0, 0%, 30%)",
	gray: "hsl(0, 0%, 65%)",
	lightGray: "hsl(0, 0%, 85%)",
	black: "hsl(0, 0%, 15%)",
	red: "hsl(0, 100%, 65%)"
}

const changeTheme = (name) => {
	const selector = document.querySelector("#theme-selector")
	selector.textContent = name == "light" ? icons.bright : icons.dark

	const root = document.documentElement
	root.style.setProperty("--font-color", name == "light" ? colors.darkGray : colors.offWhite)
	root.style.setProperty("--bg-color", name == "light" ? colors.offWhite : colors.black)
	root.style.setProperty("--card-color", name == "light" ? colors.white : colors.darkGray)
	root.style.setProperty("--input-border-color", name == "light" ? colors.gray : colors.offWhite)
	root.style.setProperty("--input-focus-color", name == "light" ? colors.darkGray : colors.white)
	// root.style.setProperty("--input-invalid-color", name == "light" ? colors.offWhite : colors.black)
	root.style.setProperty("--code-font-color", name == "light" ? colors.black : colors.white)
	root.style.setProperty("--code-bg-color", name == "light" ? colors.lightGray : colors.darkGray)
	root.style.setProperty("--link-color", name == "light" ? colors.black : colors.white)

	localStorage.setItem("theme", name)
}

const showLoginError = (error) => {
	document.querySelector("#home .error small").innerText = `${error}`
}

const changeUI = () => {
	document.querySelector("#app").style.display = "block"
	document.querySelector("#home").style.display = "none"
	document.querySelector("#home .error small").innerText = ""
	// document.querySelector("header h1").innerText = repo
}

const resetApp = () => {
	document.querySelector(".editor").style.display = "none"
	document.querySelector(".tree ul").innerHTML = ""
	document.querySelector("textarea").value = ""
	document.querySelector("#download-button").disabled = true
	document.querySelector("#delete-button").disabled = true
	document.querySelector("#save-button").disabled = true
}

const addToTree = (names, type) => {
	const icon = type == "dir" ? "e92f" : "e926",
		  tree = document.querySelector(".tree ul")

	names.forEach(name => {
		tree.innerHTML +=
		`<li>
			<span class="icon">&#x${icon};</span>
			<a href="#" data-type="${type}" data-name="${name}">${name}</a>
		</li>`
	})
}

const loadFile = (file) => {
	document.querySelector("textarea").value = atob(file.content)
	document.querySelector(".editor").style.display = "block"
	document.querySelector("#download-button").disabled = false
	document.querySelector("#delete-button").disabled = false
}

const loadFolder = (folder) => {
	const dirs = [], files = []
	folder.forEach(object => {
		if (object.type == "dir") dirs.push(object.name)
		if (object.type == "file") files.push(object.name)
	})
	addToTree(dirs, "dir")
	addToTree(files, "file")
}

const home = {
	showError: showLoginError,
	changeUI: changeUI
}

const app = {
	reset: resetApp,
	changeTheme,
	load: {
		folder: loadFolder,
		file: loadFile
	}
}

export { app, home, icons }