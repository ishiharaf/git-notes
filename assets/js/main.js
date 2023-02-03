const fetchData = async (url, token, method = "GET", body = null) => {
	const headers = new Headers({
		"Accept": "application/vnd.github+json",
		"Authorization": `Bearer ${token}`
	})
	console.log(method, body)
	const response = await fetch(url, {
		method: method,
		headers,
		body: body
	})
	if (response.ok) {
		return await response.json()
	} else {
		return {
			status: response.status,
			error: response.statusText
		}
	}
}

const showLoginError = (status, error) => {
	document.querySelector("#home .error small").innerText =
		`${status} - ${error}`
}

const changeInterface = (repo) => {
	document.querySelector("#app").style.display = "block"
	document.querySelector("#home").style.display = "none"
	document.querySelector("#home .error small").innerText = ""
	document.querySelector("header h1").innerText = repo
}

const cleanItems = () => {
	document.querySelector(".editor").style.display = "none"
	document.querySelector(".tree ul").innerHTML = ""
	document.querySelector("textarea").value = ""
	document.querySelector("#download-button").disabled = true
	document.querySelector("#delete-button").disabled = true
	document.querySelector("#save-button").disabled = true
}

const getCredentials = () => {
	return {
		user: localStorage.getItem("user"),
		repo: localStorage.getItem("repo"),
		token: localStorage.getItem("pat")
	}
}

const setCredentials = (user, repo, token, remember) => {
	localStorage.setItem("user", user)
	localStorage.setItem("repo", repo)
	localStorage.setItem("pat", token)
	localStorage.setItem("autologin", remember)
}

const addHomeListener = () => {
	const home = document.querySelector("#home-dir"),
		  credentials = getCredentials()

	home.addEventListener("click", async () => {
		localStorage.setItem("path", "/")
		const data = await fetchData(
			`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/`,
			credentials.token
		)
		if (!data.error) {
			cleanItems()
			loadFolder(data)
		}
	})
}

const addTreeListener = () => {
	const anchors = document.querySelectorAll(".tree a"),
		  credentials = getCredentials()

	anchors.forEach(a => {
		a.addEventListener("click", async () => {
			const targetPath = a.getAttribute("data-name"),
				  currentPath = localStorage.getItem("path")
			const path = currentPath == "/"
				? targetPath
				: `${currentPath}/${targetPath}`

			localStorage.setItem("path", path)
			const data = await fetchData(
					`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/${path}`,
					credentials.token
				  )
				  console.log(data)
			if (!data.error) {
				cleanItems()
				if (data.length > 0){
					loadFolder(data)
				} else {
					localStorage.setItem("sha", data.sha)
					loadFile(data)
				}
			}
		})
	})
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

	addToTree(dirs, "dir"), addToTree(files, "file")
	addTreeListener()
}

const getCommitMessage = () => {
	const path = localStorage.getItem("path")
	return localStorage.getItem("message") ?? `Update ${path}`
}

const getCommitBody = () => {
	const content = btoa(document.querySelector("textarea").value)
	const path = localStorage.getItem("path"),
		  sha = localStorage.getItem("sha"),
		  name = localStorage.getItem("name") ?? "Felipe Ishihara",
		  email = localStorage.getItem("email") ?? "k.hishihara@gmail.com",
		  message = getCommitMessage()

	return JSON.stringify({
		message, committer: { name, email }, content, sha
	})
}

const saveFile = async () => {
	const credentials = getCredentials(),
		  path = localStorage.getItem("path")

	const post = await fetchData(
		`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/${path}`,
		credentials.token,
		"PUT",
		getCommitBody()
	)
	console.log(post)
}

const getUserRepo = async () => {
	const credentials = getCredentials()
	const data = await fetchData(
		`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/`,
		credentials.token
	)
	if (!data.error) {
		localStorage.setItem("path", "/")
		changeInterface(credentials.repo)
		addHomeListener()
		cleanItems()
		loadFolder(data)
	} else {
		showLoginError(data.status, data.error)
	}
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

const icons = {
	bright: "\ue9d4",
	dark: "\ue9d6"
}
const updateTheme = (name) => {
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

const validateForm = () => {
	const inputs = document.querySelectorAll("#home form input")

	for (let i = 0; i < inputs.length; i++) {
		if (!inputs[i].checkValidity()) return inputs[i].reportValidity()
	}
	return true
}

window.addEventListener("DOMContentLoaded", () => {
	const theme = localStorage.getItem("theme")
	if (theme) updateTheme(theme)

	const selector = document.querySelector("#theme-selector")
	selector.addEventListener("click", () => {
		if (selector.textContent === icons.bright) {
			updateTheme("dark")
		} else {
			updateTheme("light")
		}
	})

	const login = document.querySelector("#login-button")
	login.addEventListener("click", (event) => {
		event.preventDefault()
		if (validateForm()) {
			const user = document.querySelector("input[name='user']").value,
				  repo = document.querySelector("input[name='repo']").value,
				  token = document.querySelector("input[name='token']").value,
				  remember = document.querySelector("input[name='remember']").value

			setCredentials(user, repo, token, remember)
			getUserRepo()
		}
	})

	const autologin = localStorage.getItem("autologin")
	if (autologin && autologin === "on") getUserRepo()

	const logout = document.querySelector("#logout-button")
	logout.addEventListener("click", () => {
		document.querySelector("#logout-modal").showModal()
	})

	const logoutConfirmation = document.querySelector("#confirm-logout-button")
	logoutConfirmation.addEventListener("click", () => {
		if (autologin) {
			localStorage.setItem("autologin", "off")
		}
		window.location.reload()
	})

	const saveButton = document.querySelector("#save-button")
	saveButton.addEventListener("click", () => {
		saveFile()
	})

	const textarea = document.querySelector("textarea")
	textarea.addEventListener("input", () => {
		if (saveButton.disabled == true) saveButton.disabled = false
	})
})