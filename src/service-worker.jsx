"use strict"

import browser from "webextension-polyfill"
import moment from "moment"
import utils from "utils/cookie"

function handleFirstInstall ({ reason }) {
	if ( reason === "install" )  {
		return setContextMenu ( true )
	}
	return Promise.resolve ()
}

function setContextMenu ( install ) {
	const items = () => Promise.resolve ()
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
	return browser.contextMenus.removeAll ()
		.then ( () => install ? items () : null )
}

function checkContextMenuOption () {
	return browser.storage.local.get ([ "contextMenu" ])
		.then ( ({ contextMenu }) => {
			const shouldInstall = contextMenu === undefined || contextMenu === true
			return setContextMenu ( shouldInstall )
		})
}

function handleContextMenuClick ({ menuItemId }, tab ) {
	switch ( menuItemId ) {
		case "fullscreen": return browser.tabs.create ({ url: "/index.html" })
		case "options": return browser.runtime.openOptionsPage ()
	}
}

function handleCookieChange ({ removed, cause, cookie }) {
	return browser.storage.local
	.get ([ "block", "protect" ])
	.then ( ({ block, protect }) => {
		if ( !block ) block = {}
		if ( !protect ) protect = {}
		const key = utils.hash ( cookie )
		if ( [ "explicit" ].includes ( cause ) ) {
			const isBlocked = key in block
			const isProtected = key in protect
			const isCreatedWhenBlocked = !removed && isBlocked
			const isCreatedWhenProtected = !removed && isProtected
			const isRemovedWhenProtected = removed && isProtected
			if ( isCreatedWhenBlocked ) {
				return utils.remove ( cookie )
			}
			else if ( isRemovedWhenProtected || isCreatedWhenProtected ) {
				const today = moment ().unix ()
				const replace = protect [ key ]
				if ( replace.expirationDate && replace.expirationDate > today ) {
					cookie = replace
				}
				return utils.set ( cookie )
			}
		}
	})
}

browser.runtime.onInstalled.addListener ( handleFirstInstall )
browser.storage.onChanged.addListener ( checkContextMenuOption )
browser.contextMenus.onClicked.addListener ( handleContextMenuClick )
browser.cookies.onChanged.addListener ( handleCookieChange )

checkContextMenuOption ()
