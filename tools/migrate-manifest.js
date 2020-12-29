"use strict"

const fs = require ("fs")

if ( process.argv.length === 4 ) {
	const input = process.argv [ 2 ]
	const output = process.argv [ 3 ]
	const manifest = JSON.parse ( fs.readFileSync ( input ) )
	// Use manifest v3
	manifest.manifest_version = 3
	// Chrome 88 is required for manifest v3 service workers
	manifest.minimum_chrome_version = "88"
	// host_permissions are now not inside permissions
	manifest.host_permissions = [ "http://*/*", "https://*/*" ]
	manifest.permissions = manifest.permissions.filter ( p => !["http://*/*", "https://*/*"].includes ( p ) )
	// browser_action was renamed and combined with page_action
	manifest.action = manifest.browser_action
	delete manifest.browser_action
	// Use service worker instead
	manifest.background = {
		service_worker: "service-worker.js"
	}
	// CSP is more granularly defined
	manifest.content_security_policy = {
		extension_pages: manifest.content_security_policy.replace (" 'unsafe-eval'", "")
	}
	// Output results and write to output file
	const result = JSON.stringify ( manifest, null, 4 )
	console.log ( result )
	fs.writeFileSync ( output, result, "utf-8" )
}
else {
	console.error ("Error: please refer to example usage below.\n")
	console.error ("$ node tools/migrate-manifest.js input.json output.json\n")
}
