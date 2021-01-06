"use strict"

import browser from "webextension-polyfill"

function url ( cookie ) {
	const proto = `http${cookie.secure ? "s" : ""}`
	return `${proto}://${cookie.domain.replace (/^\./, "")}${cookie.path}`
}

function hash ( cookie ) {
	return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
}

function serialize ( cookie ) {
	return JSON.stringify ( cookie, Object.keys ( cookie ).sort () )
}

function remove ( cookie ) {
	return browser.cookies.remove ({
		url: url ( cookie ),
		name: cookie.name,
		storeId: cookie.storeId,
	})
}

function set ( cookie ) {
	return browser.cookies.set ({
		url: url ( cookie ),
		domain: cookie.hostOnly ? undefined : cookie.domain,
		name: cookie.name,
		value: cookie.value,
		path: cookie.path,
		secure: cookie.sameSite === "no_restriction" ? true : cookie.secure,
		httpOnly: cookie.httpOnly,
		sameSite: cookie.sameSite,
		expirationDate: cookie.session ? undefined : cookie.expirationDate,
		storeId: cookie.storeId,
	})
}

module.exports = {
	url,
	hash,
	serialize,
	remove,
	set,
}
