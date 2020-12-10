import React from "react"
import _ from "lodash"
import copy from "copy-to-clipboard"
import compileRegExp from "utils/compileRegExp"
import downloadJSON from "utils/downloadJSON"
import importCookies from "utils/importCookies"

const NODE_ENV = process.env.NODE_ENV
const ChromeContext = React.createContext ()

function createCookieKey ( cookie ) {
	return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
}

class ChromeProvider extends React.Component {

	constructor ( props ) {
		super ( props )
		const cachedIsDark = window.localStorage.getItem ("dark")
			? window.localStorage.getItem ("dark") === "true"
			: false
		this.state = {
			activeUrl: "",
			items: [],
			filtered: [],
			initialCookiesLoaded: false,
			options: {
				regexp: false,
				filtered: true,
				sensitive: false,
				dark: cachedIsDark,
				tooltips: true,
				showWarnings: true,
				contextMenu: true,
				expirationFormat: "humanized",
				sortType: "expirationDate",
				sortDirection: "ascending",
			},
			search: {
				term: "",
			},
			list: {
				block: {},
				protect: {},
			},
		}
	}

	filterCookies ( items ) {
		items = items ? items : this.state.items
		const { search: { term }, options: { sensitive, filtered, regexp } } = this.state
		const re = compileRegExp ( term, sensitive )
		if ( term === "" ) return items
		if ( regexp && !re ) return []
		if ( regexp && re && new RegExp ( re ).test ("") ) return items
		if ( regexp && re ) {
			return items.filter ( e => {
				return new RegExp ( re ).test (`${e.name}`) ||
				new RegExp ( re ).test (`${e.domain}${e.path}`) ||
				new RegExp ( re ).test (`${e.value}`)
			})
		}
		return items.filter ( e => {
			const nameTarget = sensitive ? e.name : e.name.toLowerCase ()
			const pathTarget = sensitive ? `${e.domain}${e.path}` : `${e.domain}${e.path}`.toLowerCase ()
			const valueTarget = sensitive ? e.value : e.value.toLowerCase ()
			const search = sensitive ? term : term.toLowerCase ()
			return false ||
				nameTarget.indexOf ( search ) > -1 ||
				pathTarget.indexOf ( search ) > -1 ||
				valueTarget.indexOf ( search ) > -1
		})
	}

	loadOptions ( callback = () => {} ) {
		chrome.storage.local.get (
			[ "regexp", "sensitive", "dark", "tooltips", "showWarnings", "contextMenu", "expirationFormat", "sortType", "sortDirection", "block", "protect" ],
			result => {
				window.localStorage.setItem ( "dark", result.dark !== undefined ? result.dark : false )
				this.setState ( state => ({
					options: {
						...state.options,
						regexp: result.regexp !== undefined ? result.regexp : false,
						sensitive: result.sensitive !== undefined ? result.sensitive : false,
						dark: result.dark !== undefined ? result.dark : false,
						contextMenu: result.contextMenu !== undefined ? result.contextMenu : true,
						tooltips: result.tooltips !== undefined ? result.tooltips : true,
						showWarnings: result.showWarnings !== undefined ? result.showWarnings : true,
						expirationFormat: result.expirationFormat !== undefined ? result.expirationFormat : "humanized",
						sortType: result.sortType !== undefined ? result.sortType : "expirationDate",
						sortDirection: result.sortDirection !== undefined ? result.sortDirection : "ascending",
					},
					list: {
						block: result.block !== undefined ? result.block : {},
						protect: result.protect !== undefined ? result.protect : {},
					}
				}), callback )
			}
		)
	}

	saveOptions ( callback = () => {} ) {
		const {
			options: { regexp, sensitive, dark, tooltips, showWarnings, contextMenu, expirationFormat, sortType, sortDirection },
			list: { block, protect }
		} = this.state
		chrome.storage.local.set ( { regexp, sensitive, dark, tooltips, showWarnings, contextMenu, expirationFormat, sortType, sortDirection, block, protect }, callback )
		window.localStorage.setItem ( "dark", dark )
	}

	loadCookies ( callback = () => {} ) {
		const { activeUrl, options: { filtered } } = this.state
		const isValidUrl = activeUrl && !/^chrome(-[a-z]+)?:\/\//m.test ( activeUrl )
		const filter = isValidUrl && filtered ? { url: activeUrl } : {}
		chrome.cookies.getAll ( filter, items => {
			this.setState ({
				initialCookiesLoaded: true,
				items: items,
				filtered: this.filterCookies ( items )
			}, callback )
		})
	}

	loadActiveTab ( callback = () => {} ) {
		chrome.tabs.query ({
			lastFocusedWindow: true,
			highlighted: true,
		}, tabs => {
			const url = _.get ( tabs, "[0].url", "chrome-ignore://" )
			if ( url && !/^chrome(-[a-z]+)?:\/\//m.test ( url ) ) {
				this.setState ({ activeUrl: url }, () => {
					this.loadCookies ( () =>
						this.setState ({
							filtered: this.filterCookies ()
						}, callback )
					)
				})
			}
			else {
				callback ()
			}
		})
	}

	componentDidMount () {
		chrome.windows.onFocusChanged.addListener ( () => this.loadActiveTab () )
		chrome.tabs.onHighlighted.addListener ( () => this.loadActiveTab () )
		chrome.tabs.onUpdated.addListener ( ( tab, { url } ) => url ? this.loadActiveTab () : null )
		chrome.cookies.onChanged.addListener ( () => this.loadCookies () )
		chrome.storage.onChanged.addListener ( () => this.loadOptions () )
		this.loadOptions ( () => this.loadActiveTab ( () => this.loadCookies () ) )
	}

	componentWillUnmount () {
		chrome.windows.onFocusChanged.removeListener ( () => this.loadActiveTab () )
		chrome.tabs.onHighlighted.removeListener ( () => this.loadActiveTab () )
		chrome.tabs.onUpdated.removeListener ( () => this.loadActiveTab () )
		chrome.cookies.onChanged.removeListener ( () => this.loadCookies () )
		chrome.storage.onChanged.removeListener ( () => this.loadOptions () )
	}

	render () {
		let value = {
			...this.state,
			loadCookies: this.loadCookies.bind ( this ),
			addBlock: cookie => {
				this.setState ( state => {
					state.list.block [createCookieKey ( cookie )] = cookie
					return state
				}, () => this.saveOptions () )
			},
			clearBlock: () => {
				this.setState ( state => {
					state.list.block = {}
					return state
				}, () => this.saveOptions () )
			},
			clearProtect: () => {
				this.setState ( state => {
					state.list.protect = {}
					return state
				}, () => this.saveOptions () )
			},
			removeBlock: cookie => {
				this.setState ( state => {
					delete state.list.block [createCookieKey ( cookie )]
					return state
				}, () => this.saveOptions () )
			},
			addProtect: cookie => {
				this.setState ( state => {
					state.list.protect [createCookieKey ( cookie )] = cookie
					return state
				}, () => this.saveOptions () )
			},
			removeProtect: cookie => {
				this.setState ( state => {
					delete state.list.protect [createCookieKey ( cookie )]
					return state
				}, () => this.saveOptions () )
			},
			setTerm: val => {
				this.setState (
					state => ({ search: { ...state.search, term: val } }),
					() => this.loadCookies ()
				)
			},
			setDark: val => {
				this.setState ( state => ({
					options: { ...state.options, dark: val }
				}), () => this.saveOptions () )
			},
			setContextMenu: val => {
				this.setState ( state => ({
					options: { ...state.options, contextMenu: val }
				}), () => this.saveOptions () )
			},
			setTooltips: val => {
				this.setState ( state => ({
					options: { ...state.options, tooltips: val }
				}), () => this.saveOptions () )
			},
			setShowWarnings: val => {
				this.setState ( state => ({
					options: { ...state.options, showWarnings: val }
				}), () => this.saveOptions () )
			},
			setRegExp: val => {
				this.setState (
					state => ({ options: { ...state.options, regexp: val } }),
					() => this.saveOptions ( () => this.loadCookies () )
				)
			},
			setFiltered: val => {
				this.setState (
					state => ({ options: { ...state.options, filtered: val } }),
					() => this.loadCookies ()
				)
			},
			setSensitive: val => {
				this.setState (
					state => ({ options: { ...state.options, sensitive: val } }),
					() => this.saveOptions ( () => this.loadCookies () )
				)
			},
			setExpirationFormat: val => {
				this.setState (
					state => ({ options: { ...state.options, expirationFormat: val } }),
					() => this.saveOptions ()
				)
			},
			setSortType: val => {
				this.setState (
					state => ({ options: { ...state.options, sortType: val } }),
					() => this.saveOptions ()
				)
			},
			setSortDirection: val => {
				this.setState (
					state => ({ options: { ...state.options, sortDirection: val } }),
					() => this.saveOptions ()
				)
			},
			copyCurl: val => {
				let url = this.state.activeUrl.replace ( /'/g, "\\'" )
				let cookies = this.state.filtered.map ( cookie => {
					let name = cookie.name.replace ( /"/g, '\\"' )
					let value = cookie.value.replace ( /"/g, '\\"' )
					return `${name}=${value}`
				})
				let command = `curl '${url}' -H "Cookie: ${cookies.join ("; ")}"`
				copy ( command )
			},
			import: importCookies,
			export: cookie => {
				const { filtered, activeUrl, options: { filtered: isFiltered } } = this.state
				const timestamp = Math.floor ( new Date ().getTime () / 1000 )
				if ( cookie ) {
					const hostname = cookie.domain.replace ( /^\./m, "" )
					downloadJSON ( `${cookie.name}-${hostname}-${timestamp}.json`, cookie )
				}
				else {
					const hostname = isFiltered && activeUrl ? new URL ( activeUrl ).hostname : "dump"
					downloadJSON ( `${hostname}-${timestamp}.json`, filtered )
				}
			},
			delete: cookie => {
				var cookies = cookie ? [ cookie ] : this.state.filtered
				for ( let cookie of cookies ) {
					chrome.cookies.remove ({
						name: cookie.name,
						storeId: cookie.storeId,
						url: `http${cookie.secure ? "s" : ""}://${cookie.domain.replace ( /^\./m, "" )}${cookie.path}`,
					})
				}
			},
			block: cookie => {
				var cookies = cookie ? [ cookie ] : this.state.filtered
				this.setState ( state => ({
					list: {
						...state.list,
						block: {
							...state.list.block,
							...cookies
								.filter ( e => !( createCookieKey ( e ) in this.state.list.protect ) )
								.reduce ( ( a, e ) => { a [createCookieKey ( e )] = e; return a }, {} )
						}
					}
				}), () => this.saveOptions ( () => {
					for ( let cookie of cookies ) {
						chrome.cookies.remove ({
							name: cookie.name,
							storeId: cookie.storeId,
							url: `http${cookie.secure ? "s" : ""}://${cookie.domain.replace ( /^\./m, "" )}${cookie.path}`,
						})
					}
				}))
			},
			protect: cookie => {
				var cookies = cookie ? [ cookie ] : this.state.filtered
				this.setState ( state => ({
					list: {
						...state.list,
						protect: {
							...state.list.protect,
							...cookies
								.filter ( e => !( createCookieKey ( e ) in this.state.list.block ) )
								.reduce ( ( a, e ) => { if ( createCookieKey ( e ) in a ) { console.log ( "ALREADY IN PROTECTED", e, a [ createCookieKey ( e ) ] ) }; a [createCookieKey ( e )] = e; return a }, {} )
						}
					}
				}), () => this.saveOptions () )
			},
			curl: cookie => {
				let url = this.state.url.replace ( /'/g, "\\'" )
				let cookies = this.state.cookies.map ( cookie => {
					let name = cookie.name.replace ( /"/g, '\\"' )
					let value = cookie.value.replace ( /"/g, '\\"' )
					return `${name}=${value}`
				})
				let command = `curl '${url}' -H "Cookie: ${cookies.join ("; ")}"`
				copy ( command )
			},
		}
		if ( NODE_ENV !== "production" ) {
			console.log ( "Chrome Provider:", value )
		}
		return <ChromeContext.Provider value={value} >
			{this.props.children}
		</ChromeContext.Provider>
	}

}

function withChrome ( Component ) {
	const name = `withChrome(${Component.displayName || Component.name})`
	const NewComponent = props => {
		const { wrappedComponentRef, ...remainingProps } = props
		return <ChromeContext.Consumer>
		{
			( value ) => <Component
				{...remainingProps}
				data={value}
				ref={wrappedComponentRef}
			/>
		}
		</ChromeContext.Consumer>
	}
	NewComponent.displayName = name;
	NewComponent.WrappedComponent = Component
	return NewComponent
}

module.exports = {
	withChrome,
	ChromeProvider: ChromeProvider,
	ChromeConsumer: ChromeContext.Consumer
}
