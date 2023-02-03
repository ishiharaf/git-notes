const commitMessage = () => {
	const path = localStorage.getItem("path")
	return localStorage.getItem("message") ?? `Update ${path}`
}

const commitBody = () => {
	const content = btoa(document.querySelector("textarea").value)
	const path = localStorage.getItem("path"),
		  sha = localStorage.getItem("sha"),
		  name = localStorage.getItem("name") ?? "Felipe Ishihara",
		  email = localStorage.getItem("email") ?? "k.hishihara@gmail.com",
		  message = commitMessage()

	return JSON.stringify({
		message, committer: { name, email }, content, sha
	})
}

const credentials = {
	user: localStorage.getItem("user"),
	repo: localStorage.getItem("repo"),
	token: localStorage.getItem("pat")
}

export { credentials, commitBody }