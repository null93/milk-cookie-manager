"use strict"

import browser from "webextension-polyfill"
import utils from "utils/cookie"

function enableContextMenu () {
	return browser.contextMenus.removeAll ()
		.then ( () => browser.contextMenus.create ({
			id: "fullscreen",
			title: "Fullscreen",
			type: "normal",
			contexts: [ "all" ],
		}))
		.then ( () => browser.contextMenus.create ({
			id: "options",
			title: "Options",
			type: "normal",
			contexts: [ "all" ],
		}))
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
		case "options": return browser.runtime.openOptionsPage ()
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
			const key = utils.hash ( cookie )
			if ( [ "explicit" ].includes ( cause ) ) {
				const isCreatedWhenBlocked = !removed && key in block
				const isRemovedWhenProtected = removed && key in protect
				const isUpdatedWhenProtected = !removed
					&& key in protect
					&& utils.serialize ( cookie ) !== utils.serialize ( protect [ key ] )
				if ( isCreatedWhenBlocked ) {
					return browser.cookies.remove ({
						url: utils.url ( cookie ),
						name: cookie.name,
					})
				}
				else if ( isRemovedWhenProtected || isUpdatedWhenProtected ) {
					cookie = protect [ key ]
					return browser.cookies.set ({
						url: utils.url ( cookie ),
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
