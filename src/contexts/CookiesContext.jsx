import _ from "lodash"
import browser from "webextension-polyfill"
import Promise from "bluebird"
import React from "react"
import PropTypes from "prop-types"

const { Provider, Consumer } = React.createContext ()

class CookiesProvider extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = this.getDefaultState ()
	}

	componentDidMount () {
		browser.cookies.onChanged.addListener ( this.load.bind ( this ) )
		this.load ()
	}

	componentWillUnmount () {
		browser.cookies.onChanged.removeListener ( this.load.bind ( this ) )
	}

	componentDidUpdate ( prev ) {
		const termChanged = prev.search.term !== this.props.search.term
		const regexpChanged = prev.storage.data.regexp !== this.props.storage.data.regexp
		const sensitiveChanged = prev.storage.data.sensitive !== this.props.storage.data.sensitive
		const filteredChanged = prev.search.filtered !== this.props.search.filtered
		const focusChanged = prev.focus.last !== this.props.focus.last
		if ( termChanged || regexpChanged || sensitiveChanged || filteredChanged || focusChanged ) {
			this.load ()
		}
	}

	getDefaultState () {
		return {
			all: [],
			found: [],
			initialized: false,
		}
	}

	load () {
		const { search, storage, focus } = this.props
		const { filtered } = search
		const { last } = focus
		const params = ( last && filtered ) ? { url: last } : {}
		return browser.cookies
			.getAll ( params )
			.then ( cookies => {
				this.setState ({
					all: cookies,
					found: search.filter ( cookies ),
					initialized: true,
				})
			})
			.catch ( error => {
				console.error ( "Failed to load cookies:", error )
				this.setState ( this.getDefaultState () )
			})
	}

	hash ( cookie ) {
		return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
	}

	getUrl ( cookie ) {
		const proto = `http${cookie.secure ? "s" : ""}`
		return `${proto}://${cookie.domain.replace (/^\./, "")}${cookie.path}`
	}

	delete ( input ) {
		const cookies = input ? [ input ] : this.state.found
		return Promise.map ( cookies,
			cookie => browser.cookies.remove ({
				name: cookie.name,
				storeId: cookie.storeId,
				url: this.getUrl ( cookie ),
			})
		)
	}

	block ( input ) {
		const { storage } = this.props
		const { protect } = storage.data
		const cookies = input ? [ input ] : this.state.found
		const [ keys, values ] = _.unzip ( cookies
			.filter ( cookie => !( this.hash ( cookie ) in protect ) )
			.map ( cookie => [ this.hash ( cookie ), cookie ] )
		)
		return storage.add ( "block", keys, values )
			.then ( () => Promise.map ( cookies,
				cookie => browser.cookies.remove ({
					name: cookie.name,
					storeId: cookie.storeId,
					url: this.getUrl ( cookie ),
				})
			))
	}

	protect ( input ) {
		const { storage } = this.props
		const { block } = storage.data
		const cookies = input ? [ input ] : this.state.found
		const [ keys, values ] = _.unzip ( cookies
			.filter ( cookie => !( this.hash ( cookie ) in block ) )
			.map ( cookie => [ this.hash ( cookie ), cookie ] )
		)
		return storage.add ( "protect", keys, values )
	}

	curl () {
		const { last } = this.props.focus
		const { found } = this.state
		let url = last.replace ( /'/g, "\\'" )
		let cookies = found.map ( cookie => {
			let name = cookie.name.replace ( /"/g, '\\"' )
			let value = cookie.value.replace ( /"/g, '\\"' )
			return `${name}=${value}`
		})
		return `curl '${url}' -H "Cookie: ${cookies.join ("; ")}"`
	}

	export ( cookie ) {
		const { found } = this.state
		const { last } = this.props.focus
		const { filtered } = this.props.search
		const timestamp = Math.floor ( new Date ().getTime () / 1000 )
		const download = ( filename, json ) => {
			const node = document.createElement ("a")
			const data = encodeURIComponent ( JSON.stringify ( json, null, "\t" ) )
			node.setAttribute ( "href", "data:text/json;charset=utf-8," + data )
			node.setAttribute ( "download", filename )
			node.click ()
			node.remove ()
		}
		if ( cookie ) {
			const hostname = cookie.domain.replace ( /^\./m, "" )
			download ( `${cookie.name}-${hostname}-${timestamp}.json`, cookie )
		}
		else {
			const hostname = filtered && last ? new URL ( last ).hostname : "dump"
			download ( `${hostname}-${timestamp}.json`, found )
		}
	}

	import ( updateCount ) {
		return new Promise ( ( resolve, reject ) => {
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
								success += await this.set ( e )
									.then ( () => 1 )
									.catch ( () => 0 )
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
	}

	set ( cookie ) {
		return browser.cookies.set ({
			url: this.getUrl ( cookie ),
			domain: cookie.hostOnly ? undefined : cookie.domain,
			name: cookie.name,
			value: cookie.value,
			path: cookie.path,
			secure: cookie.sameSite === "no_restriction" ? true : cookie.secure,
			httpOnly: cookie.httpOnly,
			sameSite: cookie.sameSite,
			expirationDate: cookie.session ? undefined : cookie.expirationDate,
			storeId: cookie.storeId,
		})
	}

	render () {
		const value = {
			all: this.state.all,
			found: this.state.found,
			initialized: this.state.initialized,
			load: this.load.bind ( this ),
			hash: this.hash.bind ( this ),
			getUrl: this.getUrl.bind ( this ),
			delete: this.delete.bind ( this ),
			block: this.block.bind ( this ),
			protect: this.protect.bind ( this ),
			curl: this.curl.bind ( this ),
			import: this.import.bind ( this ),
			export: this.export.bind ( this ),
			set: this.set.bind ( this ),
		}
		if ( process.env.NODE_ENV !== "production" ) {
			console.log ( "Cookies Provider:", value )
		}
		return <Provider value={value} >
			{this.props.children}
		</Provider>
	}

}

CookiesProvider.propTypes = {
	storage: PropTypes.object.isRequired,
	focus: PropTypes.object.isRequired,
	search: PropTypes.object.isRequired,
}

function withCookies ( Component ) {
	const name = `withCookies(${Component.displayName || Component.name})`
	const NewComponent = props => {
		const { wrappedComponentRef, ...remainingProps } = props
		return <Consumer>
		{
			value => <Component
				{...remainingProps}
				cookies={value}
				ref={wrappedComponentRef}
			/>
		}
		</Consumer>
	}
	NewComponent.displayName = name;
	NewComponent.WrappedComponent = Component
	return NewComponent
}

module.exports = {
	withCookies,
	CookiesProvider: CookiesProvider,
	CookiesConsumer: Consumer
}
