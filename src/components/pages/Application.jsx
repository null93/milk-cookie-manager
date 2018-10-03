import React from "react"

import Logo from "asset/images/logo.svg"
import NoneFound from "atom/NoneFound"
import Header from "orginism/Header"
import CookieList from "orginism/CookieList"
import CookieItem from "molecule/CookieItem"
import Editor from "orginism/Editor"
import Import from "orginism/Import"

export default class Application extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			url: null,
			domain: null,
			cookies: [],
			search_term: "",
			editor: false,
			importActive: false
		}
	}

	componentDidMount () {
		let that = this
		window.addEventListener ( "load", () => {
			that.loadCookies ()
			window.setInterval ( that.loadCookies.bind (that), 1000 )
		})
	}

	loadCookies () {
		let search_term = this.state.search_term.toLowerCase ()
		chrome.tabs.query ({ active: true, currentWindow: true }, ( tabs ) => {
			if ( tabs.length > 0 ) {
				let tab = tabs [ 0 ]
				this.state.url = new URL ( tab.url ).href
				this.state.domain = new URL ( tab.url ).hostname
					.split (".")
					.reverse ()
					.splice ( 0, 2 )
					.reverse ()
					.join (".")
				chrome.cookies.getAll ({ url: this.state.url }, ( cookies ) => {
					cookies = cookies.filter ( ( cookie ) => {
						return cookie.name.toLowerCase ().indexOf ( search_term ) > -1 ||
							cookie.value.toLowerCase ().indexOf ( search_term ) > -1 ||
							cookie.domain.toLowerCase ().indexOf ( search_term ) > -1 ||
							cookie.path.toLowerCase ().indexOf ( search_term ) > -1
					})
					cookies.sort ( ( a, b ) => {
						if ( a.domain === b.domain ) {
							return a.name.localeCompare ( b.name )
						}
						return a.domain.localeCompare ( b.domain )
					})
					this.setState ({ cookies: cookies })
				})
			}
		})
	}

	closeEditor () {
		this.setState ({ editor: false })
	}

	closeImport () {
		this.setState ({ importActive: false })
	}

	onCreateNew () {
		let url = new URL ( this.state.url )
		this.setState ({
			editor: {
				domain: "." + url.host,
				path: url.pathname,
				expirationDate: Math.round ( new Date ().getTime () / 1000 ) + 31536000
			}
		})
	}

	onDeleteAll () {
		for ( let cookie of this.state.cookies ) {
			chrome.cookies.remove ({
				name: cookie.name,
				storeId: cookie.storeId,
				url: this.state.url
			})
		}
		this.loadCookies ()
	}

	onCurl () {
		let url = this.state.url.replace ( /'/g, "\\'" )
		let cookies = this.state.cookies.map ( cookie => {
			let name = cookie.name.replace ( /"/g, '\\"' )
			let value = cookie.value.replace ( /"/g, '\\"' )
			return `${name}=${value}`
		})
		let command = `curl '${url}' -H "Cookie: ${cookies.join ("; ")}"`
		let element = document.createElement ("textarea")
		element.value = command
		element.style.visibility = "none"
		document.getElementsByClassName ("cookie-list") [0].appendChild ( element )
		element.select ()
		document.execCommand ("copy")
		element.remove ()
	}

	onImport () {
		this.setState ({ importActive: true })
	}

	onExport () {
		let node = document.createElement ("a")
		var data = JSON.stringify ( this.state.cookies, null, "\t" )
		data = encodeURIComponent ( data )
		node.setAttribute ( "href", "data:text/json;charset=utf-8," + data )
		node.setAttribute ( "download", `${this.state.domain}.json` )
		node.click ()
		node.remove ()
	}

	onHelp () {
		window.open ( "http://github.com/null93/chrome-cookie-jar", "_blank" )
	}

	onSearch ( value ) {
		this.state.search_term = value
		this.loadCookies ()
	}

	onItemClick ( cookie ) {
		this.setState ({
			editor: {
				name: cookie.name,
				domain: cookie.domain,
				path: cookie.path,
				value: cookie.value,
				expirationDate: cookie.expirationDate,
				sameSite: cookie.sameSite,
				hostOnly: cookie.hostOnly,
				httpOnly: cookie.httpOnly,
				secure: cookie.secure,
				session: cookie.session
			}
		})
	}

	render () {
		let editor
		let current = <NoneFound/>
		if ( this.state.cookies.length > 0 ) {
			current = <CookieList>
				{
					this.state.cookies.map ( ( cookie, index ) => <CookieItem
						key={`cookie-${index }`}
						data={cookie}
						term={this.state.search_term}
						onClick={this.onItemClick.bind ( this, cookie )} />
					)
				}
			</CookieList>
		}
		if ( this.state.importActive ) {
			editor = <Import
				onClose={this.closeImport.bind (this)}
			/>
		}
		else if ( this.state.editor ) {
			editor = <Editor
				url={this.state.url}
				name={this.state.editor.name}
				domain={this.state.editor.domain}
				path={this.state.editor.path}
				value={this.state.editor.value}
				expirationDate={this.state.editor.expirationDate}
				sameSite={this.state.editor.sameSite}
				hostOnly={this.state.editor.hostOnly}
				httpOnly={this.state.editor.httpOnly}
				secure={this.state.editor.secure}
				session={this.state.editor.session}
				onClose={this.closeEditor.bind (this)} />
		}
		else {
			editor = ""
		}
		return <div className="application" >
			<Header
				logo={Logo}
				disableExport={this.state.cookies.length < 1}
				disableDeleteAll={this.state.cookies.length < 1}
				onCreateNew={this.onCreateNew.bind (this)}
				onDeleteAll={this.onDeleteAll.bind (this)}
				onCurl={this.onCurl.bind (this)}
				onImport={this.onImport.bind (this)}
				onExport={this.onExport.bind (this)}
				onHelp={this.onHelp.bind (this)}
				onSearch={this.onSearch.bind (this)}
				deleteMenuItemName={`Delete Visible (${this.state.cookies.length})`}
			/>
			{current}
			{editor}
		</div>
	}

}
