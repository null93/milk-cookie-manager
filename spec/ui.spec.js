"use strict"

const Promise = require ("bluebird")
const Browser = require ("../utils/Browser")
const assert = require ("assert")

describe ( "User Interface", function () {

	this.timeout ( 2E5 )

	describe ( "Search", function () {
		it ( "Can type in search box", function () {
			return Browser ( async chrome => await Promise.resolve ()
				.then ( () => chrome.goto ( "index.html" ) )
				.then ( () => chrome.page.type ( "#search", "Hello World" ) )
				.then ( () => chrome.page.$("#search") )
				.then ( el => assert.ok ( el, "Could not type in search box" ) )
				.then ( () => chrome.close () )
			)
		})
		// it ( "Can search with case-sensitive regular search", () => assert.equal ( true, false ) )
		// it ( "Can search with case-insensitive regular search", () => assert.equal ( true, false ) )
		// it ( "Can search with case-sensitive regexp search", () => assert.equal ( true, false ) )
		// it ( "Can search with case-insensitive regexp search", () => assert.equal ( true, false ) )
	})

	// describe ( "Cookies", function () {
	// 	it ( "Will disappears when expires", function () {})
	// 	it ( "Will export cookies correctly", function () {})
	// 	it ( "Will import cookies correctly", function () {})
	// })
	//
	// describe ( "Create", function () {
	// 	it ( "", function () {})
	// })
	//
	// describe ( "Delete", function () {
	// 	it ( "", function () {})
	// })
	//
	// describe ( "Protect", function () {
	// 	it ( "", function () {})
	// })
	//
	// describe ( "Block", function () {
	// 	it ( "", function () {})
	// })

})
