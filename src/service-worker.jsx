"use strict"

import browser from "webextension-polyfill"
import moment from "moment"
import utils from "utils/cookie"
import i18n from "utils/i18n"

function handleFirstInstall ({ reason }) {
	if ( reason === "install" )  {
		return setContextMenu ( true )
	}
	return Promise.resolve ()
}

function setContextMenu ( install ) {
	return browser.contextMenus.removeAll ().then ( () => {
		if ( install ) {
			return browser.storage.local.get ([ "locale" ]).then ( ({ locale }) => {
				const translate = i18n.getTranslator ( locale )
				return Promise.resolve ()
					.then ( () => browser.contextMenus.create ({
						id: "fullscreen",
						title: translate ("fullscreen"),
						type: "normal",
						contexts: [ "all" ],
					}))
					.then ( () => browser.contextMenus.create ({
						id: "options",
						title: translate ("options"),
						type: "normal",
						contexts: [ "all" ],
					}))
			})
		}
		return Promise.resolve ()
	})
}

function handleContextMenuClick ({ menuItemId }, tab ) {
	switch ( menuItemId ) {
		case "fullscreen": return browser.tabs.create ({ url: "/index.html" })
		case "options": return browser.runtime.openOptionsPage ()
	}
}

function log () {
	if ( process.env.NODE_ENV !== "production" ) {
		console.log ( ...arguments )
	}
}

function handleCookieChange ({ removed, cause, cookie }) {
	return browser.storage.local
	.get ([ "block", "protect", "updateProtectedValue" ])
	.then ( async ({ block, protect, updateProtectedValue }) => {
		if ( !block ) block = {}
		if ( !protect ) protect = {}
		const key = utils.hash ( cookie )
		if ( [ "explicit" ].includes ( cause ) ) {
			const maxAttention = 15
			const history = await browser.storage.local.get ([ "history" ]).then ( res => JSON.parse ( res.history || "[]" ) )
			history.unshift ( key )
			await browser.storage.local.set ({ "history": JSON.stringify ( history.slice ( 0, maxAttention ) ) })
			if ( history.length >= maxAttention && history.every ( e => e === key ) ) {
				log ("Action: Quiting to prevent infinite loop")
				return Promise.resolve ()
			}
			const today = moment ().unix ()
			const isBlocked = key in block
			const isProtected = key in protect
			const wroteWhenBlocked = !removed && isBlocked
			const wroteWhenProtected = !removed && isProtected
			const removedWhenProtected = removed && isProtected
			const changedWhenProtected = wroteWhenProtected && utils.serialize ( cookie ) !== utils.serialize ( protect [ key ] )
			const changedValueWhenProtected = wroteWhenProtected && cookie.value !== protect [ key ].value
			if ( wroteWhenBlocked ) {
				log ("Action: Removed cookie because blocked")
				return utils.remove ( cookie )
			}
			else if ( removedWhenProtected ) {
				log ("Action: Set cookie when removed because it is protected")
				return utils.set ( protect [ key ] )
			}
			else if ( isProtected && protect [ key ].expirationDate && protect [ key ].expirationDate < today ) {
				log ("Action: Set cookie because protected one expired already")
				const newProtect = { ...protect, [key]: cookie }
				return browser.storage.local
					.set ({ protect: newProtect })
					.then ( () => utils.remove ( cookie ) )
			}
			else if ( changedWhenProtected && updateProtectedValue && changedValueWhenProtected ) {
				log ("Action: Set cookie because value changed")
				const newCookie = { ...protect [ key ], value: cookie.value }
				const newProtect = { ...protect, [key]: newCookie }
				return browser.storage.local
					.set ({ protect: newProtect })
					.then ( () => utils.remove ( cookie ) )
			}
			else if ( changedWhenProtected ) {
				return utils.remove ( cookie )
			}
		}
	})
	.catch ( error => log ( error ) )
}

browser.runtime.onInstalled.addListener ( handleFirstInstall )
browser.contextMenus.onClicked.addListener ( handleContextMenuClick )
browser.cookies.onChanged.addListener ( handleCookieChange )

// Update badge text

function updateCookieCount ( url ) {
	if ( !url ) return browser.action.setBadgeText ({ text: "" })
	return browser.cookies.getAll ({ url }).then ( cookies => {
		const length = cookies.length < 1 ? "" : cookies.length.toString ()
		return browser.action.setBadgeText ({ text: length })
	})
}

browser.tabs.onActivated.addListener ( info => {
	browser.storage.local.get ([ "cookieCounterBadge" ]).then ( ({ cookieCounterBadge }) => {
		if ( !cookieCounterBadge ) return
		return browser.tabs
			.get ( info.tabId )
			.then ( tab => updateCookieCount ( tab.url ) )
	})
})

browser.tabs.onUpdated.addListener ( ( tabId, info, tab ) => {
	browser.storage.local.get ([ "cookieCounterBadge" ]).then ( ({ cookieCounterBadge }) => {
		if ( !cookieCounterBadge ) return
    	if ( info.url ) updateCookieCount ( info.url )
	})
})

browser.windows.onFocusChanged.addListener ( windowId => {
	if ( windowId === browser.windows.WINDOW_ID_NONE ) return
	browser.storage.local.get ([ "cookieCounterBadge" ]).then ( ({ cookieCounterBadge }) => {
		if ( !cookieCounterBadge ) return
		browser.tabs
			.query ({ active: true, windowId: windowId })
			.then ( tabs => updateCookieCount ( tabs[0]?.url ) )
	})
})
