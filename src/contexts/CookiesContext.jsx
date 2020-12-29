import _ from "lodash"
import browser from "webextension-polyfill"
import moment from "moment"
import utils from "utils/cookie"
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

	delete ( input ) {
		const cookies = input ? [ input ] : this.state.found
		return Promise.map ( cookies, cookie => utils.remove ( cookie ) )
	}

	block ( input ) {
		const { storage } = this.props
		const { protect } = storage.data
		const cookies = input ? [ input ] : this.state.found
		const [ keys, values ] = _.unzip ( cookies
			.filter ( cookie => !( utils.hash ( cookie ) in protect ) )
			.map ( cookie => [ utils.hash ( cookie ), cookie ] )
		)
		return storage.add ( "block", keys, values )
			.then ( () => Promise.map (
				cookies,
				cookie => utils.remove ( cookie )
			))
	}

	protect ( input ) {
		const { storage } = this.props
		const { block } = storage.data
		const cookies = input ? [ input ] : this.state.found
		const [ keys, values ] = _.unzip ( cookies
			.filter ( cookie => !( utils.hash ( cookie ) in block ) )
			.map ( cookie => [ utils.hash ( cookie ), cookie ] )
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
					reader.onload = e => {
						try {
							const raw = e.target.result
							var data = JSON.parse ( raw )
							if ( !Array.isArray ( data ) ) data = [ data ]
							const results = {
								current: 0,
								total: data.length,
								success: [],
								expired: [],
								failed: [],
							}
							return Promise.each ( data, cookie => {
								return utils.set ( cookie )
									.then ( () => {
										results.current++
										if ( !cookie.expirationDate || cookie.expirationDate > moment ().unix () ) {
											results.success.push ( cookie )
										}
										else {
											results.expired.push ( cookie )
										}
										return updateCount ( results )
									})
									.catch ( error => {
										console.error ( error )
										results.current++
										results.failed.push ( cookie )
										return updateCount ( results )
									})
							})
							.then ( () => resolve ( results ) )
							.catch ( error => reject ( error ) )
						}
						catch ( error ) {
							reject ( error )
						}
					}
					reader.onerror = error => reject ( error )
				}
				else {
					reject ("Could not load selected file! Please try again.")
				}
			})
			chooser.click ()
		})
	}

	render () {
		const value = {
			all: this.state.all,
			found: this.state.found,
			initialized: this.state.initialized,
			load: this.load.bind ( this ),
			hash: utils.hash,
			getUrl: utils.url,
			delete: this.delete.bind ( this ),
			block: this.block.bind ( this ),
			protect: this.protect.bind ( this ),
			curl: this.curl.bind ( this ),
			import: this.import.bind ( this ),
			export: this.export.bind ( this ),
			set: utils.set,
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
