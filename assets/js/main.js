import { CodeJar } from "../vendor/codejar.js"
import hljs from "../vendor/highlight.min.js"

const fetchData = async (url, token) => {
	const headers = new Headers({
		"Accept": "application/vnd.github+json",
		"Authorization": `Bearer ${token}`
	})
	const response = await fetch(url, {method: "GET", headers})

	if (response.ok) {
		return await response.json()
	} else {
		return {error: "Unable to fetch API"}
	}
}

const changeInterface = (repo) => {
	const app = document.querySelector("#app")
	const intro = document.querySelector("#intro")
	const header = document.querySelector("header h1")

	app.style.display = "block"
	intro.style.display = "none"
	header.innerText = repo
}

const cleanItems = () => {
	const tree = document.querySelector(".tree ul")
	const editor = document.querySelector(".editor")
	tree.innerHTML = ""
	editor.textContent = ""
	editor.className = "editor"
}

const storeCredentials = (user, repo, token, remember) => {
	localStorage.setItem("user", user)
	localStorage.setItem("repo", repo)
	localStorage.setItem("pat", token)
	localStorage.setItem("auto-login", remember)
}

const getCredentials = () => {
	return {
		user: localStorage.getItem("user"),
		repo: localStorage.getItem("repo"),
		token: localStorage.getItem("pat")
	}
}

const addHomeListener = () => {
	const home = document.querySelector("#home-dir")
	const credentials = getCredentials()

	home.addEventListener("click", async () => {
		const data = await fetchData(
			`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/`, credentials.token
		)
		if (!data.error) {
			cleanItems()
			parseFolder(data)
		}
	})
}

const addTreeListener = () => {
	const anchors = document.querySelectorAll(".tree a")
	const credentials = getCredentials()

	anchors.forEach(a => {
		a.addEventListener("click", async () => {
			const type = a.getAttribute("data-type")
			const path = a.getAttribute("data-name")
			const data = await fetchData(
				`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/${path}`, credentials.token
			)
			if (!data.error) {
				cleanItems()
				if (data.length > 0){
					parseFolder(data)
				} else {
					parseFile(data)
				}
			}
		})
	})
}

const addToTree = (names, type) => {
	const icon = type == "dir" ? "e92f" : "e926"
	const tree = document.querySelector(".tree ul")
	names.forEach(name => {
		tree.innerHTML += `<li><span class="icon">&#x${icon};</span><a href="#" data-type="${type}" data-name="${name}">${name}</a></li>`
	})
}

const parseFile = (file) => {
	const editor = document.querySelector(".editor")
	const text = atob(file.content)
	editor.textContent = text
	let jar = CodeJar(editor, hljs.highlightElement)
	editor.style.display = "block"
	console.log(jar.toString())
}

const parseFolder = (folder) => {
	const dirs = [], files = []
	folder.forEach(object => {
		if (object.type == "dir") dirs.push(object.name)
		if (object.type == "file") files.push(object.name)
	})

	addToTree(dirs, "dir")
	addToTree(files, "file")
	addTreeListener()
}

const getUserRepo = async () => {
	const user = document.querySelector("input[name='user']").value
	const repo = document.querySelector("input[name='repo']").value
	const token = document.querySelector("input[name='token']").value
	const remember = document.querySelector("input[name='remember']").value
	storeCredentials(user, repo, token, remember)

	const data = await fetchData(
		`https://api.github.com/repos/${user}/${repo}/contents/`, token
		)
	if (!data.error) {
		changeInterface(repo)
		addHomeListener()
		cleanItems()
		parseFolder(data)
	}
}

const validateInput = (input) => {
	const inputs = document.querySelectorAll("#intro form input")
	for (let i = 0; i < inputs.length; i++) {
		const input = inputs[i];
		const state = input.validity
		if (state.valueMissing) return input
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

	const link = document.head.querySelector("link[href*='vendor']")
	console.log(link)
	link.href = `assets/vendor/highlight/themes/atom-one-${name}.min.css`

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

window.addEventListener("DOMContentLoaded", () => {
	const theme = localStorage.getItem("theme")
	if (theme) {
		updateTheme(theme)
	}

	const selector = document.querySelector("#theme-selector")
	selector.addEventListener("click", () => {
		const text = selector.textContent
		if (text === icons.bright) updateTheme("dark")
		if (text === icons.dark) updateTheme("light")
	})

	const login = document.querySelector("#intro form button")
	login.addEventListener("click", (event) => {
		event.preventDefault()
		const valueMissing = validateInput()
		if (valueMissing) {
			valueMissing.reportValidity()
		} else {
			getUserRepo()
		}
	})
})