"use strict"

module.exports = ( filename, json ) => {
	const node = document.createElement ("a")
	const data = encodeURIComponent ( JSON.stringify ( json, null, "\t" ) )
	node.setAttribute ( "href", "data:text/json;charset=utf-8," + data )
	node.setAttribute ( "download", filename )
	node.click ()
	node.remove ()
}
