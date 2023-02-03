import * as repo from "./repo.js"
import { credentials } from "./storage.js"
import { app } from "./ui.js"

const tree = () => {
	const anchors = document.querySelectorAll(".tree a")

	anchors.forEach(a => {
		a.addEventListener("click", async () => {
			const targetPath = a.getAttribute("data-name"),
				  currentPath = localStorage.getItem("path")
			const path = currentPath == "/"
				? targetPath
				: `${currentPath}/${targetPath}`

			localStorage.setItem("path", path)

			const data = await repo.getContents(path)
			if (!data.error) {
				app.reset()
				localStorage.setItem("sha", data.sha)

				if (data.length > 0) {
					app.load.folder(data), tree()
				} else {
					app.load.file(data)
				}
			}
		})
	})
}

const home = () => {
	const home = document.querySelector("#home-dir")

	home.addEventListener("click", async () => {
		localStorage.setItem("path", "/")

		const data = await repo.get()
		if (!data.error) {
			app.reset()
			app.load.folder(data)
			tree()
		}
	})
}

export { tree, home }