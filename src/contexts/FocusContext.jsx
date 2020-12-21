import _ from "lodash"
import browser from "webextension-polyfill"
import React from "react"

const { Provider, Consumer } = React.createContext ()

class FocusProvider extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = this.getDefaultState ()
	}

	getDefaultState () {
		return {
			window: -1,
			tab: -1,
			url: null,
			last: null,
			domain: null,
			path: null,
		}
	}

	isValidUrl ( url ) {
		return !!url && !/^(chrome|moz)(-[a-z]+)?:\/\//m.test ( url )
	}

	getLast ( url = "chrome-ignore://" ) {
		const { last } = this.state
		if ( this.isValidUrl ( url ) ) {
			return url
		}
		return last
	}

	getDomain ( url = "chrome-ignore://" ) {
		const validated = this.getLast ( url )
		return validated ? _.get ( new URL ( validated ), "hostname" ) : null
	}

	getPath ( url = "chrome-ignore://" ) {
		const validated = this.getLast ( url )
		return validated ? _.get ( new URL ( validated ), "pathname" ) : null
	}

	onWindowFocusChanged ( windowId ) {
		return browser.tabs.query ({
			lastFocusedWindow: true,
			highlighted: true,
		})
		.then ( tabs => {
			const tab = tabs.shift ()
			this.setState ({
				window: tab.windowId,
				tab: tab.id,
				url: tab.url,
				last: this.getLast ( tab.url ),
				domain: this.getDomain ( tab.url ),
				path: this.getPath ( tab.url ),
			})
		})
		.catch ( error => {
			console.error ( "Failed to query last tab:", error )
			this.setState ( this.getDefaultState () )
		})
	}

	onTabHighlighted ({ tabIds, windowId }) {
		const tabId = tabIds.shift ()
		if ( windowId !== this.state.windowId || tabId !== this.state.tab ) {
			return browser.tabs.query ({
				lastFocusedWindow: true,
				highlighted: true,
			})
			.then ( tabs => {
				const tab = tabs.shift ()
				this.setState ({
					window: tab.windowId,
					tab: tab.id,
					url: tab.url,
					last: this.getLast ( tab.url ),
					domain: this.getDomain ( tab.url ),
					path: this.getPath ( tab.url ),
				})
			})
			.catch ( error => {
				console.error ( "Failed to query last tab:", error )
				this.setState ( this.getDefaultState () )
			})
		}
		return Promise.resolve ()
	}

	onTabUpdated ( tabId, { url, tabStatus }, tab ) {
		if ( url ) {
			if ( tab.windowId !== this.state.windowId || tabId !== this.state.tab ) {
				this.setState ({
					window: tab.windowId,
					tab: tabId,
					url: url,
					last: this.getLast ( url ),
					domain: this.getDomain ( url ),
					path: this.getPath ( url ),
				})
			}
		}
	}

	componentDidMount () {
		browser.windows.onFocusChanged.addListener ( this.onWindowFocusChanged.bind ( this ) )
		browser.tabs.onHighlighted.addListener ( this.onTabHighlighted.bind ( this ) )
		browser.tabs.onUpdated.addListener ( this.onTabUpdated.bind ( this ) )
		this.onWindowFocusChanged ()
	}

	componentWillUnmount () {
		browser.windows.onFocusChanged.addListener ( this.onWindowFocusChanged.bind ( this ) )
		browser.tabs.onHighlighted.addListener ( this.onTabHighlighted.bind ( this ) )
		browser.tabs.onUpdated.addListener ( this.onTabUpdated.bind ( this ) )
	}

	render () {
		const value = {
			window: this.state.window,
			tab: this.state.tab,
			url: this.state.url,
			last: this.state.last,
			domain: this.state.domain,
			path: this.state.path,
			isValidUrl: this.isValidUrl.bind ( this ),
		}
		if ( process.env.NODE_ENV !== "production" ) {
			console.log ( "Focus Provider:", value )
		}
		return <Provider value={value} >
			{this.props.children}
		</Provider>
	}

}

function withFocus ( Component ) {
	const name = `withFocus(${Component.displayName || Component.name})`
	const NewComponent = props => {
		const { wrappedComponentRef, ...remainingProps } = props
		return <Consumer>
		{
			value => <Component
				{...remainingProps}
				focus={value}
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
	withFocus,
	FocusProvider: FocusProvider,
	FocusConsumer: Consumer
}
