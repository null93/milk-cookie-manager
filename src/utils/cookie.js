"use strict"

module.exports = {
	url ( cookie ) {
		const proto = `http${cookie.secure ? "s" : ""}`
		return `${proto}://${cookie.domain.replace (/^\./, "")}${cookie.path}`
	},
	hash ( cookie ) {
		return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
	},
	serialize ( cookie ) {
		return JSON.stringify ( cookie )
	},
}
