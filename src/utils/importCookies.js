"use strict"

import _ from "lodash"

function getUrl ( cookie ) {
	const proto = `http${cookie.secure ? "s" : ""}`
	return `${proto}://${cookie.domain.replace (/^\./, "")}${cookie.path}`
}

function setCookie ( cookie ) {
	return new Promise ( resolve => {
		try {
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
			}, response => {
				resolve ( 1 )
			})
		}
		catch ( error ) {
			resolve ( 0 )
		}
	})
}

module.exports = updateCount => new Promise ( ( resolve, reject ) => {
	const chooser = document.createElement ("input")
	chooser.type = "file"
	chooser.accept = "application/json"
	chooser.addEventListener ( "change", () => {
		const file = chooser.files [ 0 ]
		if ( file ) {
			const reader = new FileReader ()
			reader.readAsText ( file, "UTF-8" )
			reader.onload = async e => {
				const raw = e.target.result
				var data = JSON.parse ( raw )
				if ( !Array.isArray ( data ) ) data = [ data ]
				let total = data.length
				let success = 0
				await data.reduce (
					( a, e, i ) => a.then ( async () => {
						success += await setCookie ( e )
						updateCount ({ current: i, success, total })
						return Promise.resolve ()
					}),
					Promise.resolve ()
				)
				resolve (`Successfully imported ${success}/${total} cookies.`)
			}
			reader.onerror = e => reject ("Could not load selected file! Please try again.")
		}
		else {
			reject ("Could not load selected file! Please try again.")
		}
	})
	chooser.click ()
})
