import * as fetch from "./fetch.js"
import { credentials, commitBody } from "./storage.js"

const getRepo = async () => {
	const data = await fetch.get(
		`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/`,
		credentials.token
	)
	return data
}

const getContents = async (path) => {
	const data = await fetch.get(
		`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/${path}`,
		credentials.token
	)
	return data
}

const putContents = async (path, body) => {
	console.log(commitBody())
	const data = await fetch.put(
		`https://api.github.com/repos/${credentials.user}/${credentials.repo}/contents/${path}`,
		credentials.token,
		commitBody()
	)
	return data
}


export {
	getRepo as get,
	getContents,
	putContents
}