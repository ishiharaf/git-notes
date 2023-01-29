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

const gitHubLogin = async () => {
	const user = document.querySelector("input[name='user']").value
	const repository = document.querySelector("input[name='repository']").value
	const token = document.querySelector("input[name='token']").value

	console.log(await fetchData(`https://api.github.com/repos/${user}/${repository}/contents/`, token))
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
			// gitHubLogin()
		}
	})
})