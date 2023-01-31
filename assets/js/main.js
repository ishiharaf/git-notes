const fetchData = async (url, token) => {
	const headers = new Headers({
		"Accept": "application/vnd.github+json",
		"Authorization": `Bearer ${token}`
	})
	const response = await fetch(url, {method: "GET", headers})
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
}

const storeCredentials = (user, repo, token, remember) => {
	localStorage.setItem("user", user)
	localStorage.setItem("repo", repo)
	localStorage.setItem("pat", token)
	localStorage.setItem("autologin", remember)
}

const getCredentials = () => {
	return {
		user: localStorage.getItem("user"),
		repo: localStorage.getItem("repo"),
		token: localStorage.getItem("pat")
	}
}

const addHomeListener = () => {
	const home = document.querySelector("#home-dir"),
		  credentials = getCredentials()

	home.addEventListener("click", async () => {
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
			const type = a.getAttribute("data-type"),
				  path = a.getAttribute("data-name"),
				  data = await fetchData(
					`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/${path}`,
					credentials.token
				  )
			if (!data.error) {
				cleanItems()
				if (data.length > 0){
					loadFolder(data)
				} else {
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

const getUserRepo = async () => {
	const credentials = getCredentials()
	const data = await fetchData(
		`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/`,
		credentials.token
	)
	if (!data.error) {
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

			storeCredentials(user, repo, token, remember)
			getUserRepo()
		}
	})

	const autologin = localStorage.getItem("autologin")
	console.log(autologin)
	if (autologin && autologin === "on") getUserRepo()

	const logout = document.querySelector("#logout-button")
	logout.addEventListener("click", () => {
		document.querySelector("#logout-modal").showModal()
		// if (autologin) {
		// 	localStorage.setItem("autologin", "off")
		// }
	})

	const logoutConfirmation = document.querySelector("#confirm-logout-button")
	logoutConfirmation.addEventListener("click", () => {
		// document.querySelector("#logout-modal").close()
		if (autologin) {
			localStorage.setItem("autologin", "off")
		}
		window.location.reload()
	})
})