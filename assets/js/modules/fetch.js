const parseError = (error, json) => {
	return {
		error: true,
		status: error.status,
		statusText: error.statusText,
		message: json.message
	}
}

const get = async (url, token) => {
	const headers = new Headers({
		"Accept": "application/vnd.github+json",
		"Authorization": `Bearer ${token}`
	})
	const response = await fetch(url, {method: "GET", headers})
	if (response.ok) {
		return await response.json()
	} else {
		return parseError(response, await response.json())
	}
}

const put = async (url, token, body) => {
	const headers = new Headers({
		"Accept": "application/vnd.github+json",
		"Authorization": `Bearer ${token}`
	})
	const response = await fetch(url, {method: "PUT", headers, body: body})
	if (response.ok) {
		return await response.json()
	} else {
		return parseError(response, await response.json())
	}
}

export { get, put }