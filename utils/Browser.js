"use strict"

const Promise = require ("bluebird")
const puppeteer = require ("puppeteer")
const manifest = require ("../static/manifest.json")

function sleep ( ms ) {
	return new Promise ( resolve => {
		setTimeout ( resolve, ms )
	})
}

async function launch () {
	const browser = await puppeteer.launch ({
		headless: false,
		defaultViewport: null,
		ignoreDefaultArgs: [ "--enable-automation" ],
		executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		args: [
			`--start-maximized`,
			`--disable-extensions-except=./dist`,
			`--load-extension=./dist`,
		],
	})
	const temp = await browser.newPage ()
	const targets = await browser.targets ()
	const title = manifest.browser_action.default_title
	const target = targets.find ( ({ _targetInfo: e }) => e.title === title )
	const url = target._targetInfo.url || ""
	const [ , , id ] = url.split ("/")
	const template = `chrome-extension://${id}`
	const pages = browser.pages ()
	await Promise.map ( pages, page => page.close () )
	const page = await browser.newPage ()
	return { browser, page, template }
}

module.exports = async function ( callback ) {
	const { browser, page, template } = await launch ()
	return callback ({
		browser, page, sleep,
		goto ( path ) {
			return page.goto (`${template}/${path}`)
		},
		close () {
			return page.close ().then ( () => browser.close () )
		},
		storage ( data ) {
			return page.evaluate ( data => {
				return new Promise ( resolve =>
					chrome.storage.local.set ( data, resolve )
				)
			}, data )
		},
		screenshot () {
			return Promise.resolve ()
				.then ( () => page.evaluate ( () => {
					document.title = "🔴Waiting For Screenshot"
				}))
				.then ( () => sleep ( 1000 ) )
				.then ( () => page.screenshot ({ type: "png" }) )
		},
		cookies: {
			hash ( cookie ) {
				return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
			},
			withExpiration ( data ) {
				if ( !Array.isArray ( data ) ) data = [ data ]
				const expires = secs => Math.floor ( new Date ().getTime () / 1000 ) + secs
				return data.map ( cookie => {
					cookie.expirationDate = expires ( cookie.maxAge || 0 )
					delete cookie.maxAge
					return cookie
				})
			},
			set ( data ) {
				if ( !Array.isArray ( data ) ) data = [ data ]
				const url = c => `http${c.secure ? "s" : ""}://${c.domain.replace (/^\./, "")}${c.path}`
				data = this.withExpiration ( data ).map ( cookie => {
					cookie.url = url ( cookie )
					cookie.expires = cookie.expirationDate
					cookie.sameSite = cookie.sameSite
						.replace ("lax", "Lax")
						.replace ("strict", "Strict")
						.replace ("no_restriction", "None")
					delete cookie.storeId
					return cookie
				})
				return page.setCookie ( ...data )
			},
			protect ( data ) {
				if ( !Array.isArray ( data ) ) data = [ data ]
				data = data.reduce ( ( a, e ) => {
					a [ this.hash ( e ) ] = this.withExpiration ( e ).pop ()
					return a
				}, {} )
				return page.evaluate ( data => {
					chrome.storage.local.get ( ["protect"], ({ protect }) => {
						chrome.storage.local.set ({
							protect: Object.assign ( protect || {}, data ),
						})
					})
				}, data )
			},
			block ( data ) {
				if ( !Array.isArray ( data ) ) data = [ data ]
				data = data.reduce ( ( a, e ) => {
					a [ this.hash ( e ) ] = this.withExpiration ( e ).pop ()
					return a
				}, {} )
				return page.evaluate ( data => {
					chrome.storage.local.get ( ["block"], ({ block }) => {
						chrome.storage.local.set ({
							block: Object.assign ( block || {}, data ),
						})
					})
				}, data )
			},
		},
	})
}
