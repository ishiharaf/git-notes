const getFormValue = (name) => {
	return document.querySelector(`input[name="${name}"]`).value
}

const setCredentials = () => {
	localStorage.setItem("name", getFormValue("name"))
	localStorage.setItem("email", getFormValue("email"))
	localStorage.setItem("user", getFormValue("user"))
	localStorage.setItem("repo", getFormValue("repo"))
	localStorage.setItem("token", getFormValue("token"))
	localStorage.setItem("autologin", getFormValue("autologin"))
}

const getCommitBody = () => {
	const content = btoa(document.querySelector("textarea").value)
	const path = localStorage.getItem("path"),
		  sha = localStorage.getItem("sha"),
		  name = localStorage.getItem("name"),
		  email = localStorage.getItem("email"),
		  message = `Update ${path}`

	return JSON.stringify({
		message, committer: { name, email }, content, sha
	})
}

const credentials = {
	user: localStorage.getItem("user"),
	repo: localStorage.getItem("repo"),
	token: localStorage.getItem("token")
}

const commitBody = getCommitBody()

export { credentials, commitBody, setCredentials }