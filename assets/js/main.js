import * as fetch from "./modules/fetch.js"
import * as listener from "./modules/listener.js"
import * as storage from "./modules/storage.js"
import * as repo from "./modules/repo.js"
import { app, home, icons } from "./modules/ui.js"

const setCredentials = (user, repo, token, remember) => {
	localStorage.setItem("user", user)
	localStorage.setItem("repo", repo)
	localStorage.setItem("pat", token)
	localStorage.setItem("autologin", remember)
}

const saveFile = async () => {
	const path = localStorage.getItem("path")
	const data = await repo.putContents(path)

	if (!data.error) {

	} else {
		console.log(data.status, data.error)
	}
}

const loadRepo = async () => {
	const data = await repo.get()

	if (!data.error) {
		localStorage.setItem("path", "/")
		home.changeUI()
		app.reset()
		app.load.folder(data)
		listener.home()
		listener.tree()
	} else {
		home.showError(data.error)
	}
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
	if (theme) app.changeTheme(theme)

	const selector = document.querySelector("#theme-selector")
	selector.addEventListener("click", () => {
		if (selector.textContent === icons.bright) {
			app.changeTheme("dark")
		} else {
			app.changeTheme("light")
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
			loadRepo()
		}
	})

	const autologin = localStorage.getItem("autologin")
	if (autologin && autologin === "on") loadRepo()

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
		if(saveFile()) {

		} else {}
	})

	const textarea = document.querySelector("textarea")
	textarea.addEventListener("input", () => {
		if (saveButton.disabled == true) saveButton.disabled = false
	})
})