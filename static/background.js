"use strict"

function getUrl ( cookie ) {
	const proto = `http${cookie.secure ? "s" : ""}`
	return `${proto}://${cookie.domain.replace (/^\./, "")}${cookie.path}`
}

function hash ( cookie ) {
	return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
}

function serialize ( cookie ) {
	return JSON.stringify ( cookie )
}

function enableContextMenu () {
	return browser.contextMenus
		.removeAll ()
		.then ( () => Promise.all ([
			browser.contextMenus.create ({
				id: "fullscreen",
				title: "Fullscreen",
				type: "normal",
				contexts: [ "page" ],
			}),
			browser.contextMenus.create ({
				id: "options",
				title: "Options",
				type: "normal",
				contexts: [ "page" ],
			}),
		]))
}

function loadContextMenu () {
	return browser.storage.local
		.get ([ "contextMenu" ])
		.then ( ({ contextMenu }) => {
			if ( contextMenu === undefined || contextMenu === true ) {
				return enableContextMenu ()
			}
			else {
				return browser.contextMenus.removeAll ()
			}
		})
}

function contextMenusOnClick ( { menuItemId }, tab ) {
	switch ( menuItemId ) {
		case "fullscreen": return browser.tabs.create ({ url: "/index.html" })
		case "options": return browser.tabs.create ({ url: "/options.html" })
	}
}

loadContextMenu ()
browser.runtime.onInstalled.addListener ( ({ reason }) => reason === "install" ? enableContextMenu () : null )
browser.contextMenus.onClicked.addListener ( contextMenusOnClick )
browser.storage.onChanged.addListener ( loadContextMenu )
browser.cookies.onChanged.addListener ( ({ removed, cause, cookie }) => {
	return browser.storage.local
		.get ([ "block", "protect" ])
		.then ( ({ block, protect }) => {
			if ( !block ) block = {}
			if ( !protect ) protect = {}
			const key = hash ( cookie )
			if ( [ "explicit" ].includes ( cause ) ) {
				const isCreatedWhenBlocked = !removed && key in block
				const isRemovedWhenProtected = removed && key in protect
				const isUpdatedWhenProtected = !removed
					&& key in protect
					&& serialize ( cookie ) !== serialize ( protect [ key ] )
				if ( isCreatedWhenBlocked ) {
					return browser.cookies.remove ({
						url: getUrl ( cookie ),
						name: cookie.name,
					})
				}
				else if ( isRemovedWhenProtected || isUpdatedWhenProtected ) {
					cookie = protect [ key ]
					return browser.cookies.set ({
						url: getUrl ( cookie ),
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
			}
		})
})
