function getUrl ( cookie ) {
	const proto = `http${cookie.secure ? "s" : ""}`
	return `${proto}://${cookie.domain.replace (/^\./, "")}${cookie.path}`
}

function createCookieKey ( cookie ) {
	return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
}

function serialize ( cookie ) {
	return JSON.stringify ( cookie )
}

function loadContextMenu () {
	chrome.contextMenus.removeAll ( () => {
		chrome.storage.local.get ( [ "contextMenu" ], ({ contextMenu }) => {
			if ( contextMenu ) {
				chrome.contextMenus.create ({
					id: "fullscreen",
					title: "Fullscreen",
					type: "normal",
					contexts: [ "page" ],
				})
				chrome.contextMenus.create ({
					id: "options",
					title: "Options",
					type: "normal",
					contexts: [ "page" ],
				})
			}
		})
	})
}

function contextMenusOnClick ( { menuItemId }, tab ) {
	switch ( menuItemId ) {
		case "fullscreen": return chrome.tabs.create ({ url: "/index.html" })
		case "options": return chrome.tabs.create ({ url: "/options.html" })
	}
}

loadContextMenu ()
chrome.contextMenus.onClicked.addListener ( contextMenusOnClick )
chrome.storage.onChanged.addListener ( loadContextMenu )
chrome.cookies.onChanged.addListener ( function ({ removed, cause, cookie }) {
	chrome.storage.local.get ( [ "block", "protect" ], ({ block, protect }) => {
		const key = createCookieKey ( cookie )
		if ( [ "explicit" ].includes ( cause ) ) {
			if ( !removed && key in block ) {
				chrome.cookies.remove ({
					url: getUrl ( cookie ),
					name: cookie.name,
				})
			}
			else if ( ( removed && key in protect ) || ( !removed && serialize ( cookie ) !== serialize ( protect [ key ] ) ) ) {
				cookie = protect [ key ]
				chrome.cookies.set ({
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
