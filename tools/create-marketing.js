"use strict"

const Promise = require ("bluebird")
const Chrome = require ("../utils/Chrome")
const cookies = require ("../data/marketing")
const jimp = require ("jimp")

return Chrome ( async chrome => await Promise.resolve ()
	.then ( () => chrome.goto ("index.html") )
	.then ( () => chrome.cookies.set ( cookies ) )
	.then ( () => chrome.cookies.protect ([ cookies [ 0 ], cookies [ 3 ] ]) )
	.then ( () => chrome.cookies.block ([ cookies [ 1 ], cookies [ 2 ], cookies [ 4 ] ]) )
	.then ( async () => ({
		template: await Promise.props ({
			panels: jimp.read ("assets/templates/template-panels.png"),
			github_banner: jimp.read ("assets/templates/template-github-banner.png"),
			large_promo_tile: jimp.read ("assets/templates/template-large-promo-tile.png"),
			small_promo_tile: jimp.read ("assets/templates/template-small-promo-tile.png"),
			marquee_promo_tile: jimp.read ("assets/templates/template-marquee-promo-tile.png"),
		}),
		light_panel_list: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 550, height: 530 }))
			.then ( () => chrome.goto ("index.html") )
			.then ( () => chrome.storage ({ regexp: false, dark: false }) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		dark_panel_list: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 550, height: 530 }))
			.then ( () => chrome.goto ("index.html") )
			.then ( () => chrome.storage ({ regexp: true, dark: true }) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		light_panel_list_highlight: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 550, height: 530 }))
			.then ( () => chrome.goto ("index.html") )
			.then ( () => chrome.storage ({ regexp: false, dark: false }) )
			.then ( () => chrome.page.type ( "#search", "example.com" ) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		dark_panel_list_highlight: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 550, height: 530 }))
			.then ( () => chrome.goto ("index.html") )
			.then ( () => chrome.storage ({ regexp: true, dark: true }) )
			.then ( () => chrome.page.type ( "#search", "^.?(example|blog)" ) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		dark_options_top: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 1280, height: 800 }))
			.then ( () => chrome.goto ("options.html") )
			.then ( () => chrome.storage ({ regexp: true, dark: true }) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		dark_options_bottom: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 1280, height: 800 }))
			.then ( () => chrome.goto ("options.html#blocked-cookies") )
			.then ( () => chrome.storage ({ regexp: true, dark: true }) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		light_panel_add: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 550, height: 530 }))
			.then ( () => chrome.goto ("index.html") )
			.then ( () => chrome.storage ({ regexp: true, dark: false }) )
			.then ( () => chrome.page.click ("#create-new") )
			.then ( () => chrome.page.type ( "input[name='domain']", "example.com" ) )
			.then ( () => chrome.page.type ( "input[name='value']", "d29vdCwgeW91IGZpZ3VyZWQgaXQgb3V0IQ==" ) )
			.then ( () => chrome.page.type ( "input[name='name']", "modern_cookie_manager" ) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
		dark_panel_add: await Promise.resolve ()
			.then ( () => chrome.page.setViewport ({ width: 550, height: 530 }))
			.then ( () => chrome.goto ("index.html") )
			.then ( () => chrome.storage ({ regexp: true, dark: true }) )
			.then ( () => chrome.page.click ("#create-new") )
			.then ( () => chrome.page.type ( "input[name='domain']", "example.com" ) )
			.then ( () => chrome.page.type ( "input[name='value']", "d29vdCwgeW91IGZpZ3VyZWQgaXQgb3V0IQ==" ) )
			.then ( () => chrome.page.type ( "input[name='name']", "modern_cookie_manager" ) )
			.then ( () => chrome.page.screenshot ({ type: "png" }) )
			.then ( image => jimp.read ( image ) ),
	}))
	.then ( ({ template, ...screenshot }) => {
		// screenshot-1.png
		template.panels.composite ( screenshot.light_panel_list.resize ( 550, jimp.AUTO ), 65, 205 )
		template.panels.composite ( screenshot.dark_panel_list_highlight.resize ( 550, jimp.AUTO ), 665, 205 )
		template.panels.writeAsync ("assets/images/screenshot-1.png")
		// screenshot-2.png
		template.panels.composite ( screenshot.light_panel_add.resize ( 550, jimp.AUTO ), 65, 205 )
		template.panels.composite ( screenshot.dark_panel_add.resize ( 550, jimp.AUTO ), 665, 205 )
		template.panels.writeAsync ("assets/images/screenshot-2.png")
		// screenshot-3.png
		screenshot.dark_options_top.writeAsync ("assets/images/screenshot-3.png")
		// screenshot-4.png
		screenshot.dark_options_bottom.writeAsync ("assets/images/screenshot-4.png")
		// github-banner.png
		template.github_banner.composite ( screenshot.light_panel_list_highlight.resize ( 550, jimp.AUTO ), 65, 205 )
		template.github_banner.composite ( screenshot.dark_panel_add.resize ( 550, jimp.AUTO ), 665, 205 )
		template.github_banner.writeAsync ("assets/images/github-banner.png")
		// large-promo-tile.png
		template.large_promo_tile.composite ( screenshot.dark_panel_add.resize ( 550, jimp.AUTO ), 310, 75 )
		template.large_promo_tile.writeAsync ("assets/images/large-promo-tile.png")
		// small-promo-tile.png
		template.small_promo_tile.composite ( screenshot.dark_panel_add.resize ( 391, 377 ), 24, 140 )
		template.small_promo_tile.writeAsync ("assets/images/small-promo-tile.png")
		// marquee-promo-tile.png
		template.marquee_promo_tile.composite ( screenshot.light_panel_list_highlight.resize ( 530, 510 ), 290, 25 )
		template.marquee_promo_tile.composite ( screenshot.dark_panel_add.resize ( 530, 510 ), 845, 25 )
		template.marquee_promo_tile.writeAsync ("assets/images/marquee-promo-tile.png")
	})
	// .then ( () => chrome.page.waitForNavigation () )
	.then ( () => chrome.close () )
	.catch ( error => {
		console.error ( error )
		return chrome.close ()
	})
)
