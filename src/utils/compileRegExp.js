"use strict"

module.exports = ( pattern, sensitive ) => {
	try {
		const flags = sensitive ? "g" : "ig"
		return new RegExp ( pattern.replace ( /\\/g, "\\" ), flags )
	}
	catch ( error ) {
		return null
	}
}
